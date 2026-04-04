import { Transaction } from "@solana/web3.js";
import {
  AddEntity,
  InitializeComponent,
  createDelegateInstruction,
} from "@magicblock-labs/bolt-sdk";

import { MagicBlockEngine } from "../engine/MagicBlockEngine";
import { COMPONENT_GAME_PROGRAM_ID } from "./gamePrograms";
import { gameSystemGenerate } from "./gameSystemGenerate";
import { gameWorldGetOrCreate } from "./gameWorld";

export async function gameCreate(
  engine: MagicBlockEngine,
  onLog: (log: string) => void
) {
  // 1. Get/Create World
  const worldPda = await gameWorldGetOrCreate(engine);
  
  // 2. Prepare Entity & Component
  onLog("Initializing Neural Node...");
  const addEntity = await AddEntity({
    connection: engine.getConnectionChain(),
    payer: engine.getSessionPayer(),
    world: worldPda,
  });

  const initializeComponent = await InitializeComponent({
    payer: engine.getSessionPayer(),
    entity: addEntity.entityPda,
    componentId: COMPONENT_GAME_PROGRAM_ID,
  });

  // 3. Delegate to Ephemeral Rollup (The High-Speed Layer)
  // We use a large expiration (1,000,000,000) so the game stays on the fast layer
  const delegateComponentInstruction = createDelegateInstruction(
    {
      entity: addEntity.entityPda,
      account: initializeComponent.componentPda,
      ownerProgram: COMPONENT_GAME_PROGRAM_ID,
      payer: engine.getSessionPayer(),
    },
    undefined,
    1_000_000_000 
  );

  // 4. Atomic Execution: Bundle the entire setup into one transaction
  onLog("Bridging to Sector: ATOMIC_UPLINK...");
  try {
    await engine.processSessionChainTransaction(
      "CreateAndDelegate",
      new Transaction()
        .add(addEntity.instruction)
        .add(initializeComponent.instruction)
        .add(delegateComponentInstruction)
    );
  } catch (error) {
    onLog("BRIDGE_FAILURE: Check wallet balance or RPC connection.");
    throw error;
  }

  // 5. Initial Generation
  // This populates the grid and players using the logic we wrote in Rust
  onLog("Generating Sector Geometry...");
  try {
    await gameSystemGenerate(engine, addEntity.entityPda);
  } catch (error) {
    onLog("GENERATION_ERROR: Entity exists but state is uninitialized.");
    throw error;
  }

  onLog("Sector Live. Neural Link Stable.");
  return addEntity.entityPda;
}
