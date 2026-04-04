import {
  FindComponentPda,
  FindEntityPda,
  World,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnChain, COMPONENT_GAME_PROGRAM_ID } from "./gamePrograms";
import { gameWorldGetOrCreate } from "./gameWorld";

/**
 * Scans the Sector for active neural nodes (games).
 * Uses a reverse-chronological search to find the most recent matches first.
 */
export async function gameList(engine: MagicBlockEngine, count: number) {
  const componentGame = getComponentGameOnChain(engine);
  const worldPda = await gameWorldGetOrCreate(engine);

  // 1. Fetch the World State to get the total entity count
  const world = await World.fromAccountAddress(
    engine.getConnectionChain(),
    worldPda
  );

  let currentId = world.entities; // Start from the newest entity
  const found: any[] = [];
  const BATCH_SIZE = 20; // Reduced batch size for faster initial UI response

  onLog("SCANNING_SECTOR_FOR_ACTIVE_UPLINKS...");

  while (!currentId.isNeg() && found.length < count) {
    const batch: any[] = [];
    
    // 2. Build a batch of PDAs to check
    while (!currentId.isNeg() && batch.length < BATCH_SIZE) {
      const entityPda = FindEntityPda({
        worldId: worldPda,
        entityId: currentId,
      });
      const gamePda = FindComponentPda({
        componentId: COMPONENT_GAME_PROGRAM_ID,
        entity: entityPda,
      });
      
      batch.push({
        entityId: currentId.toString(),
        entityPda,
        gamePda,
      });
      
      currentId = currentId.subn(1);
    }

    // 3. Batch Fetch from Mainnet
    // fetchMultiple is significantly faster than fetching one by one
    const gameStates = await componentGame.account.game.fetchMultiple(
      batch.map((b) => b.gamePda)
    );

    // 4. Filter and Validate
    gameStates.forEach((game, index) => {
      if (game && found.length < count) {
        // We only show games that haven't expired or glitched
        found.push({
          entityPda: batch[index].entityPda,
          entityId: batch[index].entityId,
          gamePda: batch[index].gamePda,
          game,
        });
      }
    });
  }

  return found;
}

// Simple helper for terminal-style logging
function onLog(msg: string) {
  console.log(`[NETWORK_SCANNER]: ${msg}`);
}
