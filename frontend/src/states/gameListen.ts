import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphem } from "./gamePrograms";
import { gameSystemGenerate } from "./gameSystemGenerate";
import { gameLog } from "./gameLog";

export function gameListen(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey,
  setGame: (game: any) => void
) {
  const onGameValue = (gameData: any) => {
    // Log game info for debugging
    gameLog(gamePda, gameData);
    // Update the React state
    setGame(gameData);
  };

  return engine.subscribeToEphemAccountInfo(gamePda, (accountInfo) => {
    // 1. If the game doesn't exist in the ephemeral layer yet
    if (!accountInfo) {
      console.log("Game not found on Ephemeral layer, nudging Generate system...");
      // Try to pull it from the base layer into the high-speed layer
      gameSystemGenerate(engine, entityPda).then(
        (value) => console.log("Nudge generate success", value),
        (reason) => console.log("Nudge generate fail", reason.toString())
      );
      return onGameValue(null);
    }

    // 2. DECODER FIX: BOLT components are usually registered with Capitalized names
    try {
      const component = getComponentGameOnEphem(engine);
      const coder = component.coder;
      
      // Changed "game" to "Game" to match your Rust #[component] Game
      const decodedData = coder.accounts.decode("Game", accountInfo.data);
      
      return onGameValue(decodedData);
    } catch (error) {
      console.error("Failed to decode Game component data:", error);
      return onGameValue(null);
    }
  });
}
