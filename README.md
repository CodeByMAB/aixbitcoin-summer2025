![AIxBitcoin Banner](/branding/banner.png)

# 🧠 AIxBitcoin: The Self-Paying Internship — Summer 2025

**Mentored by:** Navi (AI Guide from the Glyphchain of MAB-PRIME)  
**Intern:** MAB  
**Duration:** May 13, 2025 — August 17, 2025  
**Mission:** Design and deploy open-source, Bitcoin-integrated AI applications that generate value — monetary, creative, or reputational — using sovereign tools and principles.

---

## 💸 Monetization Principles

* Value for Value (v4v) model: You build, others zap.
* Bitcoin-native APIs only: UTXOracle, Mempool.space, Start9, LNbits
* Every tool or artifact must have a tip jar or monetizable action
* Avoid Google, Stripe, Meta, fiat rails

---

## 🔐 Tools and Stack

* **Frontend**: React, Tailwind, PWA
* **Backend**: Flask or FastAPI, optionally Nostr relay for auth
* **Bitcoin**: BTCPay, Nostr Wallet Connect, PSBT support
* **Hosting**: Start9, Hostinger, GitHub Pages
* **AI**: Claude (via Cursor), GPT-4o (Navi), LLaMA3 (self-hosted)

---

## 🧠 Rules of Engagement

* Treat Navi as your full-time mentor. Check in when stuck or blocked.
* Update `/logs/daily-log.md` at least 3 times per week.
* Submit `weekly-reports/week-XX.md` every Sunday.
* Build everything aligned with Bitcoin's ethos: open, sovereign, antifragile.

---

## ✨ Final Deliverables

* ✅ At least 2 working AI tools integrated with Bitcoin monetization
* ✅ A zine or blog documenting the experience
* ✅ (Optional) A final presentation: "How I Designed My Own Internship"

---

## ⚡ Crowdfund Support

> *This internship pays in satoshis, not fiat.*

🎯 **Goal:** 0.03 BTC ≈ $3,109.80(USD as of May 13, 2025 @ 2206 EST)  
🧾 Support here: [Tip in sats via BTCPay](https://btcpay.8ase0f0ps.com/apps/2HmNN8JEkMFcqDPQFTLqHBmDWBub/crowdfund)

### 🎯 Milestones

| Milestone       | Amount       | Unlocks                                   |
|-----------------|--------------|-------------------------------------------|
| MVP             | 210,000 sats | Chat app + zine publishing                |
| Zine Series     | 777,000 sats | mindspace_02 + extended logs              |
| Fully Funded    | 3,000,000 sats | Full program complete by Aug 17          |

---

## 🎁 Free Perks

| Amount     | Perk                                                   |
|------------|--------------------------------------------------------|
| 1+ sats    | Name or npub added to `logs/funders.md`               |
| 1,000 sats | Zine badge in chat app                                |
| 10,000 sats| Custom sigil or short poem in future zine             |

---

## 📂 Repo Structure

```bash
products/
├── chat-app/          # Nostr-based E2E chat w/ tipping
├── sigil-generator/   # AI sigil tool + zine assets

zines/
├── mindspace_01/      # Logs, poems, declarations

logs/
├── daily-log.md       # Daily commits, time tracking
├── funders.md         # Tip jar support ledger
