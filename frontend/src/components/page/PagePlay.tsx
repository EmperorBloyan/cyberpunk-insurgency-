import * as React from "react";
import { useParams } from "react-router-dom";
import { PublicKey } from "@solana/web3.js";
import { FindComponentPda } from "@magicblock-labs/bolt-sdk";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";
import { Text } from "../util/Text";
import { COMPONENT_GAME_PROGRAM_ID } from "../../states/gamePrograms";
import { gameListen } from "../../states/gameListen";

import { GameLobbyRoot } from "../game/lobby/GameLobbyRoot";
import { GamePlayRoot } from "../game/play/GamePlayRoot";
import { GameError } from "../game/GameError";

export function PagePlay() {
  const params = useParams();
  const engine = useMagicBlockEngine();

  // 1. Memoize PDAs for stability
  const { entityPda, gamePda } = React.useMemo(() => {
    try {
      if (!params.id) throw new Error("No ID");
      const entity = new PublicKey(params.id);
      return {
        entityPda: entity,
        gamePda: FindComponentPda({
          entity,
          componentId: COMPONENT_GAME_PROGRAM_ID,
        }),
      };
    } catch (e) {
      return { entityPda: null, gamePda: null };
    }
  }, [params.id]);

  // 2. Real-time Listener
  const [game, setGame] = React.useState<any>(undefined);
  
  React.useEffect(() => {
    if (entityPda && gamePda && engine) {
      // Ensure the cleanup function is returned correctly
      const unsubscribe = gameListen(engine, entityPda, gamePda, setGame);
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, [engine, entityPda, gamePda]);

  // Error State: Invalid Node ID
  if (!entityPda || !gamePda) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <GameError message="INVALID_NODE_COORDINATES" />
      </div>
    );
  }

  // Error State: Fetch Failure (Signal Loss)
  if (game === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505]">
        <GameError message="SIGNAL_LOSS: NEURAL_LINK_SEVERED" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-[#050505] p-4 md:p-8 overflow-hidden selection:bg-cyan-900/50">
      
      {/* Visual Header Decoration */}
      <div className="w-full max-w-5xl flex justify-between items-end mb-10 border-b border-zinc-900 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase">
            CYBERPUNK <span className="text-cyan-500">INSURGENCY</span>
          </h1>
          <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-[0.5em] mt-2">
            ACTIVE_SECTOR_UPLINK: {entityPda.toBase58().slice(0, 8)}...{entityPda.toBase58().slice(-8)}
          </p>
        </div>
        
        <div className="flex gap-10 items-center">
           <div className="hidden lg:block text-right border-r border-zinc-900 pr-8">
             <p className="text-[9px] text-cyan-600 font-black uppercase tracking-widest">Protocol</p>
             <p className="text-[11px] text-zinc-400 font-mono">GHOST_RECORD_SYNC</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest animate-pulse">● System_Live</p>
             <p className="text-[11px] text-zinc-500 font-mono uppercase">EPHEMERAL_ROLLUP_STABLE</p>
           </div>
        </div>
      </div>

      {/* Main Game Interface Logic */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        {(() => {
          // 1. Loading Phase
          if (game === undefined) {
            return (
              <div className="flex flex-col items-center mt-32">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 border-2 border-zinc-900 rounded-full" />
                  <div className="absolute inset-0 border-2 border-t-cyan-500 rounded-full animate-spin" />
                  <div className="absolute inset-4 border border-zinc-800 rounded-full animate-pulse" />
                </div>
                <div className="mt-8 text-center">
                  <Text value="ARCHIVING_NEURAL_INTENT..." />
                  <p className="text-[10px] text-zinc-600 font-mono mt-3 animate-pulse uppercase tracking-widest">Bridging_Node_State...</p>
                </div>
              </div>
            );
          }

          // 2. Logic Check: Convert Enum Object to String
          // Anchor enums come back as { lobby: {} } or { playing: {} }
          const status = Object.keys(game.status)[0].toLowerCase();

          if (status === "lobby") {
            return (
              <div className="w-full animate-in fade-in zoom-in duration-500">
                <GameLobbyRoot
                  entityPda={entityPda}
                  gamePda={gamePda}
                  game={game}
                />
              </div>
            );
          }

          if (status === "playing" || status === "finished") {
            return (
              <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                <GamePlayRoot 
                  entityPda={entityPda} 
                  gamePda={gamePda} 
                  game={game} 
                />
              </div>
            );
          }

          return <GameError message="CRITICAL_EXCEPTION: NODE_MEMORY_CORRUPTION" />;
        })()}
      </div>

      {/* Overlay Decoration */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(6,182,212,0.06),rgba(0,255,0,0.02),rgba(220,38,38,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="fixed inset-0 pointer-events-none bg-cyan-500 opacity-[0.01] mix-blend-overlay z-[99]" />
    </div>
  );
}
