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
    const interval = setInterval(fetchGames, 5000);
    return () => clearInterval(interval);
  }, [engine]);

  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-slate-950 text-white selection:bg-red-900">
      {/* Hero Section */}
      <div className="mb-12 text-center">
        <h1 className="text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-red-600 to-slate-900 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
          WEB WAR I
        </h1>
        <p className="text-slate-500 font-mono text-xs tracking-[0.3em] uppercase mt-4">
          Neural-Link Protocol // Ghost Division 01
        </p>
      </div>

      {/* Main Action Button */}
      <button
        className="group relative px-16 py-8 mb-16 bg-zinc-900 hover:bg-red-700 transition-all rounded-none border-2 border-red-600 shadow-[0_0_20px_rgba(220,38,38,0.2)] active:scale-95"
        onClick={() => navigate("/create")}
      >
        <span className="text-2xl font-black italic uppercase tracking-widest text-red-500 group-hover:text-white">
          [ DEPLOY TO FRONT-LINE ]
        </span>
        <div className="absolute -inset-1 bg-red-600 opacity-10 group-hover:opacity-30 blur-xl transition-all" />
      </button>

      <div className="w-full max-w-2xl">
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-red-900 font-black uppercase text-[10px] tracking-[0.4em]">Active Theaters</h2>
          <div className="h-[1px] flex-grow mx-4 bg-gradient-to-r from-red-900 to-transparent" />
        </div>

        <ForEach<any>
          values={entries}
          renderer={(entry) => {
            const status = entry.game.status;
            const code = entry.entityPda.toBase58();
            const num = entry.entityId.toString().padStart(4, "0");

            let indicator = "□";
            let colorClass = "text-slate-700";
            let label = "Offline";

            if (status.lobby) { colorClass = "text-blue-500"; label = "Sector Empty"; indicator = "◎"; }
            if (status.playing) { colorClass = "text-red-600"; label = "Incursion Active"; indicator = "⚡"; }
            if (status.finished) { colorClass = "text-zinc-500"; label = "Archived Intel"; indicator = "📜"; }

            return (
              <button
                key={code}
                onClick={() => navigate("/play/" + code)}
                className="w-full mb-4 p-5 bg-black/40 border-l-4 border-r border-y border-zinc-800 hover:border-red-600 hover:bg-zinc-900/50 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-6">
                  <span className={`text-2xl ${colorClass} group-hover:scale-125 transition-transform`}>{indicator}</span>
                  <div className="text-left">
                    <p className="text-zinc-100 font-black font-mono tracking-tighter text-lg">THEATER_{num}</p>
                    <p className="text-[9px] text-zinc-600 font-mono uppercase tracking-widest">{code.slice(0, 16)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-[11px] font-black uppercase tracking-tighter ${colorClass}`}>{label}</p>
                  <p className="text-[9px] text-zinc-700 italic font-mono">Rollup_Node_Secured</p>
                </div>
              </button>
            );
          }}
        />
      </div>
      
      {/* Footer Decal */}
      <div className="mt-20 opacity-30 flex flex-col items-center gap-2">
        <div className="h-[1px] w-12 bg-red-600" />
        <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-[0.5em]">
          End of Line // Neural Connection Stable
        </p>
      </div>
    </div>
  );
}
