import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";

async function seedGenesisShadow() {
    const connection = new Connection("http://127.0.0.1:8899", "confirmed");
    const admin = Keypair.generate(); // Your deployer key
    const engine = new MagicBlockEngine(connection, admin);

    // The PDA of your Global Champion Component
    const [championPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("champion_shadow")],
        new PublicKey("C5i...YourProgramID")
    );

    console.log("🌱 SEEDING GENESIS SHADOW...");

    // Create a dummy move set (A simple patrol loop)
    const genesisMoves = new Uint8Array(256).fill(0); 
    for(let i=0; i<100; i++) {
        genesisMoves[i] = i % 4; // Up, Down, Left, Right loop
    }

    // Call your component update here to save the "First Ghost"
    // await engine.updateComponent(championPda, { moves: genesisMoves, winCount: 1 });
    
    console.log("✅ GENESIS SHADOW ACTIVE. ARENA READY.");
}

seedGenesisShadow();
