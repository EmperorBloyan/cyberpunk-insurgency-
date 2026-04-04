import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "./programs-ecs/engine/MagicBlockEngine"; 
import { gameFetch } from "./programs-ecs/states/gameFetch";
import { gameSystemTick } from "./programs-ecs/states/gameSystemTick";
import { gameSystemFinish } from "./programs-ecs/states/gameSystemFinish";

// NEW: Import the Shadow Recording system
import { shadowRecordSystem } from "./programs-ecs/systems/shadowRecordSystem";

async function runCrank() {
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  
  // Setup the Authority (Ensure this key has SOL if on Devnet)
  const adminKeypair = Keypair.generate(); 
  const engine = new MagicBlockEngine(connection, adminKeypair);

  const entityPdaStr = process.argv[2];
  if (!entityPdaStr) {
    console.error("❌ ERROR: Match PDA required. Usage: npx ts-node crank.ts <PDA>");
    return;
  }
  const entityPda = new PublicKey(entityPdaStr);

  console.log("⚡ SHADOW ARENA CRANK: ONLINE");
  console.log(`🏟️  Monitoring Arena: ${entityPda.toBase58()}`);

  while (true) {
    try {
      const game = await gameFetch(engine, entityPda);

      if (!game) {
        await sleep(2000);
        continue;
      }

      // --- 1. ACTIVE COMBAT LOOP ---
      if (game.status.playing) {
        console.log(`⚔️ Tick ${game.tickNextSlot}: Moving Ghost & Shrinking Ring...`);
        
        // Execute the game tick (Ghost AI + Poison Ring)
        await gameSystemTick(engine, entityPda);

        // Check if the Human (0) or Ghost (1) has been defeated
        await gameSystemFinish(engine, entityPda, 0);
        await gameSystemFinish(engine, entityPda, 1);
      }

      // --- 2. FINAL BLOW & SHADOW RECORDING ---
      if (game.status.finished) {
        console.log("🏁 MATCH FINISHED. ANALYZING WINNER...");

        // Trigger the Shadow Record system we defined in lib.rs
        // This saves the Human's moves if they won.
        await shadowRecordSystem(engine, entityPda);

        console.log("🏆 SHADOW SAVED. TERMINATING CRANK.");
        break; // Stop the crank once the recording is done
      }

    } catch (err) {
      // Ephemeral rollups move fast; ignore minor sync errors
      process.stdout.write("."); 
    }

    await sleep(1000); // 1-second heartbeat
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runCrank().catch(console.error);
