import { Router, Request, Response } from "express";
import { gatewayService } from "../services/gatewayService.js";

export function createGatewayRoutes(): Router {
  const router = Router();

  /**
   * GET /api/gateway/status
   * Public — Gateway service status + balances
   */
  router.get("/status", async (_req: Request, res: Response) => {
    try {
      const status = gatewayService.getStatus();
      const balances = await gatewayService.getBalances();

      res.json({
        success: true,
        timestamp: Date.now(),
        ...status,
        balances,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * POST /api/gateway/deposit
   * Deposit USDC into Gateway for gas-free nanopayments.
   * Body: { amount: "1.0" }
   */
  router.post("/deposit", async (req: Request, res: Response) => {
    if (!gatewayService.isConfigured()) {
      res.status(503).json({ success: false, error: "Gateway not configured" });
      return;
    }

    try {
      const { amount } = req.body || {};
      if (!amount) {
        res.status(400).json({ success: false, error: "Required: amount (e.g. '1.0')" });
        return;
      }

      const result = await gatewayService.deposit(amount);
      res.json({ success: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * POST /api/gateway/withdraw
   * Withdraw USDC from Gateway back to wallet.
   * Body: { amount: "1.0" }
   */
  router.post("/withdraw", async (req: Request, res: Response) => {
    if (!gatewayService.isConfigured()) {
      res.status(503).json({ success: false, error: "Gateway not configured" });
      return;
    }

    try {
      const { amount } = req.body || {};
      if (!amount) {
        res.status(400).json({ success: false, error: "Required: amount" });
        return;
      }

      const result = await gatewayService.withdraw(amount);
      res.json({ success: true, ...result });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/gateway/balances
   * Get wallet + gateway USDC balances (backend's own wallet).
   */
  router.get("/balances", async (_req: Request, res: Response) => {
    try {
      const balances = await gatewayService.getBalances();
      res.json({ success: true, ...balances });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/gateway/balance/:address
   * Per-user USDC balance on Arc (wallet + Gateway).
   */
  router.get("/balance/:address", async (req: Request, res: Response) => {
    const address = String(req.params.address || "").trim();
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      res.status(400).json({ success: false, error: "Invalid address" });
      return;
    }
    try {
      const balances = await gatewayService.getBalancesForAddress(address as `0x${string}`);
      res.json({ success: true, ...balances });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      res.status(500).json({ success: false, error: message });
    }
  });

  /**
   * GET /api/gateway/contracts
   * Public — reveal Gateway Wallet + USDC contract addresses on Arc
   * so the frontend can construct deposit transactions directly.
   */
  router.get("/contracts", (_req: Request, res: Response) => {
    res.json({
      success: true,
      chain: "arcTestnet",
      chainId: 5042002,
      usdc: "0x3600000000000000000000000000000000000000",
      gatewayWallet: "0x0077777d7EBA4688BDeF3E311b846F25870A19B9",
      gatewayMinter: "0x0022222ABE238Cc2C7Bb1f21003F0a260052475B",
      sellerAddress: process.env.GATEWAY_SELLER_ADDRESS
        || "0xF505e2E71df58D7244189072008f25f6b6aaE5ae",
    });
  });

  return router;
}
