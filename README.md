## Phase 3 Implementation Summary

This project was updated to match the phase 3 goal described above: the client no longer sends a raw private key to the server as part of a transfer request. Instead, it signs the transfer data locally and sends the signature only. The backend then reconstructs the signed message, recovers the public key from the signature, derives the wallet address from that key, and checks whether it matches the sender address before allowing the transfer.

This is the next step in the security progression because it separates authentication from secret handling. A private key never needs to live in the request body, and the server can verify ownership purely from the cryptographic proof. In other words, the user proves they own the wallet by producing a valid signature over the transaction data, not by revealing the secret itself.

Implemented that model in the app by:
- signing the sender-recipient-amount payload on the client before sending it,
- recovering the signer address on the server using `secp.recoverPublicKey(...)`,
- matching the recovered address against the `sender` value in the request,
- rejecting unsigned or invalid requests before modifying balances,
- preserving the earlier phase 2 account generation logic so each real wallet still maps to a valid derived address.

This is a good phase 3 solution because it teaches the core ECDSA workflow used in blockchain systems: create a signed message, validate it cryptographically, and recover the signer’s address from the signature itself. That pattern is exactly what makes it possible to prove wallet ownership without sending the private key over the network.

### Ordered change log

1. Added transaction signing to the client transfer flow.
   - File: `/client/src/Transfer.jsx`
   - What changed: the app now builds the transaction message from the sender, recipient, and amount, hashes it, and signs it with the user’s private key before sending it to the server.
   - Why: this is the critical phase 3 step. The client proves ownership without exposing the private key in a request body.

2. Switched the server request validation to verify signatures instead of trusting a private key in the payload.
   - File: `/server/index.js`
   - What changed: the `/send` endpoint accepts a `signature`, recreates the same signed message, and recovers the public key to derive the signer’s address.
   - Why: this converts the backend from “did the client send the right secret?” to “did the client produce a valid cryptographic proof?”

3. Added address recovery and public-key-to-address conversion helpers.
   - File: `/server/index.js`
   - What changed: a `publicKeyToAddress` helper was added alongside the earlier private-key-based derivation logic, so recovered public keys can be converted back into Ethereum-style addresses.
   - Why: recovery is the key idea of phase 3. If the recovered address matches the sender, the signer must have had the corresponding private key.

4. Kept the phase-2 account generation model intact while upgrading the authorization flow.
   - File: `/server/index.js`
   - What changed: the balances object still uses real wallet addresses derived from private keys, but the server now validates them via recovered signatures rather than direct private key submission.
   - Why: this preserves the realistic wallet model while proving the signature-based ownership pattern.

5. Updated the app state comments to reflect the new phase-3 architecture.
   - File: `/client/src/App.jsx`
   - What changed: the app comment now explains that the UI keeps the private key in state and signs a transaction before it is sent to the backend.
   - Why: this makes the code match the design intent and reinforces the lesson that the secret stays local to the client.

6. Kept a compatibility fallback for the phase-2 flow.
   - File: `/server/index.js`
   - What changed: if a request includes a `privateKey` instead of a `signature`, the server still validates it against the sender address as a fallback for teaching continuity.
   - Why: this helps maintain the gradual progression from phase 2 to phase 3 without forcing an abrupt code rewrite.

In short, the flow is now:

1. the client signs the transaction payload,
2. the server reconstructs the same message and recovers the signer,
3. the recovered address must equal the sender address,
4. if true, the transfer is applied to the balances.

That is the heart of phase 3: proving the sender owns the wallet using a valid signature, without sending the private key itself.

> Security note: this project models the core ECDSA pattern very well, but a production blockchain transfer should also include a nonce, chain ID, and other replay-protection fields so a valid signature cannot be replayed against the same account on the same chain without being invalidated.
