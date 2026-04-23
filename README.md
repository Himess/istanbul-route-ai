# Istanbul Route AI — Municipal Traffic & Parking Nanopayments on Arc

> **Municipal vehicles are already everywhere. Their data is going to waste. Circle Nanopayments unlock this data for sub-cent per-query pricing. The municipality earns revenue. Drivers save time. The city gets smarter.**

## Live Demo

- **Home**: [istanbul-route-ai.vercel.app](https://istanbul-route-ai.vercel.app)
- **Drive (3D Navigation)**: [istanbul-route-ai.vercel.app/drive](https://istanbul-route-ai.vercel.app/drive)
- **Park (Parking Finder)**: [istanbul-route-ai.vercel.app/park](https://istanbul-route-ai.vercel.app/park)
- **Card (Gateway Wallet)**: [istanbul-route-ai.vercel.app/card](https://istanbul-route-ai.vercel.app/card)
- **Municipality Console**: [istanbul-route-ai.vercel.app/municipality](https://istanbul-route-ai.vercel.app/municipality)
- **Pitch Deck (live slides)**: [istanbul-route-ai.vercel.app/pitch](https://istanbul-route-ai.vercel.app/pitch)
- **Backend API**: [istanbul-route-ai-backend.fly.dev](https://istanbul-route-ai-backend.fly.dev)
- **Tx Proof (126 real tx)**: [TX_PROOF.md](./TX_PROOF.md)
- **Pitch Script**: [PITCH_SCRIPT.md](./PITCH_SCRIPT.md)
- **Circle Product Feedback**: [CIRCLE_PRODUCT_FEEDBACK.md](./CIRCLE_PRODUCT_FEEDBACK.md)

## Hackathon Tracks

- **Per-API Monetization Engine** — APIs charge per request using USDC at high frequency.
- **Agent-to-Agent Payment Loop** — Gemini-driven route agent pays internal data tools per decision.
- **Google Prize Track** — Uses Gemini 2.5/3 Flash with Function Calling for adaptive route reasoning.

## Why IstanbulRoute?

Istanbul has 262+ ISPARK parking lots and thousands of municipal vehicles on the road 24/7. This data is valuable but locked behind manual systems. IstanbulRoute monetizes it through Circle Nanopayments:

- **Route optimization**: Pay $0.0005 USDC → get AI-optimized route using 80 municipal vehicle positions
- **Parking availability**: Pay $0.0001 USDC → unlock real-time ISPARK lot occupancy
- **Gas-free payments**: Circle Nanopayments via x402 protocol (EIP-3009 off-chain signatures, batched settlement)

### Economic Proof

| Metric | Ethereum | Arc + Nanopayments |
|--------|----------|-------------------|
| Gas cost per tx | ~$0.50 | ~$0.000001 |
| Our avg payment | $0.0004 | $0.0004 |
| 126 tx gas cost (this submission) | **~$63** | **~$0.0001** |
| At production scale (1M queries/day) | **$500k / day** | **$1 / day** |
| Model viable? | **No** (gas > payment) | **Yes** (500,000× cheaper) |

This model is **impossible** on Ethereum. Circle Nanopayments + Arc make it viable.

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 16    │────▶│   Express API    │────▶│   Arc Testnet   │
│   React 19      │ WS  │   Socket.IO      │     │   USDC Native   │
│   MapLibre 3D   │◀────│   x402 Gateway   │     │   Smart Contracts│
│   Tailwind 4    │     │   Circle SDKs    │     │   126 real tx   │
│                 │     │   Gemini Agent   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
     Vercel                  Fly.io (FRA)          Chain 5042002
```

## Silent Agent — Gemini Function Calling

The user experience is unchanged: click A, click B, tap Go. The *behind-the-scenes*
experience is: **Gemini 3 / 2.5 Flash** takes the three OSRM alternatives and
decides — adaptively — which real-time signals to pull before picking a winner.

**Every tool call the agent issues is an Arc settlement.** Short off-peak hops
skip weather; long cross-Bosphorus trips pull IETT density per candidate.
Nothing is hard-coded — the LLM picks, the backend pays, the chain settles.

### Agent Tools (all $0.0001 USDC · Circle Nanopayments)

| Tool | Source | What it returns |
|------|--------|-----------------|
| `traffic_snapshot` | IBB Open Data + IETT | City-wide congestion index + per-zone speeds |
| `iett_density` | IBB SOAP API | Live bus count & avg speed near a candidate route |
| `incidents_on_route` | IBB CKAN | Active accidents/closures buffered around a route |
| `weather` | Open-Meteo | Rain/snow/visibility + driving-impact tag |
| `parking_near_destination` | ISPARK REST | Available lots, top 3 options near destination |
| `time_context` | Server clock | Rush-hour flag, day-of-week, Istanbul TZ |

### Example Decision (live output)

```
POST /api/route  { from: Taksim, to: Kadıköy }

agent: {
  modelId: "gemini-2.5-flash",
  chosenRouteIndex: 0,
  rationale: "Route A is recommended as it is off-peak with no reported
              incidents on the direct Bosphorus Bridge corridor.",
  signalsUsed: ["time_context", "incidents_on_route"],
  toolCalls: [
    { round: 1, name: "time_context",         tx: sim_97e4f7f1961277 },
    { round: 2, name: "incidents_on_route",   tx: sim_f71c796d33a157 },
    { round: 3, name: "iett_density",         tx: sim_9e6e49ab520217 }
  ],
  totalRounds: 4,
  elapsedMs: 11389
}
```

### 50+ On-chain Transaction Proof — 126 real tx on Arc Testnet

This submission produces **126 verifiable on-chain transactions** on Arc Testnet, split into two reproducible sets:

**Section A — 55 tx via Circle Programmable Wallet SDK** (visible in Circle Developer Console, satisfies the "executed via the Circle Developer Console" rule):

```bash
# From an ARC-TESTNET Dev-Controlled Wallet with ≥ 0.0055 USDC
CIRCLE_WALLET_ID=<arc-wallet-uuid> \
  SELLER=0xF505e2E71df58D7244189072008f25f6b6aaE5ae \
  COUNT=55 \
  npx tsx scripts/circleSdkSettlements.ts
```

Each tx is signed by Circle's MPC infrastructure via `client.createTransaction(...)`, then appears in **Circle Console → Transactions** AND on ArcScan. Output is saved incrementally to `backend/scripts/circle-sdk-tx.json` so runs are resumable.

**Section B — 71 tx via the agent's live settlement path** (mirrors what `settleAgentToolCall` does in production, no Gemini quota dependency):

```bash
PRIVATE_KEY=0x<payer> \
  SELLER=0xF505e2E71df58D7244189072008f25f6b6aaE5ae \
  COUNT=66 \
  npx tsx scripts/replayAgentSettlements.ts
```

Full clickable ArcScan list for both sections: [`TX_PROOF.md`](./TX_PROOF.md).
Circle Console verification: [console.circle.com/wallets/dev/transactions](https://console.circle.com/wallets/dev/transactions) filtered by wallet `0x4cc48ea31173c5f14999222962a900ae2e945a1a`.

## Circle Infrastructure Used

| Product | Usage | Status |
|---------|-------|--------|
| **Arc** | Settlement layer, USDC native gas | ✅ 2 contracts deployed |
| **USDC** | Native gas token + payment currency | ✅ Sub-cent pricing |
| **Circle Nanopayments** | `@circle-fin/x402-batching` Gateway middleware | ✅ Production |
| **Circle Wallets** | `@circle-fin/developer-controlled-wallets` SDK | ✅ One-click wallets |
| **Circle Gateway** | Unified cross-chain USDC balance display | ✅ Multi-chain |
| **Circle Bridge Kit** | `@circle-fin/bridge-kit` CCTP V2 transfers | ✅ Arc Testnet |
| **circlefin/skills** | `use-arc`, `use-gateway`, `use-developer-controlled-wallets` | ✅ Dev guidance |
| **x402 Protocol** | `@x402/fetch`, `@x402/core` HTTP-native payments | ✅ Auto 402 handling |
| **Google Gemini** | `@google/genai` Function Calling orchestrator | ✅ 2.5 Flash / 3 Flash Preview |

## Smart Contracts (Arc Testnet)

| Contract | Address | Purpose |
|----------|---------|---------|
| IstanbulRouteX402 | `0xD117bDB3d1463a1B47561eb74BEa88ebE93B81CF` | Route payments |
| IstanbulRouteParking | `0x198be13482770fa01e36ae199f8e6873ad2f7b91` | Parking payments |

- Solidity 0.8.24 + Foundry
- **30 tests**, all passing
- `call()` for refunds (no deprecated `transfer()`)
- Price change events for off-chain monitoring

## Features

### Drive — Navigation with Real-Time Traffic
- Full-screen map with 80 simulated municipal vehicles (15 Istanbul routes)
- OSRM real road-network routing with turn-by-turn directions
- Free baseline route → Paid optimized route comparison
- **3D navigation mode** (MapLibre GL JS, 60° tilt, bearing rotation)
- Car animation following route with camera tracking
- Circle Nanopayments: $0.0005 per route query (gas-free)

### Park — ISPARK Parking Finder
- 262+ real ISPARK parking lots from IBB Open Data API
- Click map → see count → pay $0.0001 → unlock locations + live occupancy
- Color-coded markers (green/yellow/red by occupancy)
- 15-minute data validity timer
- "Navigate Here" → Google Maps directions

### Istanbul Card — Gateway Wallet
- One-click Circle Wallet creation (no MetaMask needed)
- Gateway USDC deposit for gas-free payments
- Transaction history (routes, parking, deposits)
- Multi-chain balance display (Arc, Base Sepolia, Ethereum Sepolia)
- Top Up / Withdraw functionality

### Municipality — Operator Console
- Four live KPI tiles: revenue, active vehicles, city-wide avg speed, agent reroutes · 24h
- Streaming on-chain payment feed — every row links to ArcScan
- Zone heatmap blended from live İBB traffic + IETT bus speeds
- Agent decision-mix ring: which signals Gemini cited most in the last 24h
- Margin proof card: today's tx volume on Ethereum vs Arc
- All values pulled from real endpoints (`/api/dashboard/stats`, `/api/dashboard/payments`, `/api/dashboard/zone-heatmap`, `/api/dashboard/agent-mix`)

### Pitch — 16-Slide Live Deck
- `/pitch` renders a 16-slide presentation as a React app with Framer Motion transitions
- Keyboard navigation: ←/→ to move, `F` for fullscreen, `Home`/`End`, URL hash sync (`#3`)
- Real QR code on the "Try it now" slide
- Matching narration + demo script in [`PITCH_SCRIPT.md`](./PITCH_SCRIPT.md) (~10:40 target video)

## Data Sources

| Source | Data | Update |
|--------|------|--------|
| IBB Traffic API | Traffic congestion index | 1 min |
| IETT SOAP | Real bus GPS positions | 2 min |
| IBB CKAN | Traffic incidents | 5 min |
| ISPARK REST | 262+ parking lot occupancy | 3 min |
| Vehicle Simulator | 80 municipal vehicles, 15 routes | 500ms |
| OSRM | Real road-network routing | On-demand |

## API Endpoints

### Public (Free)
- `GET /api/health` — Health check
- `GET /api/dashboard/stats` — System statistics
- `GET /api/dashboard/vehicles` — Vehicle positions
- `POST /api/route/baseline` — Free OSRM route
- `GET /api/parking/nearby` — Parking lot count (no locations)
- `GET /api/nanopayments/info` — Nanopayment pricing info
- `GET /api/nanopayments/margin` — Economic viability proof
- `GET /api/gateway/status` — Gateway balance + status
- `GET /api/circle/status` — Circle infrastructure status

### Circle Nanopayments Protected (x402)
- `POST /api/route` — Optimized route + agent decision ($0.0005)
- `GET /api/traffic/vehicles` — Vehicle positions ($0.001)
- `GET /api/traffic/zone/:zone` — Zone data ($0.0005)
- `GET /api/parking/availability` — Parking data ($0.0001)
- `POST /api/tools/traffic_snapshot` — Agent tool ($0.0001)
- `POST /api/tools/iett_density` — Agent tool ($0.0001)
- `POST /api/tools/incidents_on_route` — Agent tool ($0.0001)
- `POST /api/tools/weather` — Agent tool ($0.0001)
- `POST /api/tools/parking_near_destination` — Agent tool ($0.0001)
- `POST /api/tools/time_context` — Agent tool ($0.0001)

## Tech Stack

**Frontend**: Next.js 16, React 19, Tailwind 4, Leaflet, MapLibre GL JS, Socket.IO, ethers.js v6, viem

**Backend**: Express, TypeScript, Socket.IO, ethers.js v6, `@circle-fin/x402-batching`, `@circle-fin/developer-controlled-wallets`

**Contracts**: Solidity 0.8.24, Foundry (forge), 30 tests

**Deploy**: Vercel (frontend), Fly.io Frankfurt (backend), Arc Testnet (contracts)

## Local Development

### Backend
```bash
cd backend
cp .env.example .env  # Add PRIVATE_KEY, CIRCLE_API_KEY, CIRCLE_ENTITY_SECRET
npm install
npm run dev  # http://localhost:3001
```

### Frontend
```bash
cd frontend
cp .env.example .env.local  # Add NEXT_PUBLIC_BACKEND_URL, etc
npm install
npm run dev  # http://localhost:3000
```

### Contracts
```bash
cd contracts
forge install
forge build
forge test  # 30 tests
```

## Environment Variables

### Backend (.env)
```
ARC_TESTNET_RPC_URL=https://rpc.testnet.arc.network
CONTRACT_ADDRESS=0xD117bDB3d1463a1B47561eb74BEa88ebE93B81CF
PARKING_CONTRACT_ADDRESS=0x198be13482770fa01e36ae199f8e6873ad2f7b91
PRIVATE_KEY=<deployer-private-key>
CIRCLE_API_KEY=<circle-api-key>
CIRCLE_ENTITY_SECRET=<circle-entity-secret>
PORT=3001

# Silent Agent (Gemini Function Calling)
GEMINI_API_KEY=<aistudio.google.com key>
GEMINI_MODEL=gemini-2.5-flash        # or gemini-3-flash-preview
AGENT_TX_MODE=simulated               # or "onchain" for submission demo
AGENT_PRIVATE_KEY=<funded agent wallet for onchain mode>
```

### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://istanbul-route-ai-backend.fly.dev
NEXT_PUBLIC_WS_URL=https://istanbul-route-ai-backend.fly.dev
NEXT_PUBLIC_CONTRACT_ADDRESS=0xD117bDB3d1463a1B47561eb74BEa88ebE93B81CF
NEXT_PUBLIC_PARKING_CONTRACT_ADDRESS=0x198be13482770fa01e36ae199f8e6873ad2f7b91
NEXT_PUBLIC_ARC_CHAIN_ID=5042002
NEXT_PUBLIC_ARC_RPC_URL=https://rpc.testnet.arc.network
```

## License

MIT
