/**
 * Circle Gateway middleware — strictly enforced.
 *
 * Every paid endpoint requires a valid Circle Gateway signature from the
 * caller. No bypass. Each validated call settles on-chain on Arc.
 */

import { createGatewayMiddleware } from "@circle-fin/x402-batching/server";
import type { GatewayMiddleware, PaymentRequest } from "@circle-fin/x402-batching/server";

const SELLER_ADDRESS = process.env.GATEWAY_SELLER_ADDRESS
  || "0xF505e2E71df58D7244189072008f25f6b6aaE5ae";

let gateway: GatewayMiddleware;

try {
  gateway = createGatewayMiddleware({
    sellerAddress: SELLER_ADDRESS,
    description: "Istanbul Route AI — USDC Nanopayments on Arc",
  });
  console.log(`[Gateway] Middleware ready — seller=${SELLER_ADDRESS}`);
} catch (err) {
  console.error("[Gateway] Failed to initialize:", err instanceof Error ? err.message : err);
  gateway = {
    require: () => (_req: any, res: any) => {
      res.status(503).json({ error: "Circle Gateway not available" });
    },
    verify: async () => ({ valid: false, error: "Not initialized" }),
    settle: async () => ({ success: false, error: "Not initialized" }),
  } as unknown as GatewayMiddleware;
}

// Per-resource middleware — each validated request settles on-chain.
export const nanopayRouteMiddleware   = gateway.require("$0.0005");
export const nanopayParkingMiddleware = gateway.require("$0.0001");
export const nanopayVehicleMiddleware = gateway.require("$0.001");
export const nanopayZoneMiddleware    = gateway.require("$0.0005");
export const nanopayToolMiddleware    = gateway.require("$0.0001");

export { gateway };
export type { PaymentRequest };
