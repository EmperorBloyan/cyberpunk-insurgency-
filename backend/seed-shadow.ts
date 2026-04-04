import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from 'fs';
import * as path from 'path';

// Path logic: Reaching into the engine folder
import { MagicBlockEngine } from "./programs-ecs/engine/MagicBlockEngine";

async function seedGenesisShadow() {
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    
    // Load your local Solana CLI wallet
    const walletPath = path.resolve(process.env.HOME || process.env.USERPROFILE, ".config/solana/id.json");
    const secretKey = Uint8Array.from(JSON.parse(fs.readFileSync(walletPath, "utf-8")));
    const admin = Keypair.fromSecretKey(secretKey);

    const engine = new MagicBlockEngine(connection, admin);
    
    // Use your actual Program ID from lib.rs
    const PROGRAM_ID = new PublicKey("C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n");

    // Derive the Global Champion PDA
    const [championPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("champion_shadow")],
        PROGRAM_ID
    );

    // Create a circular movement pattern (Up, Right, Down, Left)
    const genesisMoves = new Uint8Array(256).fill(0).map((_, i) => i % 4);

    console.log("🌱 INITIALIZING GENESIS SHADOW...");
    console.log(`📍 PDA: ${championPda.toBase58()}`);

    try {
        await engine.updateComponent(championPda, {
            authority: admin.publicKey,
            moves: Array.from(genesisMoves),
            totalMoves: 256,
            winCount: 1,
            timestamp: Math.floor(Date.now() / 1000)
        });
        console.log("✅ GENESIS SHADOW DEPLOYED. ARENA IS LIVE.");
    } catch (err) {
        console.error("❌ SEEDING FAILED:", err);
    }
}

seedGenesisShadow();
