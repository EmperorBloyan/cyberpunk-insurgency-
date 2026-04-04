import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';
import * as path from 'path';

// Path logic: Reaching from backend root into programs-ecs subfolders
import { MagicBlockEngine } from "./programs-ecs/engine/MagicBlockEngine";
import { gameFetch } from "./programs-ecs/states/gameFetch";
import { gameSystemTick } from "./programs-ecs/states/gameSystemTick";
import { shadowRecordSystem } from "./programs-ecs/systems/shadowRecordSystem";

async function runCrank() {
    // 1. Setup Connection to the local validator or MagicBlock RPC
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");

    // 2. Load Local Wallet (Ensures the Crank has authority to sign)
    const walletPath = path.resolve(process.env.HOME || process.env.USERPROFILE, ".config/solana/id.json");
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const adminKeypair = Keypair.fromSecretKey(secretKey);
    
    const engine = new MagicBlockEngine(connection, adminKeypair);

    // 3. Get the Game PDA from the command line argument
    const entityPdaStr = process.argv[2];
    if (!entityPdaStr) {
        console.error("❌ ERROR: Match PDA required.");
        console.log("Usage: npx ts-node crank.ts <GAME_PDA_ADDRESS>");
        return;
    }
    
    const entityPda = new PublicKey(entityPdaStr);
    console.log("-----------------------------------------");
    console.log(`🛠️  CRANK START: Watching Entity ${entityPdaStr}`);
    console.log("-----------------------------------------");

    // 4. THE MONITORING LOOP
    while (true) {
        try {
            const game = await gameFetch(engine, entityPda);
            
            if (game && game.status === "Playing") {
                // Keep the game clock moving on-chain
                await gameSystemTick(engine, entityPda);
            } 

            if (game && game.status === "Finished") {
                console.log("🏆 MATCH ENDED: Recording Winner's Shadow...");
                
                // Trigger the Shadow Recording System
                await shadowRecordSystem(engine, entityPda);
                
                console.log("💾 SUCCESS: Winner's soul has been archived.");
                break; // Stop the crank for this specific match
            }
        } catch (e) {
            // Silently retry if there's a slot skip or network lag
        }
        
        // Wait 1 second before checking the state again
        await new Promise(r => setTimeout(r, 1000));
    }
}

runCrank();
