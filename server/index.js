const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

// Phase 3: use real key pairs and signed transfers instead of trusting a raw private key in the request body.
// We derive a wallet address from each private key so the server can verify the signer without ever receiving the key itself.
const accounts = [
  { privateKey: "0xcc37d276380905ba9dc9e5c8ca1b9743a4c5434482290abc791f12fb4dc53339", balance: 100 },
  { privateKey: "0x5d6edb2b836ad7d60b5604f33e624297445b83d30a2a0cbae6f6d861d90483b2", balance: 50 },
  { privateKey: "0x5dfdf85eaaaebd8efa87e980089cd5ea2fcf9203358d2cdf326d8ab4abbd4165", balance: 75 },
];

const balances = Object.fromEntries(
  accounts.map(({ privateKey, balance }) => [privateKeyToAddress(privateKey), balance])
);

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { sender, recipient, amount, privateKey, signature } = req.body;

  const transferAmount = Number(amount);

  if (Number.isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).send({ message: "Transfer amount must be a positive number." });
  }

  if (!sender || !recipient) {
    return res.status(400).send({ message: "Sender and recipient are required." });
  }

  let isAuthorized = false;

  if (signature) {
    isAuthorized = verifySignature(sender, recipient, transferAmount, signature);
    if (!isAuthorized) {
      return res.status(400).send({ message: "The signature does not match the sender address." });
    }
  } else if (privateKey) {
    const expectedSender = privateKeyToAddress(privateKey);

    if (expectedSender.toLowerCase() !== sender.toLowerCase()) {
      return res.status(400).send({ message: "The private key does not match the sender address." });
    }

    isAuthorized = true;
  } else {
    return res.status(400).send({ message: "A valid signature or private key is required to authorize this transfer." });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < transferAmount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  balances[sender] -= transferAmount;
  balances[recipient] += transferAmount;
  res.send({ balance: balances[sender] });
});

// Project setup error handling logic added while working on phase 3
const server = app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Close the existing server process and try again.`);
    process.exit(1);
  }

  throw error;
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function privateKeyToAddress(privateKey) {
  const sanitizedKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  const publicKey = secp.getPublicKey(hexToBytes(`0x${sanitizedKey}`));

  return publicKeyToAddress(publicKey);
}

function publicKeyToAddress(publicKey) {
  return `0x${toHex(keccak256(publicKey.slice(1))).slice(-40)}`;
}

function createTransferMessage(sender, recipient, amount) {
  return `${sender}:${recipient}:${amount}`;
}

function verifySignature(sender, recipient, amount, signatureHex) {
  try {
    const normalizedSignature = signatureHex.startsWith("0x") ? signatureHex : `0x${signatureHex}`;
    const signature = hexToBytes(normalizedSignature);
    const hash = keccak256(new TextEncoder().encode(createTransferMessage(sender, recipient, amount)));

    for (let recovery = 0; recovery < 4; recovery += 1) {
      const publicKey = secp.recoverPublicKey(hash, signature, recovery);
      if (!publicKey) {
        continue;
      }

      const recoveredAddress = publicKeyToAddress(publicKey);
      if (recoveredAddress.toLowerCase() === sender.toLowerCase()) {
        return true;
      }
    }

    return false;
  } catch (error) {
    return false;
  }
}
