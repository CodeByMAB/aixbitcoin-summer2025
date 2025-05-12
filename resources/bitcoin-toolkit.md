# 🛠️ Bitcoin Toolkit for AIxBitcoin Internship

## ⚡ Wallets & Payment Integration

* **BTCPay Server** — Use with your self-hosted Start9 server to accept payments
* **Nostr Wallet Connect (NWC)** — Lightning-native auth and payment link
* **Lightning Charge / LNbits** — RESTful interface to Lightning

## 📊 Bitcoin Data & APIs

* **UTXOracle** — Trustless fiat-to-sats conversion
* **Mempool.space** — Fee estimates, block status, TX info
* **Blockstream.info API** — TX, address, block data (on-chain)
* **CoinGecko / CoinCap** — Fiat market price feeds (non-sovereign)

## 🔐 Privacy Tools

* **Tor / SOCKS proxy** — For routing requests anonymously
* **.onion endpoint support** — Run BTCPay and other apps via Tor

## 🧪 Development Practices

* Use **regtest** or **testnet** when testing wallet/payment logic
* Sign and broadcast **Partially Signed Bitcoin Transactions (PSBT)** locally
* Use **electrs** or **Fulcrum** if building Bitcoin indexers

## 🗂️ Nostr Tools

* **NIP-07, NIP-98** — Nostr login and delegation protocols
* **nostr-tools** (JS) — For client-side integration
* **Relays** — Use your own or public relays for auth and zaps

## 📁 Self-Hosting Stack

* **Start9** — Sovereign server (your node)
* **Proxmox** — Manage VMs + LLaMA3 inference
* **.local DNS / Tor bridges** — Use subdomain or proxy for BTCPay

---

💡 Tip: Store these APIs, keys, and endpoints in a `.env` file and document endpoints clearly in your code.
