# DAO-Digest AI (Proof of Work)

This repository is the "Proof of Work" for my Solana Foundation grant application.

## 🚀 Project Goal

**DAO-Digest AI** is an open-source public good that solves information asymmetry and voter apathy in Solana governance. 

The problem is that "normal" token-holders don't understand what they are actually voting for. A proposal's text might be simple, but the hidden on-chain instructions (like Transfer or SetRole) are technical and risky.

Our solution is an On-Chain Translator Bot that:

Alerts: Instantly notifies a DAO's Discord when a new proposal is created.

Translates: Fetches the complex on-chain instructions and translates them into a simple, plain-English "On-Chain Actions" list, helping users understand exactly what their vote will do.

This is a security and transparency tool that brings trust to governance.

## ✅ What This Script Does

This `index.js` script is the core "on-chain" component of the project. It demonstrates the ability to:
1.  Connect to a Solana network high-performance RPC node.
2.  Load the `spl-governance` program and fetch 242,000+ realms as of writing.
3.  Parse the on-chain data to correctly categorize accounts by type (Realm, Governance, Proposal)
3.  Fetch and display the most recent governance proposals from a real DAO.

This proves the technical foundation for fetching and filtering the data is complete.

## 🛠️ How to Run It

1.  Clone this repository: `git clone https://github.com/OnoseAnthony/dao-digest-script.git`
2.  Install dependencies: `npm install`
3.  Run the script: `node index.js`

## 🔜 Next Steps (The Grant)

The **$7,500** grant I am applying for will fund the completion of this project:
* **Milestone 1:** Build the robust, 24/7 backend and database to monitor the chain in real-time.

* **Milestone 2:** Build the AI-powered "translator" to deserialize proposal instructions and explain them in plain English.

* **Milestone 3:** Build the user-facing Discord bot and open-source the entire project for any DAO to use.

