# Istanbul Route AI — Full Pitch Script

Video target length: **≈8 minutes** (Circle Nanopayments Hackathon submission).

Structure:
1. **Slide deck** (Slides 1 – 16) · ~5:30
2. **Live demo** — driver, municipality, transaction verification · ~2:30

Slides live at https://istanbul-route-ai.vercel.app/pitch — press **F** for fullscreen, **←/→** to move through.

---

## PART 1 · Slide deck (5:30)

> **Pacing tip.** Read at a calm, unhurried pace — roughly 140 words per minute. Pause 0.5 s between slides for the spring transition.

---

### **Slide 01 · Cover** — 0:00 – 0:18 (18 s)

**On screen:** "Silent Gemini agent. USDC pays in whispers." · Wordmark · Three track chips at the bottom.

**Voice-over (≈50 words):**

> "Hi. I'm presenting Istanbul Route AI — a navigation app where a silent Gemini agent picks your route using real-time municipal fleet data, and pays for that data in sub-cent USDC on Arc. Built for Circle Nanopayments Hackathon — aligned with Per-API Monetization, Agent Payment Loop, and Google's Gemini prize track."

---

### **Slide 02 · The problem** — 0:18 – 0:48 (30 s)

**On screen:** Left column — "Navigation updates traffic every few minutes." Right column — big **40,000** number with "ground-truth vehicles · wasted."

**Voice-over (≈80 words):**

> "Every navigation app you've ever used has the same blind spot. Traffic data refreshes every two to three minutes, built from aggregated phone signals — averaged, delayed, crowd-sourced. If you're the driver who just entered a jam, you'll learn about it after you're stuck in it. Meanwhile, right now, forty thousand municipal vehicles — IETT buses, ambulances, garbage trucks — are driving Istanbul's roads, producing ground-truth speed data every single second. And that data is being wasted."

---

### **Slide 03 · The insight** — 0:48 – 1:13 (25 s)

**On screen:** Three cards — Bus 8 km/h, Garbage truck 20 min / 2 km, Ambulance choosing bridge.

**Voice-over (≈65 words):**

> "Here's the insight. If an IETT bus is crawling at eight kilometres per hour on Barbaros Boulevard, that corridor is jammed. Confirmed by a vehicle the city operates. If a garbage truck takes twenty minutes to cross two kilometres in Kadıköy, the secondary route is also stuck. If an ambulance picks the bridge, emergency responders know something. Municipal fleet telemetry is a goldmine — already collected, already accurate, sitting unused in city servers."

---

### **Slide 04 · The solution** — 1:13 – 1:45 (32 s)

**On screen:** Left — headline and pricing chips. Right — six signal badges around "Gemini Function Calling."

**Voice-over (≈90 words):**

> "So we did two things. First, we put an x402 paywall on that fleet telemetry. And second, we put a silent Gemini 3 Flash agent in front of it. When you tap a destination, the agent looks at three OSRM route alternatives and adaptively queries six real-time data tools — IBB traffic index, IETT bus density, incidents, weather, ISPARK parking, and time-of-day context. Every tool call is a one-hundred-micro-dollar USDC settlement on Arc. The whole route query costs the user half a milli-dollar. Zero popups after setup, zero gas."

---

### **Slide 05 · How it works** — 1:45 – 2:20 (35 s)

**On screen:** Six numbered steps in a 2×3 grid.

**Voice-over (≈95 words):**

> "The full loop, step by step. One — user signs a single EIP-3009 typed-data payload, handled by Circle Gateway; no gas, no popup after the first deposit. Two — OSRM returns three real road-network alternatives, not heuristics. Three — Gemini decides which signals matter for this specific query; it skips weather on short hops, skips parking on highway exits. Four — each tool call settles on-chain as a USDC transfer to the municipality treasury. Five — the agent submits a final decision with a rationale. Six — the user navigates; the wallet ticks down silently. One query produces five to seven real on-chain transactions."

---

### **Slide 06 · Driver experience** — 2:20 – 2:40 (20 s)

**On screen:** Three phases — Initial, Unlock, Navigating.

**Voice-over (≈55 words):**

> "The driver experience is built to feel like Apple Wallet, not like a crypto app. Three phases: drop a pin or tap a saved place, unlock the AI route for half a milli-dollar, then navigate with a Google-Maps-style locked camera and a live turn banner. No MetaMask popups during the drive — just silent debits."

---

### **Slide 07 · Municipality** — 2:40 – 3:02 (22 s)

**On screen:** Dashboard description + live on-chain feed mock.

**Voice-over (≈60 words):**

> "Flip personas. The municipality has its own console. Live revenue ticker seeded from real Arc events. A streaming on-chain payment feed — every transaction hash links to ArcScan. A zone heatmap that blends real İBB traffic index with live IETT bus speeds. An agent decision-mix ring showing which signals drove routing choices in the last twenty-four hours. All from real settlements."

---

### **Slide 08 · The flywheel** — 3:02 – 3:27 (25 s)

**On screen:** Five nodes orbiting a central Arc·USDC badge.

**Voice-over (≈70 words):**

> "And this is why it's positive-sum for everyone. The driver pays, saves time, gets home earlier. The municipality earns revenue from data that cost zero to produce. Traffic distributes more evenly, which means buses run faster and ambulances arrive sooner. Congestion drops, so does fuel use, so does pollution. And the payment stream itself becomes a signal for urban planning — more on that in a minute."

---

### **Slide 09 · Economic & design proof** — 3:27 – 4:02 (35 s)

**On screen:** Five-axis table — Ethereum vs Arc on Gas, Finality, Gas token, Fee predictability, Agent-native primitives.

**Voice-over (≈95 words):**

> "Why can't this run on Ethereum? Gas is the obvious answer — ten thousand times cheaper on Arc — but it's only one of five. Arc has deterministic sub-second finality, so agents can confirm one call and chain the next in real time. USDC is the native gas token, so you don't do a two-token dance every time you top up. Fees are dollar-denominated and MEV-insulated, so a half-milli-dollar query stays a half-milli-dollar the next block. And Circle's primitives — Gateway, x402, Wallets — are built into the chain, not retrofitted. Ethereum was made for capital markets. Arc was made for agents."

---

### **Slide 10 · On-chain proof** — 4:02 – 4:23 (21 s)

**On screen:** "71" big number · category breakdown cards.

**Voice-over (≈60 words):**

> "Claims are easy — proof is what matters. Seventy-one real transactions on Arc Testnet from this project: one ERC20 transfer to fund a demo wallet, two gas top-ups, one USDC approval, one Gateway deposit, and sixty-six agent tool settlements. Every hash is in the repo's TX_PROOF file. A judge can reproduce all sixty-six in ninety seconds by running replayAgentSettlements.ts against our backend."

---

### **Slide 11 · Circle stack** — 4:23 – 4:38 (15 s)

**On screen:** Six Circle products with checkmarks.

**Voice-over (≈40 words):**

> "The full Circle stack is in play: Arc for settlement, USDC as both native gas and transfer currency, Nanopayments via the x402 batching middleware, Gateway for the silent-debit UX, Programmable Wallets for onboarding, and the x402 protocol itself."

---

### **Slide 12 · Data stack** — 4:38 – 4:58 (20 s)

**On screen:** Gemini + five real Istanbul APIs.

**Voice-over (≈55 words):**

> "And the intelligence layer. Gemini 2.5 Flash with Function Calling orchestrates six data tools. İBB Open Data supplies the traffic index. İETT provides live bus positions. ISPARK feeds 262 parking lots with real-time occupancy. Open-Meteo gives weather. OSRM routes on the real road network. No mocks, real city telemetry throughout."

---

### **Slide 13 · Transaction flow** — 4:58 – 5:22 (24 s)

**On screen:** Four numbered steps — user signs → Circle Gateway settles → Arc confirms → Municipality receives.

**Voice-over (≈65 words):**

> "The on-chain flow is four steps. The user signs a TransferWithAuthorization — off-chain, no gas. Circle Gateway's middleware validates the signature and routes it to settlement. Arc finalises the transaction in under a second. The municipality treasury receives the USDC and the dashboard feed updates live. Every step is visible in both the Circle Developer Console and on ArcScan — which I'll show you in a moment."

---

### **Slide 14 · Vision** — 5:22 – 5:48 (26 s)

**On screen:** Three question cards — "Which corridors do drivers pay most to avoid?" etc.

**Voice-over (≈70 words):**

> "Long term, the payment data itself becomes urban planning intelligence. Which corridors do drivers pay the most to avoid? That's exactly where infrastructure investment is needed. Which hours generate the most route queries? That's when public transit should run more frequently. Which zones show the highest re-routing demand? That's where traffic signal timing needs work. The data sells itself — and then tells the city how to fix itself."

---

### **Slide 15 · Try it now** — 5:48 – 6:03 (15 s)

**On screen:** URL list + live QR code.

**Voice-over (≈40 words):**

> "Everything is live and public. The app, the municipality console, the backend, the GitHub repo, the transaction proof file. Scan the QR on your phone, or clone the repo and reproduce the proof with one script. Links are in the submission."

---

### **Slide 16 · Thanks** — 6:03 – 6:12 (9 s)

**On screen:** Closing headline — "40,000 wasted sensors. One agent. One USDC."

**Voice-over (≈25 words):**

> "Forty thousand wasted sensors. One agent. One USDC. That's Istanbul Route AI. Thank you — now let me show you the demo."

---

## PART 2 · Live demo (2:30)

This is the part that hits the hackathon's required "transaction executed via Circle Developer Console + verification on the Arc Block Explorer."

Cut from the slide deck to full-screen tabs in this exact order.

---

### **Demo A · Driver flow** — 6:12 – 7:20 (68 s)

**Tab:** `istanbul-route-ai.vercel.app/drive`

**Actions + narration:**

| Time | Action | Say |
|---|---|---|
| 0 – 4 s | Show the Drive landing on a phone-frame | "This is the driver app. Connected to Arc Testnet, Gateway is pre-funded." |
| 4 – 10 s | Tap the **Home** saved place | "Tap Home. The baseline — what Google Maps would say — appears. Nineteen minutes." |
| 10 – 16 s | Point at the locked "CityPulse · ? min" row | "The agent's route is locked. To unlock it, the user pays half a milli-dollar in USDC." |
| 16 – 26 s | Click **Unlock AI route · $0.0005** → MetaMask popup → sign | "One EIP-3009 typed-data signature via Circle Gateway. No gas. Not a send. Just an authorisation." |
| 26 – 40 s | Agent thinks, rationale card appears, mention visible signal badges | "The agent just called four live data tools — each one an on-chain USDC transfer. Here's its rationale: it picked this route because bus density is low on the corridor and ISPARK at the destination is forty-two percent free." |
| 40 – 55 s | Tap **Start drive** — camera locks, turn banner slides in, wallet ticks down | "Start drive. The map camera locks on the driver, bearing follows the road ahead. And the wallet pill — watch the top right — ticks down silently as the agent makes further calls. That's the whole point: no popups during the drive." |
| 55 – 68 s | Tap wallet pill → menu → show address + disconnect option | "One tap on the balance pill shows the wallet menu — address, copy, ArcScan, disconnect. Done." |

---

### **Demo B · Municipality console** — 7:20 – 8:00 (40 s)

**Tab:** `istanbul-route-ai.vercel.app/municipality`

**Actions + narration:**

| Time | Action | Say |
|---|---|---|
| 0 – 8 s | Load `/municipality`; show the stat strip at top | "The other persona. Revenue, active vehicles, city-wide average speed, agent reroutes — all from real endpoint data." |
| 8 – 20 s | Scroll down to the live on-chain feed; hover one row | "This is the live on-chain feed. Every row is a Circle Gateway settlement on Arc — the hash, the zone, the USDC amount. Click the arrow and it opens ArcScan." |
| 20 – 30 s | Show the zone heatmap on the right | "Zone heatmap — blended from İBB traffic index plus live IETT bus speeds. Beyoğlu is red-ish right now because buses are moving at fourteen km/h there." |
| 30 – 40 s | Scroll to the agent decision-mix ring + margin proof card | "Decision mix — which signals Gemini cited most in the last twenty-four hours. And the margin card: today's payment volume would cost this much on Ethereum, and this much on Arc." |

---

### **Demo C · Transaction verification** — 8:00 – 8:55 (55 s) · **required**

**Tabs:** `console.circle.com` · `testnet.arcscan.app/tx/<hash>` · GitHub `TX_PROOF.md`

**Actions + narration:**

| Time | Action | Say |
|---|---|---|
| 0 – 12 s | Open Circle Developer Console → Programmable Wallets / Transfers view | "Circle Developer Console. Here's the wallet, here are its recent Gateway transfers — every row is one of our settlements, with status, amount, and the on-chain hash." |
| 12 – 15 s | Click into one transfer detail | "Open a transfer." |
| 15 – 30 s | Switch to ArcScan tab (pre-loaded tx) | "Same hash on Arc Block Explorer. Status success. From the user address. To the municipality treasury. Native USDC. Sub-second inclusion." |
| 30 – 45 s | Switch to GitHub TX_PROOF.md | "And here's the full proof file in the repo. Seventy-one transactions. Each one a clickable ArcScan link. Judges can verify each, or reproduce the whole set with one command." |
| 45 – 55 s | Scroll through the TX_PROOF table, then final pause on the header | "Seventy-one over the fifty-transaction requirement. Istanbul Route AI — thank you for watching." |

---

## PART 3 · Recording setup & checklist

### Tools

- **Screen recorder:** Loom (simplest) or OBS (more control). 1080p, 30 fps minimum, 60 fps if your machine handles it.
- **Microphone:** Any USB condenser; run audio through Krisp.ai or Audacity noise-gate to clean background hiss.
- **Editor** (only needed if you record in multiple segments): DaVinci Resolve (free) or iMovie.

### Tabs to have open, in order (⌘1 … ⌘5 to switch)

1. `https://istanbul-route-ai.vercel.app/pitch` (press **F** for fullscreen)
2. `https://istanbul-route-ai.vercel.app/drive` — MetaMask connected to Arc Testnet (chainId 5042002), demo wallet with Gateway balance
3. `https://istanbul-route-ai.vercel.app/municipality`
4. `https://console.circle.com` — logged in, on Wallets / Transfers view
5. `https://testnet.arcscan.app/tx/0xa4950113c03b37ec781db47c9838885adacdd400092ee5b2f9811b1fbef13d3d` (or any hash from TX_PROOF.md)
6. `https://github.com/Himess/istanbul-route-ai/blob/master/TX_PROOF.md`

### Two-pass recording strategy (recommended)

Instead of trying to narrate and click perfectly in one take:

- **Pass 1:** record just the voice-over using only the slide deck. Read this script top to bottom. Export audio + slide-only video (≈6:12).
- **Pass 2:** record only the live demo segments (no voice) while playing back the voice-over so your clicks land on cue. Export demo-only video (≈2:30).
- **Stitch** the two in the editor, crossfading 300 ms at each transition. Background music optional — instrumental Lo-Fi at −20 dBFS keeps it alive without fighting the voice.

### Pre-record checklist

- [ ] MetaMask on Arc Testnet (chainId 5042002)
- [ ] Demo wallet has **Gateway balance ≥ 0.01 USDC**
- [ ] Deposit + Unlock flow tested in the last 30 minutes
- [ ] `/municipality` feed is actively ticking (refresh right before recording)
- [ ] Circle Console session is alive (re-sign in if timed out)
- [ ] ArcScan tx page loaded and scrolled to show From / To / Value
- [ ] GitHub TX_PROOF tab scrolled to the table
- [ ] Browser zoom at **100 %**
- [ ] Notifications silenced (Slack, Discord, Mail)
- [ ] Display resolution fixed (do not change during recording)
- [ ] Bluetooth headphones *off* (avoid latency drift)

### Submission-form paste kit

- **Slide deck URL:** `https://istanbul-route-ai.vercel.app/pitch`
- **Video URL:** *(paste your YouTube unlisted link after upload)*
- **GitHub:** `https://github.com/Himess/istanbul-route-ai`
- **Live demo:** `https://istanbul-route-ai.vercel.app`
- **Tx proof:** `https://github.com/Himess/istanbul-route-ai/blob/master/TX_PROOF.md`

Target duration: **~8 minutes**. Longer is fine — the hackathon doesn't cap video length. Keep the pace calm; judges watch dozens of these.

Good luck.
