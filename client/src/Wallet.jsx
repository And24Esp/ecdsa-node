import server from "./server";
import { keccak256 } from "ethereum-cryptography/keccak";
import { hexToBytes, toHex } from "ethereum-cryptography/utils";
import * as secp from "ethereum-cryptography/secp256k1";

// Phase 2: we derive the wallet address from a private key instead of trusting a user-entered label.
function privateKeyToAddress(privateKey) {
  const sanitizedKey = privateKey.startsWith("0x") ? privateKey.slice(2) : privateKey;

  if (!/^[0-9a-fA-F]{64}$/.test(sanitizedKey)) {
    return "";
  }

  const publicKey = secp.getPublicKey(hexToBytes(`0x${sanitizedKey}`));
  return `0x${toHex(keccak256(publicKey.slice(1))).slice(-40)}`;
}

function Wallet({ address, setAddress, balance, setBalance, privateKey, setPrivateKey }) {
  async function onPrivateKeyChange(evt) {
    const nextPrivateKey = evt.target.value.trim();
    setPrivateKey(nextPrivateKey);

    const nextAddress = privateKeyToAddress(nextPrivateKey);
    setAddress(nextAddress);

    if (nextAddress) {
      const {
        data: { balance },
      } = await server.get(`balance/${nextAddress}`);
      setBalance(balance);
    } else {
      setBalance(0);
    }
  }

  return (
    <div className="container wallet">
      <h1>Your Wallet</h1>

      <label>
        Private Key
        <input
          placeholder="Paste a 64-character private key"
          value={privateKey}
          onChange={onPrivateKeyChange}
        ></input>
      </label>

      <label>
        Wallet Address
        <input placeholder="Derived from your private key" value={address} readOnly></input>
      </label>

      <div className="balance">Balance: {balance}</div>
    </div>
  );
}

export default Wallet;
