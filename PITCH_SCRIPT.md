# Istanbul Route AI — Pitch Video Script

Final target video length: **3:00** (Circle Nanopayments Hackathon submission).

Slides live at: https://istanbul-route-ai.vercel.app/pitch — press **F** for fullscreen, **←/→** to navigate.

## Timing budget (180 seconds)

| Section | Slides | Approx. time |
|---|---|---|
| Hook & framing | 01 – 04 | 0:00 – 0:45 |
| How the agent loop works | 05 | 0:45 – 1:05 |
| Live demo · **Driver** (cut to /drive) | (screen recording) | 1:05 – 1:40 |
| Municipality dashboard (cut to /municipality) | 07 (live) | 1:40 – 2:00 |
| Flywheel + economics | 08, 09 | 2:00 – 2:20 |
| **Circle Console + ArcScan verification** (required) | (screen recording) | 2:20 – 2:45 |
| Stack + vision + close | 11, 14, 15, 16 | 2:45 – 3:00 |

Slides 06, 10, 12, 13 are background references; mention only if time allows. They still ship in the deck for judges reading the slides asynchronously.

---

## Slide-by-slide narration

> **Tip:** record your voice-over first at natural pace, then edit the slides to match. Leave ~0.2 s pause between slides so the spring transition can play.

### Slide 01 — Cover · **0:00 – 0:08** (8 s)

**Visual:** The cover slide with "Silent Gemini agent. USDC pays in whispers."

**Voice-over (~25 words):**
> "APIs monetize per request. Agents haven't — because gas made it impossible. Circle Nanopayments on Arc fix that. This is Istanbul Route AI."

---

### Slide 02 — Problem · **0:08 – 0:22** (14 s)

**Visual:** Left column: "Navigation updates every few minutes." Right column: big **40,000** + "ground-truth municipal vehicles · wasted."

**Voice-over (~35 words):**
> "Your navigation app updates traffic every two to three minutes using aggregated phone data. Meanwhile, forty thousand municipal vehicles are driving Istanbul's roads right now, producing ground-truth speed data every second. That data is wasted."

---

### Slide 03 — Insight · **0:22 – 0:34** (12 s)

**Visual:** Three cards (Bus 8 km/h, Garbage truck, Ambulance).

**Voice-over (~30 words):**
> "If a bus is crawling at eight kilometres per hour on Barbaros Boulevard, that corridor is jammed. Confirmed. Municipal fleet telemetry is a goldmine — already collected, already accurate, sitting unused."

---

### Slide 04 — Solution · **0:34 – 0:50** (16 s)

**Visual:** The paywall + six signal badges + pricing chips.

**Voice-over (~40 words):**
> "So we put an x402 paywall on that telemetry. A silent Gemini 3 Flash agent queries six real-time data tools — traffic, bus density, incidents, weather, parking, time of day — each call a sub-cent USDC settlement on Arc. Zero popups. Zero gas."

---

### Slide 05 — How it works · **0:50 – 1:08** (18 s)

**Visual:** Six numbered steps in a 2×3 grid, callout box at bottom.

**Voice-over (~45 words):**
> "The loop: user signs one typed-data via Circle Gateway. OSRM returns three route alternatives. The agent adaptively picks signals to query — it doesn't call weather for a two-block hop. Each tool call settles on Arc. Agent returns the best alternative with a rationale. Typical query: five to seven on-chain transactions."

*Cursor tip:* while narrating, briefly hover over each numbered card on the slide so the audience follows.

---

### **Live demo — Driver flow · 1:08 – 1:40** (32 s)

**Cut to the app.** Full-screen tab: `istanbul-route-ai.vercel.app/drive`.

**Screen recording sequence:**

1. (2 s) Open `/drive`, show initial screen with saved places.
2. (3 s) Tap **Home** → baseline route panel appears.
3. (3 s) Point at "Google Maps: 19 min" and locked "CityPulse: 🔒".
4. (3 s) Click **Unlock AI route · $0.0005**.
5. (4 s) MetaMask popup — sign EIP-3009 typed-data (no gas, no send).
6. (5 s) Agent "Thinking" state, rationale card appears with signal badges.
7. (4 s) Click **Start drive** — camera locks, turn banner slides in.
8. (4 s) Wallet pill ticks down: `−$0.0005` micro-animation.
9. (4 s) Tap wallet pill → menu opens → click **Disconnect** option briefly (demo polish).

**Voice-over during demo (~60 words):**
> "Standard Google Maps gives a naive ETA. To unlock our agent's pick, the user pays half a milli-dollar. One typed-data signature via Circle Gateway — no gas, not a send. The agent runs Gemini Function Calling across six tools, each a micropayment on Arc. Rationale appears. Start drive — the camera locks behind the driver. Every tool call ticks the wallet down silently."

---

### Slide 07 — Municipality console · **1:40 – 1:55** (15 s)

**Visual:** Slide 07 on screen, then optionally cut to live `/municipality` tab.

**Voice-over (~35 words):**
> "Flip personas. The municipality sees the other side. A live revenue ticker seeded from Arc events. A streaming on-chain payment feed. A zone heatmap from real IBB traffic plus live IETT bus speeds. Agent decision mix showing which signals drove routing today."

*Cursor tip:* show the real `/municipality` page briefly — the live feed scrolling is visually persuasive.

---

### Slide 08 — Flywheel · **1:55 – 2:07** (12 s)

**Visual:** Five orbiting nodes.

**Voice-over (~30 words):**
> "Everyone wins. The driver pays, saves time. The municipality earns from zero-cost data. Traffic redistributes, buses get faster, ambulances arrive sooner. Less congestion means less fuel. The flywheel compounds."

---

### Slide 09 — Economic & design proof · **2:07 – 2:25** (18 s)

**Visual:** Five-axis comparison table (Gas, Finality, Gas token, Fee predictability, Agent-native primitives).

**Voice-over (~45 words):**
> "Gas gets the headline, but Arc wins on five axes. Sub-second finality — agents can chain calls in real time. USDC as native gas — no two-token dance. Dollar-denominated, MEV-insulated fees. And Circle primitives — Gateway, x402, Wallets — are built in, not retrofit. Ethereum was made for capital markets. Arc was made for agents."

---

### **Live demo — Transaction verification · 2:25 – 2:50** (25 s, **required by hackathon**)

**Cut to browser tabs.** Have ready:
- `console.circle.com` logged in
- `testnet.arcscan.app/tx/<one of our hashes>` loaded
- `TX_PROOF.md` on GitHub loaded

**Recording sequence:**

1. (5 s) Circle Developer Console — open Gateway / Transfers view, hover over a recent entry.
2. (8 s) Switch to ArcScan tab. The transaction page for one of our agent settlements (e.g. `0xa4950113…bef13d3d`). Point at Status = Success, From/To addresses, and value.
3. (5 s) Switch to GitHub `TX_PROOF.md`. Scroll through the list — show "71 tx" header and ArcScan URL table.
4. (7 s) Jump to Slide 10 (On-chain proof) briefly — show the 71 number + breakdown card.

**Voice-over (~55 words):**
> "Let's verify. The Circle Developer Console shows Gateway transfers with full audit trail. Arc Block Explorer confirms the same hash — two hundred success, native USDC. Seventy-one verifiable on-chain transactions in our repo's TX_PROOF. A judge reproduces this in ninety seconds: clone, fund a wallet, run the replay script."

---

### Slide 11 — Circle stack · **2:50 – 2:58** (8 s)

**Visual:** Six Circle products with checkmarks.

**Voice-over (~20 words):**
> "Full Circle stack: Arc for settlement, USDC, Nanopayments, Gateway, Programmable Wallets, x402 — integrated, not stitched together."

---

### Slide 15 — Try it / 16 — Thanks · **2:58 – 3:00** (2 s)

**Visual:** Try-it slide with QR, then final wordmark.

**Voice-over (~10 words):**
> "Istanbul Route AI. Scan and drive. Thank you."

---

## Slides shown but not narrated

These appear briefly as visual context or live in the deck for async reading; the voice-over doesn't explicitly explain them because time is tight.

- **Slide 06 — Driver screens:** Visible for 1–2 s as we transition into the live demo.
- **Slide 10 — On-chain proof:** Shown for ~3 s right after the ArcScan cut — the 71 number reinforces what we just verified.
- **Slide 12 — Data stack:** Optional, drop in if you want to emphasise Gemini + Istanbul real data.
- **Slide 13 — Tx flow:** Optional reference slide; the live Circle + ArcScan demo is the stronger version of this.
- **Slide 14 — Vision:** Skip in a 3-minute cut; include only if you extend to 4 minutes for an on-site pitch.

---

## Recording instructions

### Tools

- **Screen recorder:** Loom (easy auto-upload) or OBS (more control). 1080p 60 fps.
- **Mic:** Any USB condenser; run audio through Krisp.ai for background removal.
- **Editor:** DaVinci Resolve (free) or iMovie. Only needed if you want to crossfade slide segments with demo cuts.

### Tab setup before recording

Open these in the following order (so ⌘1…⌘5 switches through them cleanly):

1. `https://istanbul-route-ai.vercel.app/pitch` (fullscreen with **F**)
2. `https://istanbul-route-ai.vercel.app/drive` — MetaMask already connected to Arc Testnet, demo wallet with Gateway balance
3. `https://istanbul-route-ai.vercel.app/municipality`
4. `https://console.circle.com` — logged in, on the Wallets/Transfers view
5. `https://testnet.arcscan.app/tx/0xa4950113c03b37ec781db47c9838885adacdd400092ee5b2f9811b1fbef13d3d` (or any hash from `TX_PROOF.md`)

### Recording strategy

Record in **three segments**, then stitch in post:

- **Segment A — Slides 1–5 narrated** (60 s): fullscreen deck, narrate with arrow keys.
- **Segment B — Driver live demo** (32 s): record `/drive` screen + MetaMask popup.
- **Segment C — Slides 7–9 narrated** (30 s): deck again.
- **Segment D — Tx verification live demo** (25 s): Circle Console + ArcScan + GitHub cut.
- **Segment E — Slides 11 / 15 / 16 close** (10 s).

Crossfade 300 ms between segments. Keep background music instrumental (e.g., *Lofi Geographic* or *Calm Presence*) at −18 dBFS under the voice-over.

### Checklist before "Record"

- [ ] MetaMask is on Arc Testnet (chainId 5042002)
- [ ] Demo wallet has Gateway USDC ≥ 0.01
- [ ] Deposit modal tested; unlock flow verified in the last 30 minutes
- [ ] `/municipality` feed is actively ticking (refresh right before recording)
- [ ] Circle Console shows your recent transfers (re-sign in if timed out)
- [ ] ArcScan tx hash tab loaded and scrolled to show From/To/Value
- [ ] Browser zoom is at 100 %
- [ ] Bluetooth headphones off (latency)
- [ ] Slack / email / Discord notifications muted

---

## Slide metadata for submission form

Paste these directly into lablab.ai form fields:

- **Slide deck URL:** `https://istanbul-route-ai.vercel.app/pitch`
- **Video URL:** `[your YouTube unlisted link once uploaded]`
- **GitHub:** `https://github.com/Himess/istanbul-route-ai`
- **Live demo:** `https://istanbul-route-ai.vercel.app`
- **Tx proof:** `https://github.com/Himess/istanbul-route-ai/blob/master/TX_PROOF.md`

Good luck. The kit is complete. Press **F**, hit record, and tell the story.
