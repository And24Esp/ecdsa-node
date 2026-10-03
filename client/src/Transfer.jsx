import { useState } from "react";
import server from "./server";

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

    try {
      const {
        data: { balance },
      } = await server.post("send", {
        sender: address,
        recipient,
        amount: parseInt(sendAmount, 10),
        privateKey,
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
