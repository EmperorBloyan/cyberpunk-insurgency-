import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_TICK_PROGRAM_ID,
} from "./gamePrograms";
import { gameWorldGet } from "./gameWorld";

/**
 * Triggers a state update based on elapsed blockchain slots.
 * Updates neural recovery, ghost movement, and automated sector logic.
 */
export async function gameSystemTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const worldPda = gameWorldGet();
  const sessionPayer = engine.getSessionPayer();

  // 1. Silent Guard: Don't spam errors if the user is logging out
  if (!sessionPayer) return;

  try {
    const applySystem = await ApplySystem({
      authority: sessionPayer,
      systemId: SYSTEM_TICK_PROGRAM_ID,
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
    });

    // 2. High-Speed Ephemeral Update
    // We keep the log name short for performance monitoring
    return await engine.processSessionEphemTransaction(
      "Tick:" + entityPda.toBase58().slice(0, 4),
      applySystem.transaction
    );

  } catch (error) {
    // We log but don't 'throw' here to prevent the main UI thread 
    // from crashing during rapid tick cycles.
    console.error("[HEARTBEAT_FAILURE]: Sync_Desync detected.", error);
  }
}
