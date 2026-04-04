import * as React from "react";
import { PublicKey } from "@solana/web3.js";

import { MagicBlockEngine } from "../../../engine/MagicBlockEngine";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { useSessionKey } from "../../../engine/useSessionKey"; // NEW: High-speed delegation

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
  
  // 1. SESSION KEY DELEGATION
  // This allows the game to sign "Tick" and "Move" transactions automatically.
  const { isDelegated, delegate, isDelegating } = useSessionKey(entityPda);

  // 2. RUN THE ENGINE (Only if delegated)
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

  // 3. PRE-GAME "HANDSHAKE" SCREEN
  if (!isDelegated) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-950 rounded-2xl border-2 border-red-600 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
        <h1 className="text-3xl font-black italic text-white mb-2">NEURAL LINK REQUIRED</h1>
        <Text value="To fight the Ghost in real-time, authorize the arena session." />
        <button 
          onClick={() => delegate()} 
          disabled={isDelegating}
          className="mt-8 px-10 py-4 bg-red-600 text-white font-black rounded-full hover:bg-red-500 transition-all transform hover:scale-105 shadow-[0_0_15px_#dc2626]"
        >
          {isDelegating ? "SYNCHRONIZING..." : "ENTER SHADOW ARENA"}
        </button>
      </div>
    );
  }

  // 4. ACTIVE ARENA UI
  let status = "⚔️ SHADOW ARENA ACTIVE";
  if (game.status.playing) status = "🔥 SURVIVE THE GHOST & THE RING!";
  if (game.status.finished) status = "🏆 ARENA CLOSED: NEW RECORD SAVED";

  return (
    <div className="relative p-6 bg-black rounded-xl border border-slate-800 shadow-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Text value="Blitz Brawler: Shadow Arena" isTitle={true} />
          <div className="flex items-center gap-2 mt-1">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
             <span className="text-[10px] font-mono text-slate-500">ROLLUP_SLOT: {game.tickNextSlot.toString()}</span>
          </div>
        </div>
      </div>

      {/* Player Battle Cards */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <ForEach
          values={game.players}
          renderer={(player, index) => (
            <div key={index} className={`p-3 rounded-lg border-2 ${player.isGhost ? "border-blue-500/40 bg-blue-900/10" : "border-slate-700 bg-slate-900"}`}>
              {player.isGhost && <span className="text-[9px] font-black text-blue-400 uppercase italic">Ghost Replay</span>}
              <GamePlayer playerIndex={index} player={player} />
            </div>
          )}
        />
      </div>

      {/* The Map Rendering */}
      <div className="relative rounded-lg overflow-hidden border-2 border-slate-800">
        <GamePlayMap entityPda={entityPda} game={game} />
      </div>
      
      <div className="mt-6 text-center">
        <span className="text-red-500 font-bold italic tracking-wider">{status}</span>
      </div>
    </div>
  );
}

// --- CRANK LOGIC ---

function scheduleTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  let running = true;
  (async () => {
    while (running) {
      const game = await gameFetch(engine, gamePda);
      if (!game || !game.status.playing) {
        await new Promise((r) => setTimeout(r, 1000));
        continue;
      }

      // HIGH TICK RATE: 100ms for fast brawler response
      await new Promise((resolve) => setTimeout(resolve, 100));
      try {
        await gameSystemTick(engine, entityPda);
      } catch (error) {
        // Silently continue to keep the loop alive
      }
    }
  })();
  return () => { running = false; };
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
      
      // Checking for both players' elimination
      await gameSystemFinish(engine, entityPda, 0);
      await gameSystemFinish(engine, entityPda, 1);
    } catch (e) {}
  }, 3000);
  return () => clearInterval(interval);
}
