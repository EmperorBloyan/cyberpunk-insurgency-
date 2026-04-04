import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  SYSTEM_FINISH_PROGRAM_ID,
  COMPONENT_GAME_PROGRAM_ID,
} from "./gamePrograms";
import { gameWorldGet } from "./gameWorld";

/**
 * Triggers the win-condition check on the blockchain.
 * If successful, the game state will transition to 'Finished'.
 */
export async function gameSystemFinish(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number
) {
  const worldPda = gameWorldGet();

  onLog(`VICTORY_CLAIM_INITIATED: Player_${playerIndex}`);

  try {
    // 1. Build the BOLT System Application
    const applySystem = await ApplySystem({
      authority: engine.getSessionPayer(),
      systemId: SYSTEM_FINISH_PROGRAM_ID,
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
      // Matches the Rust 'pub fn execute(ctx, player_index: u8)'
      args: {
        player_index: playerIndex,
      },
    });

    // 2. Process the Transaction
    // Unlike 'Command', we use engine.processSessionEphemTransaction directly 
    // instead of a queue because this is a one-time terminal action.
    const result = await engine.processSessionEphemTransaction(
      `SystemFinish:Sector_${entityPda.toBase58().slice(0, 4)}`,
      applySystem.transaction
    );

    onLog("MATCH_TERMINATED: State_Synchronized.");
    return result;

  } catch (error) {
    onLog("FINISH_FAILED: Neural_Verification_Error.");
    console.error(error);
    throw error;
  }
}

function onLog(msg: string) {
  console.log(`[TERMINATION_PROTOCOL]: ${msg}`);
}
