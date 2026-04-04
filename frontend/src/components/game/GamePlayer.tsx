import * as React from "react";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";
import { Text } from "../util/Text";
import "./GamePlayer.scss";

// Style definitions for variety - purely visual flavor
const STYLES = ["ALTE", "GOTH", "TECHWEAR", "CYBER-MONK", "STREET-BRAWLER"];
const BUILDS = ["Muscular", "Lean", "Powerhouse", "Shadow-Form"];

export function GamePlayer({
  playerIndex,
  player,
}: {
  playerIndex: number;
  player: any;
}) {
  const engine = useMagicBlockEngine();
  const isYou = player.authority.equals(engine.getSessionPayer());

  // Deterministic "Style" based on player index for variety
  const characterStyle = STYLES[playerIndex % STYLES.length];
  const characterBuild = BUILDS[(playerIndex + 1) % BUILDS.length];
  const isMale = playerIndex % 2 === 0;

  // Visual Setup
  const themeColor = isYou ? "#00ff9d" : "#60a5fa"; // Neon Green (You) vs Ghost Blue (Ghost)
  const health = player.health !== undefined ? Math.max(0, player.health) : 100;

  return (
    <div
      className={`GamePlayer relative group overflow-hidden transition-all duration-500 rounded-xl border-2 p-1 P${playerIndex} ${
        isYou ? "border-[#00ff9d] bg-black/40" : "border-blue-500/40 bg-blue-900/10"
      }`}
      style={{ boxShadow: `0 0 20px ${themeColor}22` }}
    >
      {/* 1. THE HOLOGRAPHIC PORTRAIT & GLITCH EFFECT */}
      <div className="absolute top-0 right-0 w-32 h-full opacity-30 group-hover:opacity-70 transition-opacity pointer-events-none overflow-hidden">
        <div className={`relative w-full h-full ${!isYou ? "animate-ghost-glitch" : ""}`}>
           {/* 3D-ish Silhouette using CSS Masking */}
           <div 
             className="w-full h-full bg-gradient-to-l from-slate-700 to-transparent" 
             style={{ clipPath: 'polygon(30% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
           />
           <div className="absolute inset-0 flex items-center justify-center font-black text-6xl italic text-white/10 select-none">
             {isMale ? "M" : "F"}
           </div>
           
           {/* Ghost-only Glitch Overlays */}
           {!isYou && (
             <>
               <div className="absolute inset-0 bg-blue-500/10 mix-blend-screen animate-pulse" />
               <div className="absolute inset-0 border-r-2 border-blue-400/30 blur-[2px]" />
             </>
           )}
        </div>
      </div>

      <div className="relative z-10 flex p-4 gap-4">
        {/* 2. STYLE BADGE / AVATAR */}
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl shadow-lg transition-transform group-hover:scale-110 ${
            isYou ? "border-[#00ff9d] shadow-[#00ff9d]/20" : "border-blue-400 shadow-blue-400/20"
          }`}>
            {isYou ? "👤" : "👻"}
          </div>
          <span className="mt-2 text-[8px] font-black tracking-[0.3em] uppercase opacity-40">
            {characterStyle}
          </span>
        </div>

        {/* 3. CHARACTER SPECS */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h2 className={`text-xl font-black italic tracking-tighter text-white uppercase ${!isYou ? "animate-ghost-flicker" : ""}`}>
              {isYou ? "YOU" : "GHOST"}
            </h2>
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
              isYou ? "bg-[#00ff9d] text-black" : "bg-blue-600 text-white"
            }`}>
              {isYou ? "PLAYER" : "DATA_REPLAY"}
            </span>
          </div>

          <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">
            {characterBuild} // {isMale ? "MALE" : "FEMALE"} // {characterStyle}
          </p>

          {/* 4. THE LIQUID HEALTH BAR + SHIMMER */}
          <div className="mt-4 w-full">
            <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
              <span className="text-slate-600 italic tracking-wider">Vitals Integrity</span>
              <span style={{ color: themeColor }}>{health}%</span>
            </div>
            <div className="h-2 w-full bg-slate-900 rounded-sm overflow-hidden relative border border-white/5">
              {/* THE SHIMMER EFFECT LAYER */}
              <div 
                className="h-full transition-all duration-1000 ease-out relative"
                style={{ 
                    width: `${health}%`, 
                    backgroundColor: health > 30 ? themeColor : "#ef4444",
                    boxShadow: `0 0 15px ${health > 30 ? themeColor : "#ef4444"}aa`
                }} 
              >
                {/* The Shimmer Animation Component */}
                <div className="health-bar-shimmer absolute inset-0" />
              </div>
            </div>
          </div>

          {/* 5. SYNC STATUS */}
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-[9px] font-mono text-slate-600 italic">
               {player.ready ? ">> LINK_STABLE" : ">> SYNCING_INTENT..."}
            </span>
            <div className="flex gap-1">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full ${player.ready ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`} />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* 6. GLOBAL GHOST SCANLINE OVERLAY */}
      {!isYou && (
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.15)_0px,rgba(0,0,0,0.15)_1px,transparent_1px,transparent_2px)] z-50 opacity-50" />
      )}
    </div>
  );
}
