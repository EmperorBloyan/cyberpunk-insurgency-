import {
  createInitializeRegistryInstruction,
  FindRegistryPda,
  InitializeNewWorld,
} from "@magicblock-labs/bolt-sdk";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { PublicKey, Transaction } from "@solana/web3.js";

// Priority: Use the World ID from your .env file
const WORLD_ID_FROM_ENV = process.env.NEXT_PUBLIC_WORLD_ID;

const FALLBACK_WORLD_PDA = new PublicKey(
  WORLD_ID_FROM_ENV || "JBupPMmv4zaXa5c8EdubsCPvoHZwCK7mwnDfmfs8dC5Y"
);

/**
 * Returns the currently active World PDA.
 */
export function gameWorldGet(): PublicKey {
  return FALLBACK_WORLD_PDA;
}

/**
 * Ensures the BOLT Registry and the Game World exist on the chain.
 * This is the 'Bootstrap' function for your backend infrastructure.
 */
export async function gameWorldGetOrCreate(
  engine: MagicBlockEngine
): Promise<PublicKey> {
  
  // 1. Funding: Ensure the ephemeral session has gas
  try {
    const airdropSuccess = await engine.fundSessionFromAirdrop();
    if (airdropSuccess) onLog("NEURAL_RESERVES_REPLENISHED: Session funded.");
  } catch (error) {
    // Silently continue; the main wallet might already have funds
  }

  // 2. Registry: The top-level folder for all BOLT worlds
  const registryPda = FindRegistryPda({});
  const registryAccountInfo = await engine.getChainAccountInfo(registryPda);
  
  if (registryAccountInfo === null) {
    onLog("INITIALIZING_BOLT_REGISTRY...");
    const initializeRegistryIx = createInitializeRegistryInstruction({
      registry: registryPda,
      payer: engine.getSessionPayer(),
    });
    
    await engine.processSessionChainTransaction(
      "InitializeRegistry",
      new Transaction().add(initializeRegistryIx)
    );
  }

  // 3. World: The specific 'Sector' for Cyberpunk Insurgency
  const worldPda = FALLBACK_WORLD_PDA;
  const worldAccountInfo = await engine.getChainAccountInfo(worldPda);

  if (worldAccountInfo === null) {
    onLog("SECTOR_NOT_FOUND: Initializing New World Instance...");
    try {
      const initializeNewWorld = await InitializeNewWorld({
        connection: engine.getConnectionChain(),
        payer: engine.getSessionPayer(),
      });

      await engine.processSessionChainTransaction(
        "InitializeNewWorld",
        initializeNewWorld.transaction
      );
      
      // LOG THIS: You will need to put this new PDA in your .env or bolt.toml!
      console.log("!!! NEW WORLD CREATED !!! ADDRESS:", initializeNewWorld.worldPda.toBase58());
      return initializeNewWorld.worldPda;
    } catch (e) {
      onLog("WORLD_INIT_ERROR: Sector collision or insufficient permissions.");
      return worldPda;
    }
  }

  return worldPda;
}

function onLog(msg: string) {
  console.log(`[WORLD_ENGINE]: ${msg}`);
}
