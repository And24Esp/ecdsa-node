const express = require("express");
const app = express();
const cors = require("cors");
const secp = require("ethereum-cryptography/secp256k1");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { hexToBytes, toHex } = require("ethereum-cryptography/utils");
const port = 3042;

app.use(cors());
app.use(express.json());

// Phase 2: use real key pairs instead of dummy strings like "0x1" and "0x2".
// We derive a wallet address from each private key so the server can check ownership.
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
  const { sender, recipient, amount, privateKey } = req.body;

  if (!privateKey) {
    return res.status(400).send({ message: "A private key is required to authorize this transfer." });
  }

  const expectedSender = privateKeyToAddress(privateKey);

  if (expectedSender.toLowerCase() !== sender.toLowerCase()) {
    return res.status(400).send({ message: "The private key does not match the sender address." });
  }

  setInitialBalance(sender);
  setInitialBalance(recipient);

  const transferAmount = Number(amount);

  if (Number.isNaN(transferAmount) || transferAmount <= 0) {
    return res.status(400).send({ message: "Transfer amount must be a positive number." });
  }

  if (balances[sender] < transferAmount) {
    return res.status(400).send({ message: "Not enough funds!" });
  }

  balances[sender] -= transferAmount;
  balances[recipient] += transferAmount;
  res.send({ balance: balances[sender] });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

function privateKeyToAddress(privateKey) {
  const sanitizedKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  const publicKey = secp.getPublicKey(hexToBytes(`0x${sanitizedKey}`));

  // Ethereum-style addresses keep the last 20 bytes from the Keccak hash of the public key.
  return `0x${toHex(keccak256(publicKey.slice(1))).slice(-40)}`;
}
