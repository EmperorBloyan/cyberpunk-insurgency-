import * as React from "react";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";
import { Text } from "../util/Text";
import "./GamePlayer.scss";

// Style definitions for variety
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

  // Deterministic "Style" based on the player index or PDA
  const characterStyle = STYLES[playerIndex % STYLES.length];
  const characterBuild = BUILDS[(playerIndex + 1) % BUILDS.length];
  const isMale = playerIndex % 2 === 0;

  // Visual Setup
  const themeColor = isYou ? "#00ff9d" : "#60a5fa"; // Neon Green vs Ghost Blue
  const health = player.health !== undefined ? Math.max(0, player.health) : 100;

  return (
    <div
      className={`relative group overflow-hidden transition-all duration-500 rounded-xl border-2 p-1 ${
        isYou ? "border-[#00ff9d] bg-black/40" : "border-blue-500/40 bg-blue-900/10"
      }`}
      style={{ boxShadow: `0 0 20px ${themeColor}22` }}
    >
      {/* 1. The "Hyper-Realistic" Character Silhouette/Avatar */}
      <div className="absolute top-0 right-0 w-32 h-full opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
        <div className="relative w-full h-full">
           {/* We use a high-contrast gradient/mask to simulate a stylish character silhouette */}
           <div 
             className="w-full h-full bg-gradient-to-l from-slate-700 to-transparent" 
             style={{ clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)' }}
           />
           <div className="absolute inset-0 flex items-center justify-center font-black text-6xl italic text-white/10 select-none">
             {isMale ? "M" : "F"}
           </div>
        </div>
      </div>

      <div className="relative z-10 flex p-4 gap-4">
        {/* 2. Style Badge */}
        <div className="flex flex-col items-center">
          <div className={`w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl shadow-lg ${
            isYou ? "border-[#00ff9d] shadow-[#00ff9d]/20" : "border-blue-400 shadow-blue-400/20"
          }`}>
            {isYou ? "👤" : "👻"}
          </div>
          <span className="mt-2 text-[8px] font-black tracking-widest uppercase opacity-50">
            {characterStyle}
          </span>
        </div>

        {/* 3. Character Details */}
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black italic tracking-tighter text-white uppercase">
              {isYou ? "YOU" : "GHOST"}
            </h2>
            <span className={`text-[9px] px-2 py-0.5 rounded font-bold ${
              isYou ? "bg-[#00ff9d] text-black" : "bg-blue-600 text-white"
            }`}>
              LVL. {player.level ?? 24}
            </span>
          </div>

          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-tight">
            {characterBuild} • {isMale ? "Male" : "Female"} • {characterStyle}
          </p>

          {/* 4. Hyper-Realistic Health Bar */}
          <div className="mt-4 w-full">
            <div className="flex justify-between text-[9px] font-bold uppercase mb-1">
              <span className="text-slate-500 italic">Vitals Stability</span>
              <span style={{ color: themeColor }}>{health}%</span>
            </div>
            <div className="h-2 w-full bg-slate-800 rounded-sm overflow-hidden p-[1px]">
              <div 
                className="h-full transition-all duration-700 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                style={{ 
                    width: `${health}%`, 
                    backgroundColor: health > 30 ? themeColor : "#ff4444",
                    boxShadow: `0 0 10px ${health > 30 ? themeColor : "#ff4444"}88`
                }} 
              />
            </div>
          </div>

          {/* 5. Status Footer */}
          <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-2">
            <span className="text-[9px] font-mono text-slate-500 italic">
               {player.ready ? ">> LINK_STABLE" : ">> SYNCING..."}
            </span>
            <div className="flex gap-1">
                {[1,2,3].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full ${player.ready ? 'bg-green-500' : 'bg-slate-700 animate-pulse'}`} />
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative scanline overlay for the Ghost */}
      {!isYou && (
        <div className="absolute inset-0 pointer-events-none bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1)_0px,rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)]" />
      )}
    </div>
  );
}
