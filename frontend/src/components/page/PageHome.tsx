import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";
import { ForEach } from "../util/ForEach";
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
    <div className="flex flex-col items-center justify-start min-h-screen p-8 bg-black text-white selection:bg-cyan-900">
      <div className="mb-12 text-center">
        <h1 className="text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-white to-blue-600 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          CYBERPUNK INSURGENCY
        </h1>
        <p className="text-cyan-500 font-mono text-[10px] tracking-[0.5em] uppercase mt-4">
          Neural-Link Protocol // Ghost_Net Access
        </p>
      </div>

      <button
        className="group relative px-12 py-6 mb-16 bg-zinc-900 border border-cyan-500/50 hover:border-cyan-400 transition-all active:scale-95"
        onClick={() => navigate("/create")}
      >
        <span className="text-xl font-bold uppercase tracking-[0.2em] text-cyan-400 group-hover:text-white">
          [ INITIALIZE INCURSION ]
        </span>
      </button>

      <div className="w-full max-w-2xl">
        <h2 className="text-zinc-600 font-black uppercase text-[10px] tracking-[0.4em] mb-4">Active_Sectors</h2>
        <ForEach<any>
          values={entries}
          renderer={(entry) => {
            const status = entry.game.status;
            const code = entry.entityPda.toBase58();
            return (
              <button
                key={code}
                onClick={() => navigate("/play/" + code)}
                className="w-full mb-3 p-4 bg-zinc-950 border border-zinc-900 hover:border-cyan-500/30 flex items-center justify-between group"
              >
                <div className="text-left">
                  <p className="text-zinc-100 font-mono font-bold tracking-tight">SECTOR_{code.slice(0, 4)}</p>
                  <p className="text-[9px] text-zinc-700 font-mono">{code.slice(0, 16)}...</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase text-cyan-600">{status.playing ? "SIGNAL_ACTIVE" : "IDLE_NODE"}</p>
                </div>
              </button>
            );
          }}
        />
      </div>
    </div>
  );
}
