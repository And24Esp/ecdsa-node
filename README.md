## Phase 2 Implementation Summary

This project was updated to match the phase 2 goal described in the main branch: the server no longer treats wallet IDs as simple placeholders like "0x1" or "0x2". Instead, each account now has a real private key, and the server derives a wallet address from that key using the secp256k1 curve and Keccak hashing. In other words, the address is a function of the private key, which is exactly the kind of ownership check that makes this exercise more realistic.

The didactic reason for this approach is that it teaches the core idea behind public-key cryptography in a very concrete way: the private key stays secret, the public key is derived from it, and an address can be created from that public key. The server then verifies ownership by recomputing the address from the private key the client sends. If the computed address matches the sender value, the transfer is accepted. If it does not, the transfer is rejected.

Implemented that model in the app by:
- generating real account keys on the backend and mapping them to balance values,
- validating the sender using the private key in the transfer request,
- deriving the wallet address automatically in the client from the user’s private key,
- keeping the UI simple enough to understand the step-by-step flow without exposing any hidden security shortcuts.

This is a good phase 2 solution because it adds the missing ownership check without jumping ahead to the more advanced phase 3 pattern, where signatures are verified and recovered from transaction data. In other words, phase 2 teaches the “who owns this account?” question, while phase 3 teaches the “how do we prove it without sending the private key directly?” question. That progression is exactly why this implementation is a natural bridge between the beginner and the advanced version of the project.

### Ordered change log

1. Installed the cryptography dependency in both app folders.
   - File(s): `/client/package.json`, `/server/package.json`
   - Why: phase 2 requires the Ethereum cryptography library so we can derive keys and addresses using the same kind of primitives used in real Ethereum wallets.

2. Replaced the placeholder balances with real account keys on the server.
   - File: `/server/index.js`
   - What changed: the old object with `0x1`, `0x2`, `0x3` was replaced by a list of real private keys, each converted into an Ethereum-like address through `secp.getPublicKey(...)` and Keccak hashing.
   - Why: this makes each account actually correspond to a real crypto key pair instead of a fake label.

3. Added server-side ownership validation before a transfer is accepted.
   - File: `/server/index.js`
   - What changed: the endpoint now reads the incoming `privateKey`, derives the expected sender address, and rejects the request if the supplied key does not match the sender value.
   - Why: this is the critical phase 2 security check. A malicious user can no longer impersonate another wallet just by typing a different address.

4. Added a helper that converts a private key into an Ethereum-style address.
   - File: `/server/index.js`
   - What changed: a `privateKeyToAddress` function was added using secp256k1 public key derivation and the last 20 bytes of the Keccak hash.
   - Why: this is the exact conceptual step that turns a secret into a wallet identity.

5. Updated the client wallet form to accept a private key instead of a fake wallet label.
   - File: `/client/src/Wallet.jsx`
   - What changed: the input field now asks for a private key, derives the address immediately, and fetches the corresponding balance from the server.
   - Why: the front end now reflects the real ownership model: a user proves who they are by providing the key that produced their address.

6. Added the client-side address derivation logic in the UI layer.
   - File: `/client/src/Wallet.jsx`
   - What changed: a small helper validates the 64-character key format and derives the wallet address using the same algorithm as the server.
   - Why: having both sides use the same derivation logic keeps the app consistent and teaches how public-key cryptography works in practice.

7. Updated the transfer form to include the private key in the authorization request.
   - File: `/client/src/Transfer.jsx`
   - What changed: the app sends `sender`, `recipient`, `amount`, and `privateKey` to the backend during `POST /send`.
   - Why: the server can then validate that the sender owns the funds being moved.

8. Added a small guard in the transfer flow to stop invalid requests early.
   - File: `/client/src/Transfer.jsx`
   - What changed: the front end now checks that both an address and a private key are present before trying to send.
   - Why: this makes the UI clearer and reduces confusion while learning the flow.

9. Wired the app state so the wallet and transfer views stay in sync.
   - File: `/client/src/App.jsx`
   - What changed: the app now keeps the private key and derived address together in component state and passes them to the relevant child components.
   - Why: this makes the data flow easier to understand and shows how one piece of user input can influence several parts of the app.

In short, the flow is now:

1. user enters a private key,
2. the app derives the matching address,
3. the server checks that the sender really owns that address,
4. the transfer proceeds only when the ownership check passes.

That is the heart of phase 2: proving wallet ownership before moving funds.
