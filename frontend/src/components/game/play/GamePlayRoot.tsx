import * as React from "react";
import { GameView } from "./GameView";
import { ActionPanel } from "./ActionPanel";
import { MoveHistory } from "./MoveHistory";

interface GamePlayProps {
  entityPda: any;
  gamePda: any;
  game: any;
}

export function GamePlayRoot({ entityPda, gamePda, game }: GamePlayProps) {
  const isFinished = game.status.finished;
  const winner = game.winner;

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* HUD: NEURAL INTEGRITY STATUS */}
      <div className="grid grid-cols-2 gap-10 w-full mb-2">
        {/* LOCAL OPERATIVE (Player 1) */}
        <div className="relative group">
          <div className="flex justify-between items-end mb-2">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] animate-pulse">
                [ Local_Operative ]
              </span>
              <span className="text-[8px] font-mono text-zinc-600">ID: USER_UPLINK_01</span>
            </div>
            <span className="text-xs font-mono text-cyan-400/80">{game.player1.hp}%</span>
          </div>
          <div className="h-4 w-full bg-zinc-950 border border-zinc-800 p-[2px] relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-400 shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all duration-500 ease-out" 
              style={{ width: `${game.player1.hp}%` }} 
            />
            {/* Grid Overlay on Health Bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.3)_95%)] bg-[length:20px_100%]" />
          </div>
        </div>

        {/* REMOTE GHOST (Player 2) */}
        <div className="relative text-right">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-mono text-red-500/80">{game.player2.hp}%</span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-[0.2em]">
                [ Neural_Ghost ]
              </span>
              <span className="text-[8px] font-mono text-zinc-600">ID: SHADOW_INC_99</span>
            </div>
          </div>
          <div className="h-4 w-full bg-zinc-950 border border-zinc-800 p-[2px] relative overflow-hidden">
            <div 
              className="h-full bg-gradient-to-l from-red-700 to-orange-500 shadow-[0_0_15px_rgba(220,38,38,0.4)] ml-auto transition-all duration-500 ease-out" 
              style={{ width: `${game.player2.hp}%` }} 
            />
            {/* Grid Overlay on Health Bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_95%,rgba(0,0,0,0.3)_95%)] bg-[length:20px_100%]" />
          </div>
        </div>
      </div>

      {/* THE GRID: COMBAT VIEWPORT */}
      <div className="relative aspect-video w-full bg-zinc-950 border-y border-zinc-800 overflow-hidden group shadow-2xl">
        {/* Subtle Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px]" />
        
        {/* Main Rendering Canvas */}
        <GameView game={game} />
        
        {/* UI Overlay: Combat Specs */}
        <div className="absolute bottom-4 left-4 flex gap-4 pointer-events-none opacity-50">
            <div className="border-l-2 border-cyan-500 pl-2">
                <p className="text-[8px] font-mono text-zinc-400 uppercase">Latency</p>
                <p className="text-[10px] font-mono text-white">0.02ms (Rollup)</p>
            </div>
            <div className="border-l-2 border-zinc-700 pl-2">
                <p className="text-[8px] font-mono text-zinc-400 uppercase">Protocol</p>
                <p className="text-[10px] font-mono text-white">INSURGENCY_V.1</p>
            </div>
        </div>

        {/* FINALIZATION OVERLAY (Victory/Defeat) */}
        {isFinished && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center z-50 backdrop-blur-md animate-in fade-in zoom-in duration-500">
            <div className="mb-2">
                <span className="text-zinc-600 font-mono text-[10px] tracking-[0.5em] uppercase">Session_Terminated</span>
            </div>
            <h2 className={`text-7xl font-black italic tracking-tighter mb-4 ${winner === "player1" ? "text-cyan-500" : "text-red-600"}`}>
                {winner === "player1" ? "NODE_SECURED" : "LINK_SEVERED"}
            </h2>
            <div className={`h-[2px] w-64 mb-8 ${winner === "player1" ? "bg-cyan-500" : "bg-red-600"}`} />
            
            <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest mb-12 max-w-md text-center leading-relaxed px-6">
                {winner === "player1" 
                  ? "Champion intent successfully rehydrated and archived to the Deep Web." 
                  : "Neural ghost detected. Operative connection forced closed by host."}
            </p>
            
            <button 
              onClick={() => window.location.href = "/"}
              className="px-10 py-4 bg-transparent border-2 border-white text-white font-black uppercase hover:bg-white hover:text-black transition-all tracking-widest text-sm"
            >
              Return to Grid
            </button>
          </div>
        )}
      </div>

      {/* CONTROL DECK & PACKET HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
            <ActionPanel entityPda={entityPda} gamePda={gamePda} disabled={isFinished} />
        </div>
        <div className="bg-zinc-950 border border-zinc-900 p-5 flex flex-col">
            <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-pulse" />
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Packet_History</h3>
            </div>
            <div className="flex-grow overflow-y-auto max-h-[200px] custom-scrollbar">
                <MoveHistory game={game} />
            </div>
        </div>
      </div>

      {/* Decorative Border Decal */}
      <div className="w-full flex justify-between opacity-10">
        <div className="h-[1px] w-32 bg-cyan-500" />
        <div className="h-[1px] w-32 bg-red-600" />
      </div>
    </div>
  );
}
