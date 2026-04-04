import * as React from "react";
import { PublicKey } from "@solana/web3.js";

import { MagicBlockEngine } from "../../../engine/MagicBlockEngine";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { useSessionKey } from "../../../engine/useSessionKey"; // Critical for No-Popup Play

import { Text } from "../../util/Text";
import { ForEach } from "../../util/ForEach";

import { GamePlayer } from "../GamePlayer";
import { GamePlayMap } from "./GamePlayMap";

import { gameSystemTick } from "../../../states/gameSystemTick";
import { gameSystemFinish } from "../../../states/gameSystemFinish";
import { gameFetch } from "../../../states/gameFetch";

export function GamePlayRoot({
  entityPda,
  gamePda,
  game,
}: {
  entityPda: PublicKey;
  gamePda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  
  // 1. Session Key Management: This enables "Twitch-response" gameplay
  const { isDelegated, delegate, isDelegating } = useSessionKey(entityPda);

  // 2. Automated Cranks: Ticking and Finishing logic
  React.useEffect(() => {
    if (isDelegated) {
      return scheduleTick(engine, entityPda, gamePda);
    }
  }, [engine, entityPda, gamePda, isDelegated]);

  React.useEffect(() => {
    if (isDelegated) {
      return scheduleFinish(engine, entityPda, gamePda);
    }
  }, [engine, entityPda, gamePda, isDelegated]);

  // 3. UI Status Logic
  let status = "⚔️ SHADOW ARENA INITIALIZING...";
  if (game.status.playing) {
    status = "🔥 SURVIVE THE GHOST & THE SHRINKING RING!";
  }
  if (game.status.finished) {
    status = "🏆 MATCH COMPLETE: NEW GHOST RECORDED";
  }

  // 4. Pre-Game Delegation Screen (The "UX Secret Sauce")
  if (!isDelegated) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-black/80 rounded-2xl border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.3)]">
        <h1 className="text-4xl font-black text-white italic mb-4">BLITZ BRAWLER</h1>
        <Text value="The Arena requires a high-speed neural link." />
        <Text value="Authorize this session to fight in real-time with 0 gas." />
        
        <button 
          onClick={() => delegate()} 
          disabled={isDelegating}
          className={`mt-8 px-10 py-4 font-black rounded-full transition-all transform hover:scale-105 ${
            isDelegating ? "bg-gray-600 cursor-not-allowed" : "bg-red-600 text-white shadow-[0_0_15px_#dc2626] hover:bg-red-500"
          }`}
        >
          {isDelegating ? "LINKING TO ROLLUP..." : "AUTHORIZE ARENA SESSION"}
        </button>
      </div>
    );
  }

  return (
    <div className="relative p-4 bg-slate-950 rounded-xl border border-slate-800">
      <div className="flex justify-between items-end mb-6">
        <div>
          <Text value="Blitz Brawler: Shadow Arena" isTitle={true} />
          <div className="flex gap-2 items-center">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-red-500 text-[10px] font-bold uppercase tracking-widest">Live Onchain Match</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-slate-500 text-[10px] font-mono">Rollup Slot: {game.tickNextSlot.toString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <ForEach
          values={game.players}
          renderer={(player, index) => (
            <div key={index} className={`relative p-2 rounded-lg border ${player.isGhost ? "border-blue-500/50 bg-blue-900/10" : "border-slate-700 bg-slate-900/50"}`}>
              {player.isGhost && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-[8px] font-black px-2 py-0.5 rounded italic">GHOST</div>
              )}
              <GamePlayer playerIndex={index} player={player} />
            </div>
          )}
        />
      </div>

      <div className="relative border-2 border-slate-800 rounded-lg shadow-inner bg-black">
        <GamePlayMap entityPda={entityPda} game={game} />
      </div>
      
      <div className="mt-6 p-3 bg-red-950/20 border border-red-900/30 rounded text-center">
        <span className="text-red-400 font-bold text-sm italic">{status}</span>
      </div>
    </div>
  );
}

// --- Background Logic (The "Crank") ---

function scheduleTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  console.log("⚡ [Blitz Brawler] Starting High-Tick Crank");
  let running = true;
  (async () => {
    while (running) {
      const game = await gameFetch(engine, gamePda);
      if (!game || !game.status.playing) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        continue;
      }

      // Tick every 100ms for that high-speed "Twitch" feel
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        await gameSystemTick(engine, entityPda);
      } catch (error) {
        // Silently fail on network hiccups to keep the loop smooth
      }
    }
  })();
  return () => {
    console.log("🛑 Stopping Crank");
    running = false;
  };
}

function scheduleFinish(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  const interval = setInterval(async () => {
    try {
      const game = await gameFetch(engine, gamePda);
      if (!game || !game.status.playing) return;
      
      // Check for win conditions on all possible player indices
      await gameSystemFinish(engine, entityPda, 0);
      await gameSystemFinish(engine, entityPda, 1);
    } catch (error) {
      // Logic for match end not yet met
    }
  }, 3000);
  return () => clearInterval(interval);
}
