import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import {
  SYSTEM_COMMAND_PROGRAM_ID,
  COMPONENT_GAME_PROGRAM_ID,
} from "./gamePrograms";

import { MagicBlockQueue } from "../engine/MagicBlockQueue";
import { gameWorldGet } from "./gameWorld";

/**
 * Sends a tactical command to the Ephemeral Rollup.
 * Handles troop movement and combat logic.
 */
export async function gameSystemCommand(
  queue: MagicBlockQueue,
  entityPda: PublicKey,
  playerIndex: number,
  sourceX: number,
  sourceY: number,
  targetX: number,
  targetY: number,
  strengthPercent: number
) {
  const worldPda = gameWorldGet();

  // 1. Validation: Don't waste CU (Compute Units) on stationary moves
  if (sourceX === targetX && sourceY === targetY) {
    console.warn("COMMAND_ABORTED: Source and target coordinates are identical.");
    return;
  }

  // 2. Build the BOLT System Application
  const applySystem = await ApplySystem({
    authority: queue.getSessionPayer(),
    systemId: SYSTEM_COMMAND_PROGRAM_ID,
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
    // CRITICAL: These keys MUST match the Rust 'pub fn execute' arguments exactly
    args: {
      player_index: playerIndex,
      source_x: sourceX,
      source_y: sourceY,
      target_x: targetX,
      target_y: targetY,
      strength_percent: strengthPercent,
    },
  });

  // 3. Queue the transaction for the Ephemeral Layer
  // We use the queue here because games involve rapid-fire clicks
  const txName = `Move: [${sourceX},${sourceY}] -> [${targetX},${targetY}]`;
  
  console.log(`[TACTICAL_UPLINK]: Queuing ${txName}`);

  const result = await queue.processSessionEphemTransaction(
    txName,
    applySystem.transaction
  );

  console.log(`[TACTICAL_ACK]: ${txName} processed by rollup.`);

  return result;
}
