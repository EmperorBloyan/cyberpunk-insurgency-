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

  // 2. Real-time Listener for the Shadow Arena State
  const [game, setGame] = React.useState<any>(undefined);
  
  React.useEffect(() => {
    if (entityPda && gamePda) {
      return gameListen(engine, entityPda, gamePda, setGame);
    }
  }, [engine, entityPda, gamePda]);

  // Error State: Invalid Arena ID
  if (!entityPda) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <GameError message="INVALID ARENA COORDINATES" />
      </div>
    );
  }

  // Error State: Fetch Failure
  if (game === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <GameError message="CONNECTION LOST: SHADOW ARENA UNREACHABLE" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-slate-950 p-4 md:p-8 overflow-hidden">
      
      {/* Visual Header Decoration */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-black italic text-white tracking-tighter">
            BLITZ <span className="text-red-600">BRAWLER</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em]">
            Instance: {entityPda.toBase58().slice(0, 16)}...
          </p>
        </div>
        <div className="flex gap-4">
           <div className="text-right">
             <p className="text-[9px] text-blue-400 font-bold uppercase">Shadow Engine</p>
             <p className="text-[11px] text-slate-400 font-mono italic">ACTIVE</p>
           </div>
        </div>
      </div>

      {/* Main Game Controller Rendering Logic */}
      <div className="w-full max-w-4xl flex flex-col items-center">
        {(() => {
          // Loading Phase
          if (game === undefined) {
            return (
              <div className="flex flex-col items-center mt-20">
                <div className="w-12 h-12 border-4 border-slate-800 border-t-red-600 rounded-full animate-spin mb-4" />
                <Text value="REHYDRATING ARENA STATE..." />
              </div>
            );
          }

          // Lobby / Generation Phase
          if (game.status.generate || game.status.lobby) {
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

          // Playing / Finished Phase
          if (game.status.playing || game.status.finished) {
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

          return <Text value="FATAL ERROR: UNKNOWN ARENA DIMENSION" />;
        })()}
      </div>

      {/* Background Ambience (Scanlines) */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-[100] bg-[length:100%_2px,3px_100%]" />
    </div>
  );
}
