import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { getComponentGameOnEphem, getComponentGameOnChain } from "./gamePrograms";

/**
 * Fetches the Game state with a priority for the Ephemeral (High-Speed) layer.
 * This ensures UI fluidity while maintaining a link to the permanent chain.
 */
export async function gameFetch(engine: MagicBlockEngine, gamePda: PublicKey) {
  try {
    // 1. Primary Attempt: High-speed Ephemeral Layer
    const componentEphem = getComponentGameOnEphem(engine);
    const state = await componentEphem.account.game.fetchNullable(gamePda);

    if (state) return state;

    // 2. Secondary Attempt: Permanent On-Chain Layer
    // This happens if the game hasn't been "nudged" to the rollup yet
    console.warn("Neural Node not found on Ephemeral layer. Querying Mainnet...");
    const componentChain = getComponentGameOnChain(engine);
    return await componentChain.account.game.fetchNullable(gamePda);
    
  } catch (error) {
    console.error("CRITICAL_FETCH_FAILURE: Sector data corrupted or unreachable.", error);
    return null;
  }
}
