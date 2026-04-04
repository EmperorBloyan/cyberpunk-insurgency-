import * as React from "react";
import { NavigateFunction, useNavigate } from "react-router-dom";

import { MagicBlockEngine } from "../../engine/MagicBlockEngine";
import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";

import { Text } from "../util/Text";
import { ForEach } from "../util/ForEach";
import { gameCreate } from "../../states/gameCreate";
import { GameError } from "../game/GameError";

export function PageCreate() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  const [error, setError] = React.useState<string | undefined>(undefined);
  const [logs, setLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    let lastLogs: string[] = [];
    
    // Updated flavor text for Cyberpunk Insurgency
    const customOnLog = (log: string) => {
        let flavoredLog = log;
        if (log.includes("Creating")) flavoredLog = "📡 INITIATING NEURAL HANDSHAKE...";
        if (log.includes("PDA")) flavoredLog = "🔑 ENCRYPTING NODE COORDINATES...";
        if (log.includes("Success")) flavoredLog = "⚔️ UPLINK STABLE. INSURGENCY COMMENCING.";
        
        lastLogs = [...lastLogs, flavoredLog];
        setLogs(lastLogs);
    };

    const cleanup = scheduleCreate(
      navigate,
      engine,
      customOnLog,
      (err) => setError(err)
    );

    return cleanup;
  }, [navigate, engine]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#050505] p-6">
        <GameError message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#050505] text-white p-8 selection:bg-cyan-900/50">
      
      {/* Header with Pulse Animation */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tighter text-cyan-500 animate-pulse uppercase">
          Syncing Neural Link
        </h1>
        <div className="h-[2px] w-48 bg-cyan-500 mx-auto mt-4 shadow-[0_0_20px_rgba(6,182,212,0.6)]" />
      </div>

      <div className="w-full max-w-lg space-y-4 mb-12 text-center opacity-80">
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.5em]">
            PROTOCOL: CYBERPUNK INSURGENCY // V.1.0.4
        </p>
        <p className="text-zinc-400 font-bold uppercase text-xs tracking-widest">
            Bridging Node State with Ephemeral Rollup...
        </p>
      </div>

      {/* Terminal Style Log Window */}
      <div className="w-full max-w-xl bg-black border border-zinc-900 rounded-sm overflow-hidden shadow-2xl">
        <div className="bg-zinc-900/50 px-4 py-3 flex items-center gap-3 border-b border-zinc-900">
            <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-zinc-800" />
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
            </div>
            <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest">Incursion_Log_Stream</span>
        </div>
        
        <div className="p-8 font-mono text-xs space-y-4 min-h-[220px]">
          {logs.length === 0 && (
            <div className="text-zinc-800 animate-pulse italic">Awaiting validator response...</div>
          )}
          <ForEach
            values={logs}
            renderer={(log, index) => (
              <div key={index} className="flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-400">
                <span className="text-zinc-700">[{index + 1}]</span>
                <span className={index === logs.length - 1 ? "text-cyan-400 font-bold tracking-tight" : "text-zinc-400"}>
                    {log}
                </span>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-12">
        <div className="flex items-center gap-4 text-zinc-600 text-[10px] uppercase font-bold tracking-[0.3em]">
            <div className="w-5 h-5 border border-zinc-800 border-t-cyan-500 rounded-full animate-spin" />
            Verifying Node Entropy
        </div>
      </div>
    </div>
  );
}

function scheduleCreate(
  navigate: NavigateFunction,
  engine: MagicBlockEngine,
  onLog: (msg: string) => void,
  onError: (msg: string) => void
) {
  const timeout = setTimeout(async () => {
    try {
      const entityPda = await gameCreate(engine, onLog);
      const code = entityPda.toBase58();
      
      // Delay navigation to let the "Success" log linger for immersion
      setTimeout(() => navigate("/play/" + code), 1500);
      
    } catch (error) {
      console.error("create-error", error);
      onError("SIGNAL_LOST: NODE_MANIFEST_FAILURE");
    }
  }, 500);

  return () => clearTimeout(timeout);
}
