import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";

// These imports will work once you run 'bolt build'
// We use 'any' as a fallback to prevent the IDE from turning red before the build
import * as GameIdl from "../../../backend/target/idl/game.json";
import * as GenerateIdl from "../../../backend/target/idl/generate.json";
import * as JoinIdl from "../../../backend/target/idl/join.json";
import * as StartIdl from "../../../backend/target/idl/start.json";
import * as CommandIdl from "../../../backend/target/idl/command.json";
import * as TickIdl from "../../../backend/target/idl/tick.json";
import * as FinishIdl from "../../../backend/target/idl/finish.json";

// Types from the target folder
import { Game } from "../../../backend/target/types/game";

// 1. Export Program IDs (Prioritize .env, fallback to IDL)
export const COMPONENT_GAME_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_GAME_COMPONENT_ID || (GameIdl as any).address
);

export const SYSTEM_GENERATE_PROGRAM_ID = new PublicKey(
  (GenerateIdl as any).address || "C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n"
);

export const SYSTEM_JOIN_PROGRAM_ID = new PublicKey(
  (JoinIdl as any).address || "AddressFromYourJoinSystem1111111111"
);

export const SYSTEM_START_PROGRAM_ID = new PublicKey(
  (StartIdl as any).address || "Cu8JkUA9a5msGWNChAuhBJ9PTE6FdevwHNgPyxbABkUL"
);

export const SYSTEM_COMMAND_PROGRAM_ID = new PublicKey(
  (CommandIdl as any).address || "YGKbhp7S1cCvvheyQ8rcuECKUR1SVpKpHjnqCqdP1cm"
);

export const SYSTEM_TICK_PROGRAM_ID = new PublicKey(
  (TickIdl as any).address || "YourTickSystemAddress11111111111"
);

export const SYSTEM_FINISH_PROGRAM_ID = new PublicKey(
  (FinishIdl as any).address || "HBdGPJycpHjjJ149T3RQGtQWjSC39MVpcKYF6JJvaF6e"
);

// 2. Helper functions to get the Program Instances
// These allow the frontend to call the smart contracts
export function getComponentGameOnChain(engine: MagicBlockEngine) {
  return engine.getProgramOnChain<Game>(GameIdl as any);
}

export function getComponentGameOnEphem(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem<Game>(GameIdl as any);
}

// 3. System Instance Helpers
export function getSystemGenerate(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem(GenerateIdl as any);
}

export function getSystemJoin(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem(JoinIdl as any);
}

export function getSystemStart(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem(StartIdl as any);
}

export function getSystemCommand(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem(CommandIdl as any);
}
