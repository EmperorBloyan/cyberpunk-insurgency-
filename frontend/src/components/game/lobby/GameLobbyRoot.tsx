import * as React from "react";
import { PublicKey } from "@solana/web3.js";

import { MagicBlockEngine } from "../../../engine/MagicBlockEngine";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";

import { Text } from "../../util/Text";
import { ForEach } from "../../util/ForEach";
import { GameLobbyPlayer } from "./GameLobbyPlayer";
import { GameGridRows } from "../grid/GameGridRows";

import { gameFetch } from "../../../states/gameFetch";
import { gameSystemStart } from "../../../states/gameSystemStart";
import { gameSystemGenerate } from "../../../states/gameSystemGenerate";

export function GameLobbyRoot({
  entityPda,
  gamePda,
  game,
}: {
  entityPda: PublicKey;
  gamePda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  React.useEffect(() => {
    return scheduleGenerateOrStart(engine, entityPda, gamePda);
  }, [engine, entityPda, gamePda]);

  // Check if both players are ready (one is usually the Ghost/Bot initialized by the Crank)
  const readyCount = game.players.filter((p: any) => p.ready).length;
  const totalPlayers = game.players.length;

  return (
    <div className="w-full flex flex-col items-center bg-slate-900/40 p-8 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
      
      {/* 1. Mission Briefing Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-black italic text-white tracking-tighter mb-2">
            SHADOW <span className="text-blue-500">SYNCHRONIZATION</span>
        </h1>
        <div className="flex items-center justify-center gap-4">
            <div className="h-[1px] w-20 bg-gradient-to-r from-transparent to-blue-500" />
            <span className="text-blue-400 font-mono text-[10px] uppercase tracking-[0.4em] animate-pulse">
                Rehydrating Onchain Intent
            </span>
            <div className="h-[1px] w-20 bg-gradient-to-l from-transparent to-blue-500" />
        </div>
      </div>

      {/* 2. Player Status Area */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <ForEach
          values={game.players}
          renderer={(player, index) => (
            <div key={index} className={`relative p-4 rounded-xl border-2 transition-all ${player.isGhost ? 'border-blue-500/30 bg-blue-900/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]' : 'border-slate-700 bg-slate-800/50'}`}>
                {player.isGhost && (
                    <div className="absolute -top-3 -left-3 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded italic uppercase shadow-lg">
                        Ghost System Active
                    </div>
                )}
                <GameLobbyPlayer
                    playerIndex={index}
                    player={player}
                    entityPda={entityPda}
                />
                <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-1000 ${player.ready ? 'w-full bg-green-500' : 'w-1/3 bg-yellow-500 animate-pulse'}`} />
                </div>
            </div>
          )}
        />
      </div>

      {/* 3. The "Scanning" Arena Preview */}
      <div className="w-full relative">
        <div className="absolute inset-0 z-10 pointer-events-none border border-blue-500/20 rounded-lg overflow-hidden">
            {/* Animated Scanning Line */}
            <div className="w-full h-[2px] bg-blue-400/50 shadow-[0_0_15px_#60a5fa] absolute top-0 animate-[scan_3s_linear_infinite]" />
        </div>
        <div className="opacity-40 grayscale contrast-125 scale-95 hover:scale-100 transition-transform duration-700">
            <Text value="ARENA TOPOGRAPHY SCAN" />
            <GameGridRows game={game} />
        </div>
      </div>

      {/* 4. Match Start Counter */}
      <div className="mt-10 p-4 bg-black/60 rounded-lg border border-slate-700 text-center w-64">
        <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Status</p>
        <p className="text-white font-mono font-bold">
            {readyCount === totalPlayers ? "STABILIZING RIFT..." : `WAITING FOR SYNC (${readyCount}/${totalPlayers})`}
        </p>
      </div>

      {/* Custom Styles for the Scan Line */}
      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// --- Background Logic (No changes needed, but added error handling) ---

function scheduleGenerateOrStart(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  const interval = setInterval(async () => {
    try {
        const game = await gameFetch(engine, gamePda);
        if (!game) return;

        if (game.status.generate) {
            console.log("🌐 [MagicBlock] Generating Arena State...");
            await gameSystemGenerate(engine, entityPda);
        }

        if (game.status.lobby) {
            let canStart = game.players.every((p: any) => p.ready);
            if (canStart && game.players.length >= 2) {
                console.log("⚔️ [MagicBlock] Starting Match...");
                await gameSystemStart(engine, entityPda);
            }
        }
    } catch (e) {
        console.warn("Lobby sync hiccup:", e);
    }
  }, 2000);
  
  return () => clearInterval(interval);
}
