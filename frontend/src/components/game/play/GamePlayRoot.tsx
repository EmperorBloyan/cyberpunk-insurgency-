import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { useSessionKey } from "../../../engine/useSessionKey";
import { GamePlayer } from "../GamePlayer";
import { GamePlayMap } from "./GamePlayMap";
import { gameSystemTick } from "../../../states/gameSystemTick";
import { gameSystemFinish } from "../../../states/gameSystemFinish";
import "./GamePlayRoot.scss";

// --- AUDIO SAFETY WRAPPER ---
const playSfx = (audioObj: HTMLAudioElement) => {
  audioObj.play().catch((err) => {
    // This prevents the "Uncaught (in promise)" error if the file is missing or autoplay is blocked
    console.warn("SFX Blocked: Ensure user interacted with page or check /public/sfx/", err);
  });
};

export function GamePlayRoot({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const { isDelegated, delegate, isDelegating } = useSessionKey(entityPda);

  // Memoize audio to prevent re-loading on every render
  const glitchSfx = React.useMemo(() => new Audio("/sfx/glitch.mp3"), []);
  const sizzleSfx = React.useMemo(() => new Audio("/sfx/sizzle.mp3"), []);

  // 1. DAMAGE & EVENT WATCHER
  const lastHealth = React.useRef(game.players[0].health);

  React.useEffect(() => {
    const humanHealth = game.players[0].health;
    if (humanHealth < lastHealth.current) {
      playSfx(sizzleSfx); // Safety play
    }
    lastHealth.current = humanHealth;
  }, [game.players[0].health, sizzleSfx]);

  // 2. CONSOLIDATED ENGINE LOOP (Tick + Finish)
  React.useEffect(() => {
    if (!isDelegated || !game.status.playing) return;

    const controller = new AbortController();
    
    const runArenaLogic = async () => {
      while (!controller.signal.aborted) {
        try {
          // Fast Tick for Brawler Feel (100ms)
          await gameSystemTick(engine, entityPda);
          
          // Check for Match End every 3 seconds
          if (Date.now() % 3000 < 150) {
            await gameSystemFinish(engine, entityPda, 0);
            await gameSystemFinish(engine, entityPda, 1);
          }
        } catch (e) {
          // Rollup skips are normal, we just keep the loop moving
        }
        await new Promise(r => setTimeout(r, 100));
      }
    };

    runArenaLogic();
    return () => controller.abort();
  }, [engine, entityPda, isDelegated, game.status.playing]);

  // 3. NEURAL LINK (Handshake Screen)
  if (!isDelegated) {
    return (
      <div className="NeuralLinkScreen flex flex-col items-center justify-center min-h-[450px] p-8">
        <div className="TerminalBox p-10 border-2 border-red-500 bg-black/95 shadow-[0_0_60px_rgba(220,38,38,0.3)]">
          <h1 className="text-4xl font-black italic text-red-500 mb-4 animate-pulse">
            NEURAL LINK REQUIRED
          </h1>
          <p className="text-slate-400 font-mono text-xs mb-8 uppercase tracking-widest">
             [STATUS]: Unauthorized Access Detected. <br/>
             [ACTION]: Authorize session to sync with Shadow Realm.
          </p>
          <button 
            onClick={() => {
                playSfx(glitchSfx);
                delegate();
            }} 
            disabled={isDelegating}
            className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black uppercase transition-all transform active:scale-95"
          >
            {isDelegating ? "ESTABLISHING LINK..." : "STRIKE THE SHADOW"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="GamePlayRoot w-full max-w-5xl mx-auto p-4">
      <div className="flex justify-between items-end mb-4 border-b border-slate-800 pb-2">
        <div>
          <h2 className="text-2xl font-black text-white italic tracking-tighter">SHADOW_ARENA.EXE</h2>
          <span className="text-[10px] font-mono text-green-500 uppercase">
            ● EPHEMERAL_ROLLUP_ACTIVE // SLOT: {game.tickNextSlot.toString()}
          </span>
        </div>
      </div>

      <div className="relative border-4 border-slate-900 bg-black rounded-lg overflow-hidden shadow-2xl">
        <GamePlayMap entityPda={entityPda} game={game} />
      </div>

      {/* Battle Status Dashboard */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        {game.players.map((p, i) => (
          <div key={i} className={`p-4 rounded border ${i === 1 ? 'border-blue-900 bg-blue-900/10' : 'border-slate-800 bg-slate-900/40'}`}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase">{i === 0 ? "You" : "Champion Shadow"}</span>
              <span className="text-xs font-mono text-white">HP: {p.health}</span>
            </div>
            <div className="w-full h-1 bg-slate-800 rounded-full">
               <div 
                 className={`h-full transition-all duration-300 ${i === 0 ? 'bg-green-400 shadow-[0_0_10px_#4ade80]' : 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'}`} 
                 style={{ width: `${p.health}%` }}
               />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
