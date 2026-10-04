import { useState } from "react";
import { keccak256 } from "ethereum-cryptography/keccak";
import { hexToBytes, toHex } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";
import server from "./server";

function createTransferMessage(sender, recipient, amount) {
  return `${sender}:${recipient}:${amount}`;
}

//Phase 3: Added transaction signing to the client transfer flow. Imported keccak, utils, and secp256k1 for the purpose.
function signTransfer(privateKey, sender, recipient, amount) {
  const sanitizedPrivateKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;
  const messageHash = keccak256(
    new TextEncoder().encode(createTransferMessage(sender, recipient, amount))
  );
  const signature = secp.signSync(messageHash, hexToBytes(`0x${sanitizedPrivateKey}`));

  return `0x${toHex(signature)}`;
}

function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();

    if (!address || !privateKey) {
      alert("Enter a valid private key first to derive your wallet address.");
      return;
    }

    // Added a validator while doing pahse 3.
    const amount = parseInt(sendAmount, 10);

    if (Number.isNaN(amount) || amount <= 0) {
      alert("Please enter a valid transfer amount.");
      return;
    }

    try {
      const signature = signTransfer(privateKey, address, recipient, amount);
      const {
        data: { balance },
      } = await server.post("send", {
        sender: address,
        recipient,
        amount,
        signature,
      });
      setBalance(balance);
    } catch (ex) {
      alert(ex.response?.data?.message || "Transfer failed.");
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x5e2d..."
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
