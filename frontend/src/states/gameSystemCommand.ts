import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import {
  SYSTEM_COMMAND_PROGRAM_ID,
  COMPONENT_GAME_PROGRAM_ID,
} from "./gamePrograms";

import { MagicBlockQueue } from "../engine/MagicBlockQueue";
import { gameWorldGet } from "./gameWorld";

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

  if (sourceX === targetX && sourceY === targetY) {
    console.warn("COMMAND_ABORTED: Source and target coordinates are identical.");
    return;
  }

  const sourceIdx = sourceY * 16 + sourceX;
  const targetIdx = targetY * 16 + targetX;

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
    args: {
      player_index: playerIndex,
      source_idx: sourceIdx,
      target_idx: targetIdx,
      strength_percent: strengthPercent,
    },
  });

  const txName = `Move: [${sourceX},${sourceY}] -> [${targetX},${targetY}]`;
  
  console.log(`[TACTICAL_UPLINK]: Queuing ${txName}`);

  const result = await queue.processSessionEphemTransaction(
    txName,
    applySystem.transaction
  );

  console.log(`[TACTICAL_ACK]: ${txName} processed by rollup.`);

  return result;
}