/**
 * Ensure the connected wallet is on Arc Testnet (chainId 5042002).
 * Tries to switch first; falls back to adding the network to MetaMask.
 */
export async function ensureArcTestnet(): Promise<void> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not available");
  }
  const chainIdHex = "0x4CF0A2"; // 5042002
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: chainIdHex }],
    } as Parameters<NonNullable<typeof window.ethereum>["request"]>[0]);
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    // 4902 = chain not added to wallet
    if (code === 4902 || code === -32603) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: chainIdHex,
            chainName: "Arc Testnet",
            nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
            rpcUrls: ["https://rpc.testnet.arc.network"],
            blockExplorerUrls: ["https://testnet.arcscan.app"],
          },
        ],
      } as Parameters<NonNullable<typeof window.ethereum>["request"]>[0]);
    } else {
      throw err;
    }
  }
}
