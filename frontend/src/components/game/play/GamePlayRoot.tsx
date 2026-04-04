import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { useSessionKey } from "../../../engine/useSessionKey";
import { Text } from "../../util/Text";
import { GamePlayer } from "../GamePlayer";
import { GamePlayMap } from "./GamePlayMap";
import { gameSystemTick } from "../../../states/gameSystemTick";
import { gameSystemFinish } from "../../../states/gameSystemFinish";
import { gameFetch } from "../../../states/gameFetch";

// Import SCSS if you create it, otherwise Tailwind handles the basics
import "./GamePlayRoot.scss";

export function GamePlayRoot({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const { isDelegated, delegate, isDelegating } = useSessionKey(entityPda);

  // 1. ENGINE LOOPS (Ticking & Finishing)
  React.useEffect(() => {
    if (isDelegated && game.status.playing) {
      const controller = new AbortController();
      runLoops(engine, entityPda, controller.signal);
      return () => controller.abort();
    }
  }, [engine, entityPda, isDelegated, game.status.playing]);

  // 2. NEURAL LINK (Handshake)
  if (!isDelegated) {
    return (
      <div className="NeuralLinkScreen flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="TerminalBox p-10 border-2 border-red-500 bg-black/90 shadow-[0_0_50px_rgba(255,0,0,0.2)]">
          <h1 className="text-4xl font-black italic text-red-500 mb-4 animate-pulse">
            NEURAL LINK REQUIRED
          </h1>
          <p className="text-slate-400 font-mono text-sm mb-8">
             [SYSTEM]: TO SYNC WITH THE SHADOW REALM, AUTHORIZE SESSION DELEGATION.
          </p>
          <button 
            onClick={() => delegate()} 
            disabled={isDelegating}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase tracking-tighter transition-all"
          >
            {isDelegating ? "INITIALIZING LINK..." : "STRIKE THE SHADOW"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="GamePlayRoot w-full max-w-5xl mx-auto p-4">
      {/* Header Info */}
      <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-2xl font-black text-white italic">SHADOW_ARENA.EXE</h2>
          <span className="text-[10px] font-mono text-green-500 uppercase tracking-widest">
            ● CONNECTION_STABLE // SLOT: {game.tickNextSlot.toString()}
          </span>
        </div>
      </div>

      {/* Arena Viewport */}
      <div className="relative border-4 border-slate-900 bg-slate-950 rounded-lg overflow-hidden shadow-2xl">
        <GamePlayMap entityPda={entityPda} game={game} />
      </div>

      {/* Combatant Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {game.players.map((player, i) => (
          <div key={i} className={`p-4 rounded border ${i === 1 ? 'border-blue-900 bg-blue-950/20' : 'border-slate-800 bg-slate-900/40'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{i === 0 ? "YOU (STRIKER)" : "CHAMPION (SHADOW)"}</span>
              <span className="text-xs font-mono text-white">HP: {player.health}</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
               <div 
                 className={`h-full transition-all duration-500 ${i === 0 ? 'bg-green-500' : 'bg-blue-500'}`} 
                 style={{ width: `${player.health}%` }}
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// 3. CONSOLIDATED ENGINE LOOP
async function runLoops(engine: any, entityPda: PublicKey, signal: AbortSignal) {
  while (!signal.aborted) {
    try {
      // Execute game tick (100ms for high-speed brawler feel)
      await gameSystemTick(engine, entityPda);
      
      // Periodically check for game end (every 3 seconds)
      if (Date.now() % 3000 < 150) {
        await gameSystemFinish(engine, entityPda, 0);
        await gameSystemFinish(engine, entityPda, 1);
      }
    } catch (e) {
      // Error handling for ephemeral rollup skips
    }
    await new Promise(r => setTimeout(r, 100));
  }
}
