import { PublicKey } from "@solana/web3.js";
import { MagicBlockEngine } from "../engine/MagicBlockEngine";

import * as GameIdl from "../../../backend/target/idl/game.json";
import * as GenerateIdl from "../../../backend/target/idl/generate.json";
import * as JoinIdl from "../../../backend/target/idl/join.json";
import * as StartIdl from "../../../backend/target/idl/start.json";
import * as CommandIdl from "../../../backend/target/idl/command.json";
import * as TickIdl from "../../../backend/target/idl/tick.json";
import * as FinishIdl from "../../../backend/target/idl/finish.json";

import { Game } from "../../../backend/target/types/game";

export const COMPONENT_GAME_PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_GAME_COMPONENT_ID || (GameIdl as any).address
);

export const SYSTEM_GENERATE_PROGRAM_ID = new PublicKey(
  (GenerateIdl as any).address || "C5iL81s4Fu6SnkQEfixFZpKPRQ32fqVizpotoLVTxA2n"
);

export const SYSTEM_JOIN_PROGRAM_ID = new PublicKey(
  (JoinIdl as any).address || "3zMXokc8DYYAairrtAKZKPJZKHmWKRdj6G8bm8ZZVi9g"
);

export const SYSTEM_START_PROGRAM_ID = new PublicKey(
  (StartIdl as any).address || "Cu8JkUA9a5msGWNChAuhBJ9PTE6FdevwHNgPyxbABkUL"
);

export const SYSTEM_COMMAND_PROGRAM_ID = new PublicKey(
  (CommandIdl as any).address || "YGKbhp7S1cCvvheyQ8rcuECKUR1SVpKpHjnqCqdP1cm"
);

export const SYSTEM_TICK_PROGRAM_ID = new PublicKey(
  (TickIdl as any).address || "8tKAapRKPrNkxXwcArbSAnBHieYnX6M2WoTxukbCQtTa"
);

export const SYSTEM_FINISH_PROGRAM_ID = new PublicKey(
  (FinishIdl as any).address || "HBdGPJycpHjjJ149T3RQGtQWjSC39MVpcKYF6JJvaF6e"
);

export function getComponentGameOnChain(engine: MagicBlockEngine) {
  return engine.getProgramOnChain<Game>(GameIdl as any);
}

export function getComponentGameOnEphem(engine: MagicBlockEngine) {
  return engine.getProgramOnEphem<Game>(GameIdl as any);
}

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