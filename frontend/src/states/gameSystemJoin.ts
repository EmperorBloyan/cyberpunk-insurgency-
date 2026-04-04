import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_JOIN_PROGRAM_ID,
} from "./gamePrograms";
import { gameWorldGet } from "./gameWorld";

/**
 * Connects or disconnects a player's neural link to a specific game sector.
 * @param playerIndex The slot (0 or 1) the player is claiming.
 * @param join True to join, False to leave.
 */
export async function gameSystemJoin(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  playerIndex: number,
  join: boolean
) {
  const worldPda = gameWorldGet();
  const sessionPayer = engine.getSessionPayer();

  // 1. Safety Check: Ensure the session wallet is active
  if (!sessionPayer) {
    onLog("JOIN_ABORTED: No active session wallet found.");
    throw new Error("SESSION_NOT_INITIALIZED");
  }

  onLog(`${join ? "LINKING" : "UNLINKING"} Neural_Node_${playerIndex}...`);

  try {
    // 2. Build the BOLT System Application
    const applySystem = await ApplySystem({
      authority: sessionPayer,
      systemId: SYSTEM_JOIN_PROGRAM_ID,
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
      // Matches Rust: pub fn execute(..., player_index: u8, join: bool)
      args: {
        player_index: playerIndex,
        join: join,
      },
    });

    // 3. Execute on the Ephemeral Layer
    const txName = `SystemJoin:${join ? "Connect" : "Disconnect"}_P${playerIndex}`;
    
    const result = await engine.processSessionEphemTransaction(
      txName,
      applySystem.transaction
    );

    onLog(`PROTOCOL_${join ? "ESTABLISHED" : "SEVERED"}: Sector_${entityPda.toBase58().slice(0,4)}`);
    return result;

  } catch (error) {
    onLog("JOIN_FAILURE: Identity verification failed or slot occupied.");
    console.error(error);
    throw error;
  }
}

function onLog(msg: string) {
  console.log(`[LOBBY_UPLINK]: ${msg}`);
}
