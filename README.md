# WalletClient Quickstart

![image](https://github.com/user-attachments/assets/81ec0c48-ae42-4a98-8369-73d9bb34fd4b)

Practical BSV application snippets for the current `@bsv/sdk` v2 `WalletClient` and BRC-100 wallet interface. The examples focus on browser and application code that works with BSV Desktop, BSV Browser, or another compatible BRC-100 wallet.

## Live Site

[https://fast.brc.dev](https://fast.brc.dev)

## Current Stack

- `@bsv/sdk` v2 for WalletClient, transactions, crypto, storage, overlays, and certificates.
- `@bsv/wallet-toolbox-client` v2 for BRC-29 and server-wallet examples.
- `@bsv/message-box-client` v2 for MessageBox examples.
- BSV Desktop or another BRC-100 wallet for user authorization and signing.

## Missing Examples

If an example is missing, raise an issue with the workflow you want covered. Pull requests with tested snippets are welcome.

## Run Locally

```bash
git clone https://github.com/bsv-blockchain/fast-wallet-client-docs
cd fast-wallet-client-docs
npm i
npm run dev
```

Before opening a PR, run:

```bash
npm run lint
npm run build
npm run build:snippets
```
