# Circle Product Feedback — Istanbul Route AI

Structured exactly to the hackathon submission form: **Products Used · Use Case · Successes · Challenges · Recommendations**.

---

## Products Used

Arc (Testnet), USDC (as both native gas and transfer currency), Circle Nanopayments (`@circle-fin/x402-batching`), Circle Programmable Wallets / Developer-Controlled Wallets (`@circle-fin/developer-controlled-wallets`), Circle Gateway (EIP-3009 TransferWithAuthorization flow), Circle Bridge Kit / CCTP V2 (`@circle-fin/bridge-kit`), the x402 protocol (`@x402/fetch`, `@x402/core`), and the `circlefin/skills` AI development guides. Every one of these is used in a real production code path in the repo — none are mocks.

---

## Use Case

Istanbul Route AI is an agent-native municipal traffic data marketplace. A silent Gemini 3 Flash agent picks the driver's route using live Istanbul fleet telemetry — İBB traffic index, IETT bus density, incidents, weather, ISPARK parking, and time-of-day. Each of these six tools is paywalled with x402 at $0.0001 per call. A full route query costs the user $0.0005 and produces 5–7 real on-chain transactions on Arc.

We chose the Circle stack because it is the only combination that makes this economically and experientially viable:

- **USDC as native gas** eliminates the "hold volatile ETH to pay gas" problem — users top up USDC once and never think about gas again.
- **Nanopayments + x402** enable $0.0001 per-call pricing. On Ethereum L1 the gas per call would exceed the price itself by 5,000×. On Arc, the gas is effectively zero because USDC *is* the gas.
- **Circle Gateway's EIP-3009 flow** unlocks the design-defining UX: one signature at session start, then silent debits forever. No popup during the drive.
- **Programmable Wallets (Developer-Controlled)** let us onboard non-crypto users without MetaMask, and let us script a reproducible 55-tx demo that appears inside the Circle Developer Console for the judges.
- **Bridge Kit / CCTP V2** lets users on other testnets bring USDC to Arc without leaving the app.

The project submission includes **126 verifiable on-chain transactions on Arc Testnet** — 55 executed through the Circle Programmable Wallet SDK (fully visible in Circle Developer Console) plus 71 through the agent's live settlement path. The full list with clickable ArcScan links is in [`TX_PROOF.md`](./TX_PROOF.md).

---

## Successes

**Arc Testnet**
- USDC-as-native-gas is a category-defining UX win. Users don't need to understand gas tokens, hold ETH, or wait out price spikes.
- Sub-second finality meant a full 5–7-tool agent loop finalizes before the driver's UI animation finishes.
- EVM compatibility was seamless — Solidity + Foundry + viem + OSRM all ran on Arc without chain-specific modifications.
- The Circle faucet (`faucet.circle.com`) was reliable for multi-wallet funding.

**Circle Nanopayments (`@circle-fin/x402-batching`)**
- `createGatewayMiddleware()` is genuinely elegant — one function call to paywall any Express endpoint with sub-cent pricing. Moved from custom middleware to the official SDK in under an hour.
- Batched settlement is the core innovation that makes this project possible at all: 126 tx in our submission, each costing the user $0.0001–$0.0005 with zero gas.
- The `nanopayments/quickstarts/seller.md` doc was the single most useful page in the Circle ecosystem — clear, actionable, worked first try.

**Circle Programmable Wallets (Developer-Controlled)**
- `initiateDeveloperControlledWalletsClient()` → `createWalletSet()` → `createWallets()` flow is clean and predictable.
- Entity-secret auto-rotation is handled transparently by the SDK — not something we had to think about.
- `createTransaction` produces Console-visible transactions. We generated 55 real Arc tx from a TypeScript script and every one of them appears in the Developer Console Transactions tab with full QUEUED → INITIATED → SENT → COMPLETE lifecycle and a direct block-explorer link. For demoing on-chain proofs to non-crypto reviewers this is enormously powerful.

**Circle Gateway**
- EIP-3009 TransferWithAuthorization + Gateway's debit flow is the *only* pattern we found that supports "one signature, many silent debits" — which is the UX hinge of the entire project. No other stack we evaluated (Stripe, Base, Polygon ZK) gets us this.

**`circlefin/skills` repo**
- `use-arc` surfaced the correct Arc chain config (Chain ID 5042002, RPC, USDC address `0x3600...0000`) and the dual-decimal warning (18 for native gas, 6 for ERC-20) that would otherwise have been a show-stopping bug.
- `use-developer-controlled-wallets` got our entity-secret registration right on the first attempt.
- `use-gateway` explained the Gateway Wallet / Minter architecture and domain IDs clearly.

**Bridge Kit**
- Arc Testnet is already in Bridge Kit's 41-chain matrix. CCTP V2 burn-and-mint worked end-to-end.
- Types are comprehensive — auto-complete guided us through the API without docs.

---

## Challenges

Grouped by severity. Every one of these was encountered in the real code path.

**Critical — Nanopayments CORS gotcha with `PAYMENT-REQUIRED` header.** `createGatewayMiddleware()` returns a 402 response whose body is an empty `{}` (2 bytes) and whose payment requirements live in the `PAYMENT-REQUIRED` header. Browsers block access to custom headers unless they're listed in `Access-Control-Expose-Headers`. The `@x402/fetch` client fails with "Failed to parse payment requirements: Invalid payment required response" — and nothing in the docs mentions this. We spent 4+ hours debugging. The fix was one line of CORS config.

**Critical — Programmable Wallets on `ARC-TESTNET` are hidden from default `listWallets({})`.** Without explicitly passing `{ blockchain: "ARC-TESTNET" }`, the SDK returns only the 10 `EVM-TESTNET` wallets and omits the real Arc wallet. The follow-up balance call then fails with HTTP 400, `code: 156027`, `"the specified blockchain is either not supported or deprecated"` — which is misleading because the blockchain *is* supported; the wallet just wasn't in the filter. Cost us ~30 minutes of debugging a wallet that appeared "missing."

**Critical — No browser/MetaMask buyer guide for Nanopayments.** The buyer quickstart uses `GatewayClient` with a `privateKey` parameter — unusable in a browser because we can't ask users for their private key. We reverse-engineered `BatchEvmScheme` to build a MetaMask-compatible signer from viem's `walletClient`, with `as any` casts where types didn't align.

**High — No built-in nonce queue for parallel `createTransaction`.** On EVM chains a Programmable Wallet rejects a new transfer while the previous one is still pending, with `"Wait for pending transactions to be included on the blockchain before submitting new requests"`. When we tried to generate 55 settlements with `Promise.all` (concurrency 3), 44 of 55 failed instantly. We had to rewrite the script as strictly sequential (create → poll to `COMPLETE` → next create), turning a 2-minute job into ~10 minutes.

**High — `tokenId` for native USDC on Arc is undocumented.** `createTransaction` requires a `tokenId` UUID, but Arc's "native" currency IS USDC — so developers reasonably expect `tokenId` to be optional for native transfers. The correct path (call `getWalletTokenBalance`, find the USDC entry, use `token.id`) is not documented anywhere we found.

**High — Arc chain ID hex missing from Arc docs.** `5042002` in hex is `0x4CEF52`. We originally computed `0x4CF0A2` from a manual conversion error and MetaMask rejected our deposit payload with `"chainId should be same as current chainId"`. The hex does not appear on Arc's landing page, in the `circlefin/skills` repo, or in any testnet doc — only the decimal.

**High — `@circle-fin/x402-batching/client` is ESM-only.** Our Express backend defaulted to CommonJS. Importing the client failed with `ERR_PACKAGE_PATH_NOT_EXPORTED`. We migrated the whole backend to ESM (`"type": "module"`) to use `GatewayClient` — a non-trivial breaking change for most Node apps.

**High — ethers v6 adapter type mismatch (Bridge Kit).** `@circle-fin/adapter-ethers-v6`'s `createAdapterFromProvider()` expects `Eip1193Provider` but `ethers.BrowserProvider` doesn't satisfy it. Required an `as any` cast.

**Medium — Gateway accepts self-payment signatures then silently 402s.** If `payer == seller`, Gateway accepts the EIP-3009 signature but the settlement returns HTTP 402 with no error body. The root cause (protocol refuses self-sends) is sensible, but the failure mode is confusing — the user already signed and blames the wallet.

**Medium — x402 `registerBatchScheme` has an unsafe wildcard default.** Without pinning `schemes: ["eip155:5042002"]` explicitly, the browser client attempted settlement on the wrong chain when multiple chains were registered. The doc examples use a wildcard.

**Medium — `circlefin/skills` gaps.**
- `use-arc` doesn't mention the `eth_getLogs` 10,000-block range limit on Arc Testnet RPC. We hit it loading historical contract events and had to implement chunked queries.
- `use-gateway` focuses on direct contract interaction and doesn't cross-reference `@circle-fin/x402-batching` — the SDK most hackathon teams actually use.
- There is no `use-nanopayments` skill. Given Nanopayments is the flagship product for this hackathon, the absence is surprising.

**Medium — Arc Testnet RPC occasional instability.** `eth_getLogs` sometimes returns `-32614` even for in-range queries (retry with backoff resolved it). `wss://rpc.testnet.arc.network` occasionally drops under sustained 10-second polling.

**Low — Developer Console entity-secret registration is SDK-only.** A "one-click generate + register" button would shave meaningful time off hackathon onboarding.

---

## Recommendations

Ordered by expected DX impact.

1. **Publish a `@circle-fin/x402-react` package** with hooks (`useGatewayPayment`, `useGatewayBalance`, `useGatewayDeposit`) that wrap the browser-wallet → Gateway-deposit → x402-payment flow. Reduces browser integration from ~150 lines of custom code to ~10 lines. This is the single largest developer-experience win available.

2. **Add a `use-nanopayments` skill to `circlefin/skills`** covering seller Express middleware, browser buyer integration, the Gateway deposit flow, x402 protocol concepts, and the CORS/type/ESM gotchas listed above. This one skill would have saved us ~6 hours of debugging.

3. **Add an `autoQueue: true` option (or a `createTransactions(batch)` helper)** to the Programmable Wallet SDK that serializes parallel transfer calls internally. Every team building a high-volume demo will hit the pending-tx wall.

4. **Auto-resolve `tokenId` when `blockchain` is set and the token is native USDC** on `createTransaction`. Alternatively, add a short "How to find the `tokenId` for USDC on Arc" section to the quickstart.

5. **Make `listWallets({})` return all wallets regardless of chain**, OR make the downstream error specific: `"wallet X lives on ARC-TESTNET which is not in your filter"`.

6. **Publish a "Browser Buyer" quickstart** showing: constructing a `BatchEvmScheme` from a MetaMask/viem `walletClient`, registering it with `x402Client`, using `wrapFetchWithPayment(fetch, client)`, and handling Gateway deposit from a browser wallet.

7. **Document the CORS `exposedHeaders: ["PAYMENT-REQUIRED"]` requirement** in the seller quickstart. Alternative: have the middleware also include payment requirements in the response body so clients have a fallback.

8. **Surface Arc chain ID hex + MetaMask "Add Network" button** on the Arc landing page and in the `use-arc` skill. Two-line fix, eliminates the most common first-day error.

9. **Reject self-payments at the Gateway API level** with a descriptive error (`"payer and destination must differ"`) at signature-validation time, not at settlement time.

10. **Require explicit `schemes` in `registerBatchScheme`** (no wildcard default) and document the canonical `eip155:<chainId>` format.

11. **Provide CJS exports alongside ESM for `@circle-fin/x402-batching/client`**, or clearly document the ESM requirement up-front.

12. **Add a `demoMode: true` flag to `createGatewayMiddleware()`** that bypasses Gateway verification for local testing. Currently every developer needs real testnet USDC + a deposit just to iterate locally.

13. **Ship a "Deposit USDC from any chain to Gateway" React component** (Stripe-Elements-style) with chain selection, amount input, and tx confirmation. This is the biggest UX friction point for new users.

14. **Accept `ethers.BrowserProvider` directly in `@circle-fin/adapter-ethers-v6`**, or document the required cast.

15. **One-click entity-secret registration in the Developer Console** — generate + register without opening a code editor.

---

## Net verdict

Circle's stack is the only viable substrate for sub-cent on-chain payments, and Arc + Nanopayments + Programmable Wallets + Gateway is the cleanest agent-payment combination we have built on. The core SDKs work reliably; the gaps are almost entirely in browser integration, CORS/ESM plumbing, and documentation. Every single one of the 15 recommendations above is solvable without protocol changes — most are a PR to docs or a small SDK patch. Fixing them would make Circle's stack the obvious default for agent-native applications across the ecosystem.

**Team:** Istanbul Route AI
**Track:** Per-API Monetization Engine · Agent Payment Loop · Gemini (Google AI)
