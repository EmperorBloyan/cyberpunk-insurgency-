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
      const entity = new PublicKey(params.id!);
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

  // 2. Real-time Listener for the Web War I State
  const [game, setGame] = React.useState<any>(undefined);
  
  React.useEffect(() => {
    if (entityPda && gamePda) {
      return gameListen(engine, entityPda, gamePda, setGame);
    }
  }, [engine, entityPda, gamePda]);

  // Error State: Invalid Warzone ID
  if (!entityPda) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <GameError message="INVALID THEATER COORDINATES" />
      </div>
    );
  }

  // Error State: Fetch Failure
  if (game === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <GameError message="SIGNAL INTERRUPTED: NEURAL LINK SEVERED" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-950 p-4 md:p-8 overflow-hidden selection:bg-red-600">
      
      {/* Visual Header Decoration */}
      <div className="w-full max-w-5xl flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-4xl font-black italic text-white tracking-tighter">
            WEB <span className="text-red-600">WAR I</span>
          </h1>
          <p className="text-[9px] text-zinc-500 font-mono uppercase tracking-[0.4em] mt-1">
            Sector_UID: {entityPda.toBase58().slice(0, 16)}...
          </p>
        </div>
        <div className="flex gap-6 items-center">
           <div className="hidden md:block text-right border-r border-zinc-800 pr-6">
             <p className="text-[9px] text-red-500 font-black uppercase tracking-widest">Ghost Division</p>
             <p className="text-[11px] text-zinc-400 font-mono">NEURAL_SYNC_STABLE</p>
           </div>
           <div className="text-right">
             <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest">Ephemeral Node</p>
             <p className="text-[11px] text-green-500 font-mono animate-pulse">CONNECTED</p>
           </div>
        </div>
      </div>

      {/* Main Game Controller Rendering Logic */}
      <div className="w-full max-w-5xl flex flex-col items-center">
        {(() => {
          // Loading Phase
          if (game === undefined) {
            return (
              <div className="flex flex-col items-center mt-32">
                <div className="relative w-16 h-16">
                  <div className="absolute inset-0 border-4 border-zinc-900 rounded-full" />
                  <div className="absolute inset-0 border-4 border-t-red-600 rounded-full animate-spin" />
                </div>
                <div className="mt-6 text-center">
                  <Text value="REHYDRATING COMBAT INTEL..." />
                  <p className="text-[10px] text-zinc-600 font-mono mt-2 animate-pulse">Establishing Rollup Session...</p>
                </div>
              </div>
            );
          }

          // Lobby / Generation Phase
          if (game.status.generate || game.status.lobby) {
            return (
              <div className="w-full animate-in fade-in zoom-in duration-700">
                <GameLobbyRoot
                  entityPda={entityPda}
                  gamePda={gamePda}
                  game={game}
                />
              </div>
            );
          }

          // Playing / Finished Phase
          if (game.status.playing || game.status.finished) {
            return (
              <div className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700">
                <GamePlayRoot 
                  entityPda={entityPda} 
                  gamePda={gamePda} 
                  game={game} 
                />
              </div>
            );
          }

          return <GameError message="CRITICAL_EXCEPTION: THEATER_DIMENSION_COLLAPSE" />;
        })()}
      </div>

      {/* Background Ambience (Scanlines & Noise) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.04] z-[100] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />
      <div className="fixed inset-0 pointer-events-none bg-black opacity-[0.02] mix-blend-overlay z-[99]" />
    </div>
  );
}
