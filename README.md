## Project 1: Build a Web App using ECDSA

This project is an example of using a client and server to facilitate transfers between different addresses. Since there is just a single server on the back-end handling transfers, this is clearly very centralized. We won't worry about distributed consensus for this project.

However, something that we would like to incorporate is Public Key Cryptography. By using Elliptic Curve Digital Signatures we can make it so the server only allows transfers that have been signed for by the person who owns the associated address.

## Video Instructions
For an overview of this project as well as getting started instructions, check out the following video:

https://www.youtube.com/watch?v=GU5vlKaNvmI

If you are interested in a text-based guide, please read on below. ⬇️

## Setup Instructions
 
### Client

The client folder contains a [react app](https://reactjs.org/) using [vite](https://vitejs.dev/). To get started, follow these steps:

1. Open up a terminal in the `/client` folder
2. Run `npm install` to install all the dependencies
3. Run `npm run dev` to start the application 
4. Now you should be able to visit the app at http://localhost:5173/

### Server

The server folder contains a Node.js server using [express](https://expressjs.com/). To run the server, follow these steps:

1. Open a terminal within the `/server` folder 
2. Run `npm install` to install all the dependencies 
3. Run `node index` to start the server

_Hint_ - > Run `npm i -g nodemon` and then run `nodemon index` instead of `node index` to automatically restart the server on any changes!

The application should connect to the default server port (3042) automatically!

## 🏁 Your Goal: Set Up a Secure ECDSA-based Web Application

Only read this section **AFTER** you've followed the **Setup Instructions** above!

This project begins with a client that is allowed to transfer any funds from any account to another account. That's not very secure. By applying digital signatures we can require that only the user with the appropriate private key can create a signature that will allow them to move funds from one account to the other. Then, the server can verify the signature to move funds from one account to another.

Your project is considered **done** when you have built the following features in a secure way (NOTE: your project is not final if it still uses private keys anywhere on the client side!):
- Incorporate public key cryptography so transfers can only be completed with a valid signature
- The person sending the transaction should have to verify that they own the private key corresponding to the address that is sending funds

> 🤔 While you're working through this project consider the security implications of your implementation decisions. What if someone intercepted a valid signature, would they be able to replay that transfer by sending it back to the server?

## Recommended Approach To Building This Project

There are many ways to approach this project. The goal is to create a client-server webapp that safely validates transaction intents, using public key cryptography, between accounts. Below is a phased approach that clearly details out a roadmap to solving this goal:

### **Phase 1**
- You have successfully git cloned this project onto your local machine
- You installed all dependencies by running `npm i` both in the `/client` and in the `/server` folders
- You have a website running on http://localhost:5173/ by running `npm run dev` in the `/client` folder
- You have a server process running by running `nodemon index` in the `/server` folder (remember to run `npm i -g nodemon` prior to this)
- A balance displays on the `Wallet Address` input box when you type in "0x1", "0x2" and "0x3"
- When you type in "0x1" (or any of the other accounts listed in the `server/index.js` file, you can also send an amount to any other account (using the right-hand column); this action withdraws whatever amount you send from the first account too. You should see these changes in real time, especially if you are using `nodemon` to run your server process
- Even if you reload the page on http://localhost:5173/, the balance changes you've previously made still remain - this is because it is your server actually keeping track of balances, not your client (ie. your front-end)

If all of these are complete, move on to **Phase 2**! ⬇️

### **Phase 2**

At this point, our app security is not very good. If we deploy this app now, anyone can access any balance and make changes. This means that Alice (or really.. anyone!) can type in "0x2" and transfer an amount, even if that account is not actually her account! We need to find a way to assign ownership of accounts. 

Let's incorporate some of the cryptography we've learned in the previous lessons to build a half-baked solution; we will use [Ethereum Cryptography library](https://www.npmjs.com/package/ethereum-cryptography/v/1.2.0).

> Please use v1.2.0 of the Ethereum Cryptography library!

Start a new terminal tab and run `npm i ethereum-cryptography@1.2.0` - this will pull down functions to cryptographically sign and verify data.

> Remember, you must run `npm i ethereum-cryptography@1.2.0` in BOTH the `/client` and the `/server` folder!

In **Phase 2**, your job is to implement private keys so that when a user interacts with your application, the ONLY way they are allowed to move funds is if they provide the **private key** of the account they want to move funds from.

The key change is to change the `balances` object in the `/server/index.js` file to use **real public keys**.

You can do this programmatically (by editting the `/server/index.js` file) or using a script with the following functions:

```js
const secp = require("ethereum-cryptography/secp256k1");
const { toHex } = require("ethereum-cryptography/utils");

const privateKey = secp.utils.randomPrivateKey();

console.log('private key: ', toHex(privateKey));

const publicKey = secp.getPublicKey(privateKey);

console.log('public key', toHex(publicKey));
```

The script above will create a brand new random private key, and then get its equivalent public key, each time you run it.

Now you have the foundation to implement public key cryptography into your project!

To pass **Phase 2**:

- You have replaced "0x1", "0x2" and "0x3" in the `server/index.js` file with actual public keys generated by using the [Ethereum Cryptography library](https://www.npmjs.com/package/ethereum-cryptography/v/1.2.0). These public keys, in this suggested flow, were generated from a randomly generated private key assigned to the user. The method used to generate the public key was: `secp.getPublicKey(privateKey)`.

> Extra credit: Make your accounts look like Ethereum addresses! (ie. instead of the long public key hexadecimal format, use the "0x" + 20 hex characters format of Ethereum - this is a fun challenge to get right!)

- You are able to transfer funds between the addresses, via public keys/addresses of your server's users, that have been generated by inputting a private key into the webapp.
 
### **Phase 3**

Asking users to input a private key directly into your webapp is a big no-no! 🚫

The next step for YOU to accomplish is to make it so that you can send a signed transaction to the server, via your webapp; the server should the authenticate that transaction by deriving the public key associated with it. If that public key has funds, move the funds to the intended recipient. All of this should be accomplished via digital signatures alone.

Hint: In `index.js`, you will want to:
- get a signature from the client-side application
- recover the public address from the signature itself
- validate the recovered address against your server's `balances` object

To pass **Phase 3**:

- Your app is able to validate and move funds using digital signatures.

> Hint: https://github.com/paulmillr/noble-secp256k1 is a great library to leverage for this final phase!

## Sample Solution

Want to peek at a solution while you craft your own? Check [this repo](https://github.com/AlvaroLuken/exchange-secp256k1) out.

## Phase 2 Implementation Summary

This project was updated to match the phase 2 goal described above: the server no longer treats wallet IDs as simple placeholders like "0x1" or "0x2". Instead, each account now has a real private key, and the server derives a wallet address from that key using the secp256k1 curve and Keccak hashing. In other words, the address is a function of the private key, which is exactly the kind of ownership check that makes this exercise more realistic.

The didactic reason for this approach is that it teaches the core idea behind public-key cryptography in a very concrete way: the private key stays secret, the public key is derived from it, and an address can be created from that public key. The server then verifies ownership by recomputing the address from the private key the client sends. If the computed address matches the sender value, the transfer is accepted. If it does not, the transfer is rejected.

I implemented that model in the app by:
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

10. Added clear explanatory comments in the changed code to mark the phase 2 work.
   - File(s): `/server/index.js`, `/client/src/Wallet.jsx`, `/client/src/App.jsx`, `/client/src/Transfer.jsx`
   - Why: the comments help future learners connect the code to the cryptographic concept behind it without needing to memorize every step.

11. Documented the reasoning and teaching rationale in the README.
   - File: `/README.md`
   - What changed: the summary now explains not just what changed, but why this is the correct educational step before phase 3.
   - Why: learning is easier when you can see the progression from “fake addresses” to “real ownership” to “signed transactions.”

In short, the flow is now:

1. user enters a private key,
2. the app derives the matching address,
3. the server checks that the sender really owns that address,
4. the transfer proceeds only when the ownership check passes.

That is the heart of phase 2: proving wallet ownership before moving funds.
