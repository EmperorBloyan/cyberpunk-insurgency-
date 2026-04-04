import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";
import { ForEach } from "../util/ForEach";
import { Text } from "../util/Text";
import { gameList } from "../../states/gameList";

export function PageHome() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  const [entries, setEntries] = React.useState<any[] | undefined>(undefined);
  
  React.useEffect(() => {
    const fetchGames = async () => {
      const games = await gameList(engine, 10);
      setEntries(games);
    };
    fetchGames();
    // Optional: Set up an interval to refresh the lobby every 5 seconds
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-slate-950 text-white">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-blue-500 drop-shadow-lg">
          BLITZ BRAWLER
        </h1>
        <p className="text-slate-400 font-mono text-sm tracking-widest uppercase mt-2">
          Shadow Arena // Onchain Replay Engine
        </p>
      </div>

      {/* Main Action Button */}
      <button
        className="group relative px-12 py-6 mb-16 bg-red-600 hover:bg-red-500 transition-all rounded-sm border-b-4 border-red-900 active:border-0 active:translate-y-1"
        onClick={() => navigate("/create")}
      >
        <span className="text-2xl font-black italic uppercase tracking-tighter">
          + Start New Arena Match +
        </span>
        <div className="absolute -inset-1 bg-red-600 opacity-20 group-hover:opacity-40 blur-lg transition-all" />
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-slate-500 font-bold uppercase text-xs tracking-widest">Active Instances</h2>
          <div className="h-[1px] flex-grow mx-4 bg-slate-800" />
        </div>

        <ForEach<any>
          values={entries}
          renderer={(entry) => {
            const status = entry.game.status;
            const code = entry.entityPda.toBase58();
            const num = entry.entityId.toString().padStart(4, "0");

            let indicator = "●";
            let colorClass = "text-slate-500";
            let label = "Initializing";

            if (status.lobby) { colorClass = "text-blue-400"; label = "Waiting for Player"; indicator = "⏳"; }
            if (status.playing) { colorClass = "text-red-500"; label = "Shadow Combat Active"; indicator = "🔥"; }
            if (status.finished) { colorClass = "text-green-500"; label = "Archive Record"; indicator = "🏆"; }

            return (
              <button
                key={code}
                onClick={() => navigate("/play/" + code)}
                className="w-full mb-3 p-4 bg-slate-900/50 border border-slate-800 hover:border-red-500/50 transition-colors flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <span className={`text-xl ${colorClass} group-hover:animate-pulse`}>{indicator}</span>
                  <div className="text-left">
                    <p className="text-white font-bold font-mono">ARENA_{num}</p>
                    <p className="text-[10px] text-slate-500 font-mono">{code.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-black uppercase ${colorClass}`}>{label}</p>
                  <p className="text-[9px] text-slate-600 italic">Ephem-Rollup v1.0</p>
                </div>
              </button>
            );
          }}
        />
      </div>
      
      {/* Footer Decal */}
      <div className="mt-20 opacity-20 pointer-events-none">
        <p className="text-[10px] font-mono text-slate-500">SYSTEM_LOG: MAGICBLOCK_BOLT_FRAMEWORK_CONNECTED</p>
      </div>
    </div>
  );
}
