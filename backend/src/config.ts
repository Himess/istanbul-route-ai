import dotenv from "dotenv";
dotenv.config();

export const config = {
  arcTestnetRpcUrl: process.env.ARC_TESTNET_RPC_URL || "https://rpc.testnet.arc.network",
  contractAddress: process.env.CONTRACT_ADDRESS || "0xD117bDB3d1463a1B47561eb74BEa88ebE93B81CF",
  privateKey: process.env.PRIVATE_KEY || "",
  chainId: parseInt(process.env.CHAIN_ID || "5042002", 10),
  port: parseInt(process.env.PORT || "3001", 10),
  demoSimulatorEnabled: process.env.DEMO_SIMULATOR === "true",
  osrmUrl: process.env.OSRM_URL || "https://router.project-osrm.org",
  routeVehicleRadius: parseInt(process.env.ROUTE_VEHICLE_RADIUS_METERS || "300"),
  parkingContractAddress: process.env.PARKING_CONTRACT_ADDRESS || "0x198be13482770fa01e36ae199f8e6873ad2f7b91",
};
