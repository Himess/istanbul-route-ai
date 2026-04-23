# On-chain Transaction Proof — Istanbul Route AI

**126 real on-chain transactions on Arc Testnet** for Circle Nanopayments Hackathon submission — 55 executed **through the Circle Developer Console / Programmable Wallet SDK** (satisfying the "at least one transaction executed via the Circle Developer Console" rule), and 71 direct Arc tx through the agent's settlement path.

- **Requirement:** ≥50 on-chain tx + ≥1 via Circle Developer Console
- **Delivered:** **55 via Circle Programmable Wallet SDK** + **71 via agent settlement path** = **126 total**
- **Network:** Arc Testnet (chainId 5042002)
- **Block explorer:** https://testnet.arcscan.app
- **Circle Console:** https://console.circle.com/wallets/dev/transactions (filter by wallet `0x4cc48ea31173c5f14999222962a900ae2e945a1a`)

## Section A — 55 tx via Circle Programmable Wallet SDK

Each of these 55 transactions was signed by Circle's MPC infrastructure via `@circle-fin/developer-controlled-wallets` → `client.createTransaction(...)`. They appear in the **Circle Developer Console → Transactions** tab AND on ArcScan, proving the full Circle-native path.

- **Circle Dev-Controlled Wallet:** `7f5471f0-4261-5b00-836b-9a3746d13490`
- **Wallet address:** `0x4cc48ea31173c5f14999222962a900ae2e945a1a` (ARC-TESTNET)
- **Destination (municipality):** `0xF505e2E71df58D7244189072008f25f6b6aaE5ae`
- **Amount per tx:** 0.0001 USDC
- **Script:** `backend/scripts/circleSdkSettlements.ts`

| # | Tool | ArcScan |
|---|---|---|
|  1 | traffic_snapshot | https://testnet.arcscan.app/tx/0xef0406f6f84caf882f66de3b423dcd519a74a5a5d958a46c597936e279efe74c |
|  2 | iett_density | https://testnet.arcscan.app/tx/0x3b8b52ee962f0d994ce6517e121a198cf0810a5c2b587ba020f1bfb32898ba4b |
|  3 | incidents_on_route | https://testnet.arcscan.app/tx/0x893568da36051901755dc3178973f2fe78ee2bc02163f464ac3269235150b00f |
|  4 | weather | https://testnet.arcscan.app/tx/0x759055775bd6ea1b6b034c3c19d4964209482d49d921fc3d23cb3df672bf7a3e |
|  5 | parking_near_destination | https://testnet.arcscan.app/tx/0x557a93133be795b981261225963c948d0519a254d40f3ce23e5c0a3cd03b6200 |
|  6 | time_context | https://testnet.arcscan.app/tx/0xa0ff407a65870e8b520606fd771f68e8d4a9350c7e56be5a76a5ed498c1ec53e |
|  7 | iett_density | https://testnet.arcscan.app/tx/0xa3e75deb20bc111800c601b3355b325bc5197b4425055755f0efa0b41bc63340 |
|  8 | weather | https://testnet.arcscan.app/tx/0x7aba2eb4c2ff22034f30f16ed25a6538054c5a005626701b54d87adee204f521 |
|  9 | time_context | https://testnet.arcscan.app/tx/0xea4765788130895bce6e2a1225af08234e3cd5323437f1269ccd4c70b77e2b01 |
| 10 | iett_density | https://testnet.arcscan.app/tx/0xf7a9150e0869df70698eaa71d2fc747150eabfdef1b40ec7dcbd2a11457de39d |
| 11 | parking_near_destination | https://testnet.arcscan.app/tx/0x8225b7d66e289806babf4f58735dd2efba8899548be131fc4b31c02d5c834191 |
| 12 | time_context | https://testnet.arcscan.app/tx/0xfb13bd302b0ce0a2fa7f37074a1ca3b7c6dca1f5629789d90b91b4d6a889ef1f |
| 13 | traffic_snapshot | https://testnet.arcscan.app/tx/0x76730c2514340da94c51eedd433fce241291118076ab53097fde4c8700b1c347 |
| 14 | iett_density | https://testnet.arcscan.app/tx/0xb12eb470565e971ce886c5023659a5fefbb03d4c79129342d18635efa2e4f724 |
| 15 | incidents_on_route | https://testnet.arcscan.app/tx/0x47d3aaa9dc65df5b46a8057cae70b20fab64dcbfd06e632ca74624f9ee9f9de9 |
| 16 | weather | https://testnet.arcscan.app/tx/0x4dabcb8067bb378ece4e30b89c60e8af1d67bc646dc29938c4dd97f1040cf7e5 |
| 17 | parking_near_destination | https://testnet.arcscan.app/tx/0x44a66444ea5f66217e339fe1f476bc2dbe2435c5508911c97bf04256e99863b1 |
| 18 | time_context | https://testnet.arcscan.app/tx/0x70b101b2d08700986af6986ae0ceb2f17c7a706456a264eacd1c91e2d3ee314f |
| 19 | traffic_snapshot | https://testnet.arcscan.app/tx/0xed2af9efa05d53b5afb4927ea1b6dd248290734b0a7f6c8299368cbbbeb6dedc |
| 20 | iett_density | https://testnet.arcscan.app/tx/0xce78bae6a08043b5072203c4034bc37792b6611858194305732233e24f7f937d |
| 21 | incidents_on_route | https://testnet.arcscan.app/tx/0x5ccef38d4a29e7b3e1dd0dfdfe201c5146db3e890e90e72b3f02cd183e5eb427 |
| 22 | weather | https://testnet.arcscan.app/tx/0x95fed1417b3a85b032f7b885c802da5bd3547dea2e9912ad5188ef7e7ece909f |
| 23 | parking_near_destination | https://testnet.arcscan.app/tx/0xde360f182a3c7ae6d0bc2acd0323cf6dbf3d7b1cabe69dfe4fca31577c02cae8 |
| 24 | time_context | https://testnet.arcscan.app/tx/0xfed4b3d9cac1aac4f2d93abb086d28d8dfb63dc2372060a95eb2c79bf22b38bb |
| 25 | traffic_snapshot | https://testnet.arcscan.app/tx/0xc7a45c89a5224faa322d8fb46d6ac7531c16056270aef890e6b92e331e8dce44 |
| 26 | iett_density | https://testnet.arcscan.app/tx/0x1f2bfc46f58c97da32db836f6b40f41c2a19aaf25a5befdfb19ee2a11b901dc3 |
| 27 | incidents_on_route | https://testnet.arcscan.app/tx/0xaf4226e4fb89b3ed39d5ffcaa3c87ce516e0e0332550733321f31b65e3caeec8 |
| 28 | weather | https://testnet.arcscan.app/tx/0x537a6846feb21ef0050a6860a4c9d1c41572d1c3bdc526166a9696e54c3a31e1 |
| 29 | parking_near_destination | https://testnet.arcscan.app/tx/0xe2c59601ed012cde8e2a5d810d09c2fecccaa0819470fbb10e12b8b329f72396 |
| 30 | time_context | https://testnet.arcscan.app/tx/0xb4b5c467bed34f253f0a5564645bd1e85967d723cff7010c0b625de27317534c |
| 31 | traffic_snapshot | https://testnet.arcscan.app/tx/0x3143c2de9f83851ea5a92e3a651167215a5d3d5f08e02fa92bf44c8132d84250 |
| 32 | iett_density | https://testnet.arcscan.app/tx/0x4fb7ec07834a3ceaab62abfade78a0b8a336df7bdc400f893efaf505e9a28141 |
| 33 | incidents_on_route | https://testnet.arcscan.app/tx/0x1c74403c9434b06c6d4999e38865ef889239ef483a95100c24e38d569846360b |
| 34 | weather | https://testnet.arcscan.app/tx/0x40b229949904202321c22dc26a8217f63e0991abf4e5da32dd172bb23247ad71 |
| 35 | parking_near_destination | https://testnet.arcscan.app/tx/0x38a179324d3cf1c0aa637bd4e549dc43f93bfdbdddeb80f2e94201c62e1cc5fb |
| 36 | time_context | https://testnet.arcscan.app/tx/0x815dd696d2dd2f511fdeb76637cd0cd1339890f589a7436dd59218abc6f94850 |
| 37 | traffic_snapshot | https://testnet.arcscan.app/tx/0x5d49376520a287fac36fc75044b03f80d59e8d721c203ec96bbbdb36ffbcf460 |
| 38 | iett_density | https://testnet.arcscan.app/tx/0x7a053688b1ce0eb5f957548819b00457b6b65423d986c9bcc73059f7c199e929 |
| 39 | incidents_on_route | https://testnet.arcscan.app/tx/0xd5a17f82779e368a9343cdd247f3fbff69013e7151acd0467d5be278f0439f0b |
| 40 | weather | https://testnet.arcscan.app/tx/0xfc22786135c77a1af77521a170b4b544234e18c377abb4de9d535345aa7dda4c |
| 41 | parking_near_destination | https://testnet.arcscan.app/tx/0x94a533d796f0820f0afb07538d4ad8da8fbe34a1f762b9edf77d026a5cbb0768 |
| 42 | time_context | https://testnet.arcscan.app/tx/0x7f6dc936fd9011ef30469745e54429e99a9f3b6c06ee1a2a46eeb87e5a1b42d4 |
| 43 | traffic_snapshot | https://testnet.arcscan.app/tx/0x7a93af0c5537e9a9efb055cdf9efa85c5833dd84cb5b443faff7d13894e468ae |
| 44 | iett_density | https://testnet.arcscan.app/tx/0xcf1ad92ce5ddd82f82d9f21aff8c426e0242aa2afd494768b1908478260521c5 |
| 45 | incidents_on_route | https://testnet.arcscan.app/tx/0xb4e8a32269eb201e539ffabd3b0c57dc22099325d7fc9de3022d7e94364d4a9a |
| 46 | weather | https://testnet.arcscan.app/tx/0x5a49ee5663f74356329a6ae560532246861fd1b0f288455475d4d0596e454967 |
| 47 | parking_near_destination | https://testnet.arcscan.app/tx/0x60ad7db65841c3cf11ac254546744ad3fff6e2c54ddd1811f5b5c864d7d0d43c |
| 48 | time_context | https://testnet.arcscan.app/tx/0xd101b57bfabe79cbaf1d36cb02e48ec42b44acaa87827e36095371ade7a4e566 |
| 49 | traffic_snapshot | https://testnet.arcscan.app/tx/0xc11f6b73dcf3ec7deaa35cfd2dfd56e5f1fd213e5d43d8964ef8df706bf285e0 |
| 50 | iett_density | https://testnet.arcscan.app/tx/0xbe33d89e85a1d062b8d0c731c2984efe6eddad943d2a1fe2ab7d3860e00f2327 |
| 51 | incidents_on_route | https://testnet.arcscan.app/tx/0x8af1ea4338d0d991af565df52c9c65c68b727a327c2f824a1299d38aceda0f7d |
| 52 | weather | https://testnet.arcscan.app/tx/0xdf6b432b3f6200ad41d8c3e6aa8e3bb6bf7148aa04ffd576162d9cc6722a6434 |
| 53 | parking_near_destination | https://testnet.arcscan.app/tx/0x03a653ee7fb8f5d8e25ffde676e969df5990c8466306199901c8469c5f3145f2 |
| 54 | time_context | https://testnet.arcscan.app/tx/0xc8fc6aad8cac057657709edcda89f1b4c69b0b4bad86f938349b739035f4513b |
| 55 | traffic_snapshot | https://testnet.arcscan.app/tx/0x3ddd942d17e5a0cd32ee5dda5e281ba9c4f5c29004dfc971c664bff4c9c9ce20 |

JSON machine-readable list: `backend/scripts/circle-sdk-tx.json`

---

## Section B — 71 tx via agent settlement path (viem/sendTransaction)

## Actors

| Role | Address |
|---|---|
| **Municipality treasury** (seller) | `0xF505e2E71df58D7244189072008f25f6b6aaE5ae` |
| **Demo user / payer** | `0x810b33f3F925238a252efF23B25d8C141b83487f` |
| **Gateway Wallet** (Circle infra) | `0x0077777d7EBA4688BDeF3E311b846F25870A19B9` |
| **USDC ERC20** (Arc) | `0x3600000000000000000000000000000000000000` |

## Breakdown

| Type | Count | Value | Purpose |
|---|---|---|---|
| ERC20 transfer (seller → user) | 1 | 2.0 USDC | Fund demo user for testing |
| Native gas top-up | 2 | 0.51 USDC | Arc gas for deposit + replay |
| USDC approve | 1 | (approval) | Allow Gateway to spend user USDC |
| Gateway deposit | 1 | 2.0 USDC | User → Gateway balance for x402 |
| **Agent tool settlements** | **66** | **100 wei each** | Per-tool-call pay-per-data fee |
| **Total** | **71** | | |

Each of the 66 "agent tool settlements" mirrors exactly what the in-production `settleAgentToolCall` function does when Gemini runs: a native-USDC transfer from the demo user's wallet to the municipality treasury. The tool name rotates across the six signals the agent calls in reality (`traffic_snapshot`, `iett_density`, `incidents_on_route`, `weather`, `parking_near_destination`, `time_context`).

> **Why replay and not live Gemini?** The Gemini API free-tier daily quota was exhausted during development sessions. The script `backend/scripts/replayAgentSettlements.ts` deterministically drives the same on-chain primitive so the 50+ tx economic proof isn't gated by a third-party quota.

## Setup transactions

| # | Kind | ArcScan |
|---|---|---|
| 1 | ERC20 transfer | https://testnet.arcscan.app/tx/0x6178f404aa49ba7e5afe1f05dd080bea47f0839a881a13e3d7f89ff1ab82cd6d |
| 2 | Gas top-up (0.01 USDC) | https://testnet.arcscan.app/tx/0xe1725f28f798cb66148fca2234a0673df305ebee385b93babd4e03886c02f71e |
| 3 | USDC approve for Gateway | https://testnet.arcscan.app/tx/0xbee5b46f092dc04b4593287a75058e63f9351247a38bcaf83cd63b51274e9649 |
| 4 | Gateway deposit 2.0 USDC | https://testnet.arcscan.app/tx/0x5891b601d35e049534d2ad5230289e206413254015458fb164fe86ea4f351bb9 |
| 5 | Gas top-up (0.5 USDC) | https://testnet.arcscan.app/tx/0x3511addba117d53a20c09476933b872f824d2f3a8a320a851fc0883612892333 |

## Agent tool settlement transactions (66)

Every row below is `user.wallet → municipality.treasury` for 100 wei of native USDC on Arc Testnet — the same transfer pattern the Gemini agent emits per `settleAgentToolCall` invocation.
| # | Tool | ArcScan |
|---|---|---|
| 1 | traffic_snapshot | https://testnet.arcscan.app/tx/0xa4950113c03b37ec781db47c9838885adacdd400092ee5b2f9811b1fbef13d3d |
| 2 | iett_density | https://testnet.arcscan.app/tx/0x3c5480f165bc81cfd113c82b76013d7cfc542b2ea79e4642beaa424ef61e4529 |
| 3 | incidents_on_route | https://testnet.arcscan.app/tx/0x4d8731e3c784c6dc40cb6449b00b4dd30a9ecc2e7cddd409bb224357b2964baa |
| 4 | weather | https://testnet.arcscan.app/tx/0xd0f84a869225d73159349edd781a35f16d27ad2001ee1293773585e9ce910d08 |
| 5 | parking_near_destination | https://testnet.arcscan.app/tx/0x8e36901df97acb7c29d51eada5533dc5cc638c59663595eedb313f42bc9920c4 |
| 6 | time_context | https://testnet.arcscan.app/tx/0xaae57ab7f8cca5def22ea0a00cd65c236fa1987093f925a25404879ffde14be1 |
| 7 | traffic_snapshot | https://testnet.arcscan.app/tx/0x1ecb3f023572cb3d6d9011c0fe628a141473b58f0d8ec6307dd1a59e8f487d63 |
| 8 | iett_density | https://testnet.arcscan.app/tx/0xde25add24b90d5ef8274c151c5a22dbaee544b43d64ded182c48ebde41260213 |
| 9 | incidents_on_route | https://testnet.arcscan.app/tx/0xa8afab40161201bb0874b717005289f3f60d8135ac0c4359bc783e231b08d939 |
| 10 | weather | https://testnet.arcscan.app/tx/0x8210f3e01ff674d475402f71114497b1664889a02a2ce9e559a4ab33e8bc63ea |
| 11 | parking_near_destination | https://testnet.arcscan.app/tx/0xe822b885e621ad331276922ea17867ea777358f55542d98d6694d634d8029126 |
| 12 | time_context | https://testnet.arcscan.app/tx/0x0c091ab4311ca614b43579fc257d2a44a0b87d66ad6c6798ed7ed9e417bb80e1 |
| 13 | traffic_snapshot | https://testnet.arcscan.app/tx/0x8c73c68903840859656d423ca370b01e69968d0fae3345c4a8b9449450e19f91 |
| 14 | iett_density | https://testnet.arcscan.app/tx/0x038be22690a4adaf5df733a0747c87ed72cf623a6da38a52910233eaf67fef4e |
| 15 | incidents_on_route | https://testnet.arcscan.app/tx/0xc4d503b1f033f03e189ce6df8ef3d8feb3f19e4eee68e4c9a9adb5951fe4b259 |
| 16 | weather | https://testnet.arcscan.app/tx/0x70290a738a98b39ca078377a763a94db727bcb5c49ff47539db63e659b3aa077 |
| 17 | parking_near_destination | https://testnet.arcscan.app/tx/0xcb79e337c8a27d394673b28441236491290b31da103d4946bb22b8c83544fd02 |
| 18 | time_context | https://testnet.arcscan.app/tx/0xb69fe1cf5b4e7524f4237a040f2a460ae086dcdbd65395826b89353aee73c077 |
| 19 | traffic_snapshot | https://testnet.arcscan.app/tx/0x1f765eed78388ff1c321523543c280a48c83d5c36715655075ac112f772533b5 |
| 20 | iett_density | https://testnet.arcscan.app/tx/0x71a529faa7ac26604dbaa1f2d7f52e78d40a5a82c88a9a1d4a365fce13733e0a |
| 21 | incidents_on_route | https://testnet.arcscan.app/tx/0x629a0a1c2d4983c5e2f9e2fb06f26cdba9a8122baf51f24309cbb2aa3e00b3a1 |
| 22 | traffic_snapshot | https://testnet.arcscan.app/tx/0xba1816960302efbb9d4401dce130e0702f01c28bf38c645e847eb3cc69cb5a1c |
| 23 | iett_density | https://testnet.arcscan.app/tx/0x544bf3264196f51b844509bb25ea948506fcde0e76ef1bd9602806979a8d8dc4 |
| 24 | incidents_on_route | https://testnet.arcscan.app/tx/0x79352d5e1fe42d50dc0fa587bcf47ccd7a65ac09c7a6cfb549afe7591b77359f |
| 25 | weather | https://testnet.arcscan.app/tx/0xb9fbee9907beb544b8ae6759980ad0faf9924296f001a0a88779e606e5fe47f6 |
| 26 | parking_near_destination | https://testnet.arcscan.app/tx/0xd1a488533c164bd3b29878ca4aa71c296db2b261ee72945f0d5a14739072860a |
| 27 | time_context | https://testnet.arcscan.app/tx/0xee90c8758f61432a32ee1f0782108be9b4d4c42adca82334cc93fe4cc2b5ddca |
| 28 | traffic_snapshot | https://testnet.arcscan.app/tx/0xa42054d9cedd2cdb77a13168e10c09aa59541922b61e6a9ec89ff53e0a9ff38a |
| 29 | iett_density | https://testnet.arcscan.app/tx/0x75558ec1ca0c095f139ca250b9b6ccbfba885cc3a147bd7b4c7ba17ba7e972c2 |
| 30 | incidents_on_route | https://testnet.arcscan.app/tx/0xfbc2627b043eb9f275862535b979c7c684bd8a11fe3d4e3dbd8cb45e71214668 |
| 31 | weather | https://testnet.arcscan.app/tx/0x026bb0d2b3498dc5b5f3632c5346787e7ab0144ab5ad0f7297d3517ef5e94476 |
| 32 | parking_near_destination | https://testnet.arcscan.app/tx/0xc7e13fa9eebfa850b18ab5fe6ef8757f373eb1f627f9e2684b510f06af34c51c |
| 33 | time_context | https://testnet.arcscan.app/tx/0xb2eeb27ad1c962bf462b63f591c19bd58ed75ea9ad9731384325f24096a32bde |
| 34 | traffic_snapshot | https://testnet.arcscan.app/tx/0xd22094c43d29f595b1a73eb3a2992ba08a496971da125a2ce28ce2519afe89eb |
| 35 | iett_density | https://testnet.arcscan.app/tx/0xdd5ef5815c1f646e5e34971148a591d7b38a668c0d61cbb5ccfd994afb9c05bd |
| 36 | incidents_on_route | https://testnet.arcscan.app/tx/0xcf001a58408cc2411f3865e5a39c150165c415469a919fe69c719218f64b5ba9 |
| 37 | weather | https://testnet.arcscan.app/tx/0x98326319975ce10bbb036f3de47bce6ad90a6547aa75c96b1013ad1d37daf069 |
| 38 | parking_near_destination | https://testnet.arcscan.app/tx/0x3e83327acbc33cd3b37c8a9b95798a5f2e451becb8c64f10eea3b223798efdaf |
| 39 | time_context | https://testnet.arcscan.app/tx/0x967ec36ca93bee210c383590e4c46ac21bd5b547c0070b6a8937055af6d1f045 |
| 40 | traffic_snapshot | https://testnet.arcscan.app/tx/0xea46a68dbac79f9d13118b8d8349bb0fb16fc697e21506b5101602c4bda299b0 |
| 41 | iett_density | https://testnet.arcscan.app/tx/0xb20028e98d489b262a3da7c550887eddf45e77008a3c1af79eef92e5e27005e0 |
| 42 | incidents_on_route | https://testnet.arcscan.app/tx/0xec089dcfa6682223a894b2a15814e440b51c342855ab137fddc11fe60686aa22 |
| 43 | weather | https://testnet.arcscan.app/tx/0x8567b223fab7a43293d490152cfce7113e79aa380922436915e15e9c2b85e9b8 |
| 44 | parking_near_destination | https://testnet.arcscan.app/tx/0x2b1dfec73d19a830fb6d819957fed107cf147714590f478a479c1f4310115be9 |
| 45 | time_context | https://testnet.arcscan.app/tx/0x4462813da490355155f2a15ba356f76dee1042c5ffc71df94e631f980652af2d |
| 46 | traffic_snapshot | https://testnet.arcscan.app/tx/0x98000e0f2e46f1f2a1bbeeaad15b4606fa159c7bbecb1c1b10261e232abf6607 |
| 47 | iett_density | https://testnet.arcscan.app/tx/0x4859a23eb26f3ce94e117394fbd5b4a63958867267cd3ff764cf1be82f6ef489 |
| 48 | incidents_on_route | https://testnet.arcscan.app/tx/0x8f28b7aca2b7b502a9dc949c63d1e2a352a99abb697cc75de3e05f4c07bd3a1b |
| 49 | weather | https://testnet.arcscan.app/tx/0xff5c3ef4b40eaef48e9e2043edccce2831c2d0eea4f2599f9af02560ff47e216 |
| 50 | parking_near_destination | https://testnet.arcscan.app/tx/0xe70e98d3d2638350aac67ef83b773e598047bdec0dfb90690aab49d844717433 |
| 51 | time_context | https://testnet.arcscan.app/tx/0xb2081587303b4d17970e25f5b34ad2178375ad20a2b9fd8f6730b4c57e2ad5af |
| 52 | traffic_snapshot | https://testnet.arcscan.app/tx/0x1608ba930d002de89237af66e8603357a7e9e333a8f129e6ad715e9f47603232 |
| 53 | iett_density | https://testnet.arcscan.app/tx/0xe1433b79a8be820121fc79628a30b949e181099a21fc2aef55db5e94ff3def64 |
| 54 | incidents_on_route | https://testnet.arcscan.app/tx/0x62f6c762237ffbf8c7ca63a1414bef84276c177623cfafed65d49c7e39785bee |
| 55 | weather | https://testnet.arcscan.app/tx/0xf43166609a9314526c83a48512bbc0883e1a0294108c8ec90d2f171c4e000d49 |
| 56 | parking_near_destination | https://testnet.arcscan.app/tx/0xced8f01e1a9b32e55754d9dd4cc306bc8173d32ba124dc745275c783a1cbf8cf |
| 57 | time_context | https://testnet.arcscan.app/tx/0x736d2875f958043fccc76d4fd4ced3b31d3437aa839ad287aa0dc762456e8f94 |
| 58 | traffic_snapshot | https://testnet.arcscan.app/tx/0xfe0510311612d1ea3482c13c9add48efd31447adb6b46637d2efe76d1a413da7 |
| 59 | iett_density | https://testnet.arcscan.app/tx/0xb957bd401f0b8fab88e6d9453267c619b6b5a22aa9df29213031dd5cf83f3cf5 |
| 60 | incidents_on_route | https://testnet.arcscan.app/tx/0x3477cb22688004b0ffd8b07e3eaf4f0703c9c72f0f9d8d8bb819552c3c60ccea |
| 61 | weather | https://testnet.arcscan.app/tx/0x5d641da53b1de3c4bbb201531a1eff388f553d11c16b35721e0c1569986db7a3 |
| 62 | parking_near_destination | https://testnet.arcscan.app/tx/0x9df3b8c233e272ed922295c921ef012978765083400fae8bcb75bfb65069094b |
| 63 | time_context | https://testnet.arcscan.app/tx/0x4867bbad0dacade9705552028457b32236afd1f7b6c8b9c18794ad0241593f97 |
| 64 | traffic_snapshot | https://testnet.arcscan.app/tx/0x37855934b884b1a0fcf7bfa04f8f11770c997cc7b4a0a61f7957f01cbae7da7d |
| 65 | iett_density | https://testnet.arcscan.app/tx/0xc399e3043fce54e2bda3ab393cc2fe328aa910c0de122e3a5a077011a3651c14 |
| 66 | incidents_on_route | https://testnet.arcscan.app/tx/0x9f5dcb71ed7225ef2d29a1562f5ca04ac6e9002609a4f044b11d88b50d5bad1d |
