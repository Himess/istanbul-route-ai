# Istanbul Route AI — Full Pitch Script

Video target length: **≈10–11 minutes** (Circle Nanopayments Hackathon submission).

Structure:
1. **Slide deck** (Slides 1 – 16) · ~6:12
2. **Live demo** — Card, Drive, Park, Municipality, Circle Console, ArcScan, GitHub · ~4:30

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

**On screen:** "71" big number · category breakdown cards. *(When you re-render the slide, swap to 126 with a two-section breakdown to match TX_PROOF. If the slide still says 71 at recording time, narrate the 126 number anyway.)*

**Voice-over (≈75 words):**

> "Claims are easy — proof is what matters. One hundred and twenty-six real transactions on Arc Testnet from this project. Fifty-five executed through the Circle Programmable Wallet SDK, so every one of them appears in the Circle Developer Console. Seventy-one more from the agent's live settlement path. Every hash is in the repo's TX_PROOF file. A judge can reproduce the Circle-SDK set in ninety seconds by running circleSdkSettlements-dot-ts."

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

## PART 2 · Live demo (≈4:30)

Seven short segments, played full-screen (no browser chrome if possible).

Order (follow it — each segment references state set up by the previous one):

1. **Card** — wallet & Gateway balance (35 s)
2. **Drive** — agent flow, unlock, navigation (95 s)
3. **Park** — map-pick, pay-per-area-query (40 s)
4. **Municipality** — operator console (55 s)
5. **Circle Developer Console** — 55 tx visible, proves "via Circle Console" (30 s)
6. **ArcScan** — deep-dive one tx (20 s)
7. **GitHub TX_PROOF.md** — full reproducible proof (25 s) · **required**

Total demo ≈ 4:30 · overall video ≈ 10:40.

> **Pacing tip for the whole Part 2.** Slow down. You are showing state that already exists — let the viewer's eyes catch the numbers. Between segments, pause 0.5 s on a clean frame before cutting.

---

### **Demo 1 · Card tab** — 6:12 – 6:47 (35 s)

**Tab:** `istanbul-route-ai.vercel.app/card`

**What's on screen:** Big "Gateway balance · spendable silently" card, USDC number, ARC · TESTNET chip, top-up chips (5 / 10 / 25 / Custom), Recent ledger, View all activity.

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 6 s | Open `/card`. Let the wallet balance and "Gateway balance · spendable silently" headline settle on screen. | "Before the drive, here is the wallet. This is the Card tab. Think of it as an Apple-Wallet-style prepaid card for a silent AI agent." |
| 6 – 14 s | Point at the big USDC number, then at the "≈ N route queries · N agent tool calls" line underneath it. | "Top line — my Gateway balance, already deposited, already spendable with zero friction. Underneath: how many route queries and agent tool calls that balance buys. A full second of drive context costs me fractions of a cent." |
| 14 – 22 s | Point at the four top-up chips. Tap **10.00** briefly, then close the Deposit modal without confirming (escape key). | "Top-up is four chips. Pick ten USDC, popular choice. Behind this button: an EIP-3009 approve plus a Circle Gateway deposit. Two transactions, one popup. After that, every tool call the agent makes is silent." |
| 22 – 30 s | Scroll to the **Recent** ledger. Hover one "Agent tool · IBB traffic" row. | "Recent ledger. Green plus rows are top-ups. Minus rows are per-tool debits — one-tenth of a cent each, every one of them backed by an on-chain hash." |
| 30 – 35 s | Point at the small wallet identity strip (mode + address + ARC · TESTNET). | "MetaMask connected to Arc Testnet. Now let's actually drive." |

---

### **Demo 2 · Drive tab** — 6:47 – 8:22 (95 s)

**Tab:** `istanbul-route-ai.vercel.app/drive`

**What's on screen:** Light CartoDB map, TopBar wallet pill, Taksim origin dot, saved-places pill ("Home" + "Office"), bottom action sheet.

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 5 s | Land on `/drive`. Make sure the TopBar shows the balance you just saw on /card. | "This is the driver app. Origin is Taksim. Wallet is the same balance from the Card tab — Arc Testnet, Gateway pre-funded." |
| 5 – 12 s | Tap the **Home** saved place. The camera eases to the route bounds; a "Baseline route · Google Maps style" card slides up with a number. | "One tap on a saved place. What you're seeing now is the baseline — the route Google Maps would give. Nineteen minutes." |
| 12 – 20 s | Point at the locked "Istanbul Route AI · ? min" row underneath the baseline. | "Underneath, there is a second row — the agent's route. It's locked. To unlock it I pay half a milli-dollar — zero-point-zero-zero-zero-five USDC — and the agent runs." |
| 20 – 32 s | Click **Unlock AI route · $0.0005**. MetaMask popup opens. Sign it. Close popup. | "One EIP-3009 typed-data signature. This is NOT a send. Nothing leaves my wallet yet — it's an authorisation for Circle Gateway to debit me, up to the amount I approved, as the agent works." |
| 32 – 50 s | Agent thinks. A "silent whisper" card animates in. Signal badges appear (IBB, IETT, ISPARK, weather, time). Point at them. | "Watch what just happened. The agent called live data tools in parallel — IBB traffic index, IETT bus density, incidents, weather, ISPARK parking, time-of-day. Each badge you see is a live on-chain USDC transfer to the municipality treasury. Sub-cent each, sub-second finality." |
| 50 – 62 s | Point at the rationale card and the comparison numbers: "Google Maps · 19 min · Istanbul Route AI · 15 min". | "Here is the agent's rationale in one line — it picked this corridor because bus density is low and ISPARK at the destination is forty-two percent free. Google Maps said nineteen minutes. The agent says fifteen. Four minutes saved, for half a milli-dollar." |
| 62 – 78 s | Tap **Start drive**. Map camera snaps to driver pose — low tilt, bearing follows road. A turn banner slides in. Watch the TopBar balance tick down. | "Start drive. The camera locks, tilt drops, bearing rotates with the road ahead — Google-Maps-style navigation. And up top — see the balance pill tick down? That is the agent making further tool calls while I drive. No popups, no prompts, nothing in my way." |
| 78 – 90 s | Tap the balance pill. Wallet menu opens (address, copy, ArcScan, disconnect). | "One tap on the balance pill shows the wallet menu — address, copy, open-in-ArcScan, disconnect. It looks like a fintech app. There is no crypto jargon surfaced anywhere." |
| 90 – 95 s | Close the menu. Let the camera hold on the route for a beat. | "That is the silent-agent experience. Next — parking." |

---

### **Demo 3 · Park tab** — 8:22 – 9:02 (40 s)

**Tab:** `istanbul-route-ai.vercel.app/park`

**What's on screen:** Light map, "Tap anywhere on the map to check parking in that area" instruction bar, bottom card "Where do you need a spot?"

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 6 s | Open `/park`. Pan and zoom into a dense neighbourhood — Kadıköy or Beşiktaş works well. | "Second surface. Parking. No forms, no drop-downs — just a map." |
| 6 – 14 s | Tap somewhere with known ISPARK coverage. A pin drops; the card shows "Picked area — Kadıköy. Query to unlock." and the button reads **Unlock availability · $0.0001**. | "Tap the map. The zone is detected from coordinates. The button reads one-tenth of a cent — because this is one tool call, not a full route query." |
| 14 – 24 s | Tap **Unlock availability**. Loading state plays for 1–2 s. The card flips to "Area unlocked", with Free / Total / Lots stats and a ranked list. | "Same Gateway signature path as Drive — already authorised on this session, so no popup fires. The backend debits one-tenth of a cent and queries the live ISPARK endpoint for every lot within two kilometres." |
| 24 – 34 s | Point at the "P1 · P2 · P3" pins on the map, and then at the top row of the list — the lot with the most free spots. | "Here is the result — the five closest lots ranked by free spots. The top lot right now has forty-seven available. Pins are colour-coded P1, P2, P3 on the map. The driver didn't pay for a full route calculation — they paid for one data point." |
| 34 – 40 s | Tap the close (×) on the card to reset; tap map again elsewhere to make the point. | "Every tap is a new query, each one-tenth of a cent. The agent surface is silent and continuous — pay for exactly what you use." |

---

### **Demo 4 · Municipality console** — 9:02 – 9:57 (55 s)

**Tab:** `istanbul-route-ai.vercel.app/municipality`

**What's on screen:** Wide-desktop layout. Top bar with wordmark + "Municipality · Istanbul Büyükşehir". Four KPI tiles. Live on-chain feed (left) + Zone heatmap (right). Agent decision mix ring + Margin proof card.

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 10 s | Open `/municipality`. Let the four KPI tiles load: **Revenue · all time**, **Active vehicles**, **City-wide avg speed**, **Agent reroutes · 24h**. | "Flip personas. This is what the municipality sees. Four tiles at the top, all pulled from real endpoints — revenue in USDC, active vehicles from the IETT and fleet stream, city-wide average speed blended from those signals, agent reroutes in the last twenty-four hours." |
| 10 – 25 s | Scroll into the **Live on-chain feed** panel. Point at the streaming-dot indicator. Hover one row. Click the "↗" on a row — it opens ArcScan in a new tab. | "This is the live on-chain feed. Every row is a Circle Gateway settlement on Arc. Time, transaction hash, origin zone, destination zone, USDC amount. Click the arrow — it opens ArcScan, block-explorer-verified. This is not a mock feed. These are the transactions the agent is producing right now." |
| 25 – 38 s | Move to the **Zone heatmap** panel on the right. Point at the biggest red blob. Read the "Worst: Beyoğlu · 78%" label in the corner. | "Zone heatmap — blended from İBB traffic index plus live IETT bus speeds. Bubble size is congestion, colour is severity. Right now, Beyoğlu is the worst zone in the city. This number is how the agent's corridor-selection actually works underneath." |
| 38 – 48 s | Scroll down to the **Agent decision mix** ring. Point at the top two signals in the legend. | "Decision mix. Which signals did Gemini cite most in the last twenty-four hours? IETT density and IBB traffic are dominant — which makes sense for a transit-dense city. This ring turns the agent's reasoning into one glance." |
| 48 – 55 s | Point at the **Margin proof** card. Read the three rows — Ethereum fees, Arc fees, Saved today. | "And the business case. If every one of today's transactions had run on Ethereum L1, fees would be this much. On Arc, they're this much. The delta is exactly why this can only live on Arc." |

---

### **Demo 5 · Circle Developer Console** — 9:57 – 10:27 (30 s) · **required**

**Tab:** `console.circle.com` → **Wallets → Dev → Transactions**

**What's on screen:** Circle Console left sidebar, a list of 55+ transactions sent from the ARC-TESTNET Dev-Controlled Wallet `7f5471…13490`, each row with status (Complete), amount, asset, destination, and tx hash.

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 8 s | Switch to Circle Console. Scroll to the Transactions list. Let 8–10 rows be visible at once. | "This is the Circle Developer Console. The hackathon requires proof that at least one transaction was executed via the Console — we executed fifty-five." |
| 8 – 18 s | Point at the column headers (Status, Amount, Asset, Destination, Tx hash). Scroll the list slowly so the viewer sees rows keep coming. | "Every row: a Programmable Wallet transfer we created through Circle's SDK. Status Complete. Amount zero-point-zero-zero-zero-one USDC. Destination: the municipality treasury. Fifty-five of them, all from the agent-tool signal set." |
| 18 – 25 s | Click into one row's detail drawer. Show the tx hash, state timeline, and "View on block explorer" link. | "Open one. Every transaction has its full lifecycle — QUEUED, INITIATED, SENT, COMPLETE — and a link straight to the Arc block explorer." |
| 25 – 30 s | Click **View on block explorer** on the detail drawer. | "Let's follow that link." |

---

### **Demo 6 · ArcScan** — 10:27 – 10:47 (20 s)

**Tab:** `testnet.arcscan.app/tx/<hash>` — a hash you clicked from Circle Console

**What's on screen:** The Arc block explorer showing Transaction Details — Status: Success, From: 0x4cc4…5a1a, To: 0xF505…E5ae, Value: 0.0001 USDC, Timestamp, Block number.

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 8 s | Land on the ArcScan transaction page. Point at the **Status: Success** badge and the hash. | "Same hash on Arc Block Explorer. Status success. This proves the Circle Console call actually settled on chain — not off-chain, not in a database." |
| 8 – 15 s | Point at **From** (the Circle Programmable Wallet address) and **To** (the municipality treasury). | "From: my Circle Programmable Wallet. To: the municipality treasury. Native USDC value. One block. Sub-second inclusion." |
| 15 – 20 s | Point at the timestamp and the block number. | "Timestamp and block number are here — judges can verify this independently without trusting our UI." |

---

### **Demo 7 · GitHub TX_PROOF.md** — 10:47 – 11:12 (25 s) · **required**

**Tab:** `github.com/Himess/istanbul-route-ai/blob/master/TX_PROOF.md`

**What's on screen:** The rendered markdown file. Header says "126 real on-chain transactions on Arc Testnet". Two sections — Section A (55 via Circle SDK, Console-visible) and Section B (71 via agent settlement path).

| Time | Action | Say (verbatim) |
|---|---|---|
| 0 – 8 s | Open the file in GitHub. Let the header render — "126 real on-chain transactions on Arc Testnet". | "This is the repo. File called TX_PROOF-dot-MD. One hundred and twenty-six real on-chain transactions on Arc Testnet from this project." |
| 8 – 16 s | Scroll through **Section A** — the 55 Circle-SDK tx. Hover an ArcScan link without clicking. | "Section A — fifty-five transactions executed through the Circle Programmable Wallet SDK. These are the ones that show up in the Circle Console. Every row is a clickable link to Arc Block Explorer." |
| 16 – 22 s | Scroll to **Section B** — the 71 agent settlement-path tx. | "Section B — seventy-one more from the agent's live settlement path. The combined total is one hundred and twenty-six, more than twice the hackathon's fifty-transaction minimum." |
| 22 – 25 s | Scroll back to the top banner. Pause. | "Istanbul Route AI. Thank you for watching." |

---

## PART 3 · Recording setup & checklist

### Tools

- **Screen recorder:** Loom (simplest) or OBS (more control). 1080p, 30 fps minimum, 60 fps if your machine handles it.
- **Microphone:** Any USB condenser; run audio through Krisp.ai or Audacity noise-gate to clean background hiss.
- **Editor** (only needed if you record in multiple segments): DaVinci Resolve (free) or iMovie.

### Tabs to have open, in order (⌘1 … ⌘7)

1. `https://istanbul-route-ai.vercel.app/pitch` (press **F** for fullscreen)
2. `https://istanbul-route-ai.vercel.app/card` — MetaMask signed in, Arc Testnet, Gateway balance ≥ 0.01 USDC, at least a handful of ledger rows
3. `https://istanbul-route-ai.vercel.app/drive` — same wallet, Taksim origin pre-centered
4. `https://istanbul-route-ai.vercel.app/park` — map already zoomed to ~12, hovering Kadıköy/Beşiktaş
5. `https://istanbul-route-ai.vercel.app/municipality`
6. `https://console.circle.com/wallets/dev/transactions` — filter by wallet `0x4cc48ea31173c5f14999222962a900ae2e945a1a`
7. `https://testnet.arcscan.app/tx/0xef0406f6f84caf882f66de3b423dcd519a74a5a5d958a46c597936e279efe74c` — the first Circle-SDK tx from TX_PROOF.md Section A
8. `https://github.com/Himess/istanbul-route-ai/blob/master/TX_PROOF.md`

### Two-pass recording strategy (recommended)

Instead of trying to narrate and click perfectly in one take:

- **Pass 1:** record just the voice-over using only the slide deck. Read this script top to bottom. Export audio + slide-only video (≈6:12).
- **Pass 2:** record only the live demo segments (no voice) while playing back the voice-over so your clicks land on cue. Export demo-only video (≈2:30).
- **Stitch** the two in the editor, crossfading 300 ms at each transition. Background music optional — instrumental Lo-Fi at −20 dBFS keeps it alive without fighting the voice.

### Pre-record checklist

- [ ] MetaMask on Arc Testnet (chainId 5042002)
- [ ] Demo wallet has **Gateway balance ≥ 0.01 USDC** (check on /card)
- [ ] `/card` Recent ledger has ≥ 5 rows visible
- [ ] `/drive` — baseline + unlock flow tested in the last 30 minutes
- [ ] `/park` — one map-click query completed in the last 30 minutes
- [ ] `/municipality` feed is actively ticking (refresh right before recording)
- [ ] Circle Console session is alive and filtered by wallet `0x4cc4…5a1a`
- [ ] ArcScan tx page loaded and scrolled to show Status / From / To / Value
- [ ] GitHub TX_PROOF tab scrolled to the top banner (126 headline visible)
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
