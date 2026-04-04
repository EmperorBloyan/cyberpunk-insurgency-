import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_START_PROGRAM_ID,
} from "./gamePrograms";
import { gameWorldGet } from "./gameWorld";

/**
 * Initiates the transition from LOBBY to PLAYING.
 * This should be called once both player slots are filled and ready.
 */
export async function gameSystemStart(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const worldPda = gameWorldGet();
  const sessionPayer = engine.getSessionPayer();

  if (!sessionPayer) {
    onLog("START_ABORTED: No session authority detected.");
    throw new Error("UNAUTHORIZED_UPLINK");
  }

  onLog("SYNCHRONIZING_NEURAL_STREAMS: Transitioning to PLAY_MODE...");

  try {
    // 1. Build the BOLT System Application
    const applySystem = await ApplySystem({
      authority: sessionPayer,
      systemId: SYSTEM_START_PROGRAM_ID,
      world: worldPda,
      entities: [
        {
          entity: entityPda,
          components: [
            {
              componentId: COMPONENT_GAME_PROGRAM_ID,
            },
          ],
        },
      ],
      // No extra args needed; the Rust backend checks the Component state directly
    });

    // 2. Process on the Ephemeral Layer
    const txName = `SystemStart:Sector_${entityPda.toBase58().slice(0, 4)}`;

    const result = await engine.processSessionEphemTransaction(
      txName,
      applySystem.transaction
    );

    onLog("SECTOR_ENGAGED: All systems nominal. Combat initialized.");
    return result;

  } catch (error) {
    onLog("START_FAILURE: Ensure all players are linked and ready.");
    console.error(error);
    throw error;
  }
}

function onLog(msg: string) {
  console.log(`[START_PROTOCOL]: ${msg}`);
}
