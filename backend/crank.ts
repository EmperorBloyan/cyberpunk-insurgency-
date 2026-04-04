import { Connection, Keypair, PublicKey } from "@solana/web3.js";

// ADJUSTED PATHS: Pointing to your programs-ecs folder
import { MagicBlockEngine } from "./programs-ecs/engine/MagicBlockEngine"; 
import { gameFetch } from "./programs-ecs/states/gameFetch";
import { gameSystemTick } from "./programs-ecs/states/gameSystemTick";
import { gameSystemFinish } from "./programs-ecs/states/gameSystemFinish";

async function runCrank() {
  // 1. Connection Setup
  // Use "http://127.0.0.1:8899" for local validator or your Devnet RPC URL
  const connection = new Connection("http://127.0.0.1:8899", "confirmed");
  
  // 2. Setup the "Arena Master" Keypair
  // This is the key that will pay for the Ghost's transaction fees.
  // For testing, we generate a random one, but in production, you'd load a fixed key.
  const adminKeypair = Keypair.generate(); 
  const engine = new MagicBlockEngine(connection, adminKeypair);

  console.log("------------------------------------------");
  console.log("⚔️  BLITZ BRAWLER: SHADOW ARENA CRANK  ⚔️");
  console.log("------------------------------------------");

  // 3. Get the Match ID from the command line
  const entityPdaStr = process.argv[2];
  if (!entityPdaStr) {
    console.error("❌ ERROR: Missing Entity PDA.");
    console.log("Usage: npx ts-node crank.ts <YOUR_ENTITY_PDA>");
    return;
  }
  const entityPda = new PublicKey(entityPdaStr);

  console.log(`📡 Monitoring Arena: ${entityPda.toBase58()}`);

  // 4. THE ENGINE LOOP
  while (true) {
    try {
      // Fetch the latest state from the MagicBlock Rollup
      const game = await gameFetch(engine, entityPda);

      if (!game) {
        console.log("⌛ Arena not found. Waiting...");
        await sleep(3000);
        continue;
      }

      if (game.status.playing) {
        console.log(`[Slot: ${game.tickNextSlot}] -> Processing Shadow Tick...`);
        
        // This triggers the Ghost's movement and the Poison Ring's shrinkage
        await gameSystemTick(engine, entityPda);

        // Check for Win/Loss conditions (Health = 0 or Player outside Ring)
        await gameSystemFinish(engine, entityPda, 0); // Check Human
        await gameSystemFinish(engine, entityPda, 1); // Check Ghost
      }

      if (game.status.finished) {
        console.log("🏆 MATCH OVER: Shadow Arena has closed.");
        break; 
      }

    } catch (err) {
      // MagicBlock is fast—if a transaction fails, we just try again on the next slot
      console.warn("⚠️  Syncing... (Network Busy)");
    }

    // Tick Speed: 1000ms (1 second) matches our UI transition speed
    await sleep(1000);
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

runCrank().catch((err) => {
  console.error("❌ CRANK FATAL ERROR:", err);
});
