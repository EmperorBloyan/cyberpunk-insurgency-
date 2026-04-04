import { PublicKey } from "@solana/web3.js";
import { ApplySystem } from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import {
  COMPONENT_GAME_PROGRAM_ID,
  SYSTEM_GENERATE_PROGRAM_ID,
} from "./gamePrograms";
import { gameWorldGet } from "./gameWorld";

/**
 * Populates the Game Component with initial map data (16x8 grid).
 * This is called immediately after an entity is delegated.
 */
export async function gameSystemGenerate(
  engine: MagicBlockEngine,
  entityPda: PublicKey
) {
  const worldPda = gameWorldGet();

  onLog("GENERATING_NEURAL_MAP...");

  try {
    const applySystem = await ApplySystem({
      authority: engine.getSessionPayer(),
      systemId: SYSTEM_GENERATE_PROGRAM_ID,
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
      // This system initializes state, so no external args are needed
    });

    const txName = `SystemGenerate:Sector_${entityPda.toBase58().slice(0, 4)}`;

    const result = await engine.processSessionEphemTransaction(
      txName,
      applySystem.transaction
    );

    onLog("MAP_GENERATION_COMPLETE: Sector_Grid_Initialized.");
    return result;

  } catch (error) {
    onLog("GENERATION_FAILURE: Sector geometry failed to stabilize.");
    console.error(error);
    throw error;
  }
}

function onLog(msg: string) {
  console.log(`[GEN_SYSTEM]: ${msg}`);
}
