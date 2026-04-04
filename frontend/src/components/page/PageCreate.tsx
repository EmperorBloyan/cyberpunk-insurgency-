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
    
    // Updated flavor text for Web War I
    const customOnLog = (log: string) => {
        let flavoredLog = log;
        if (log.includes("Creating")) flavoredLog = "📡 ESTABLISHING NEURAL UPLINK...";
        if (log.includes("PDA")) flavoredLog = "🔑 SECURING WARZONE COORDINATES...";
        if (log.includes("Success")) flavoredLog = "⚔️ BATTLEFIELD STABILIZED. PREPARE FOR WEB WAR I.";
        
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
      <div className="flex items-center justify-center min-h-screen bg-black p-6">
        <GameError message={error} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white p-8">
      {/* Header with Pulse Animation */}
      <div className="mb-12 text-center">
        <h1 className="text-5xl font-black italic tracking-tighter text-red-600 animate-pulse">
          DEPLOYING FRONT-LINE
        </h1>
        <div className="h-1 w-32 bg-red-600 mx-auto mt-2 shadow-[0_0_15px_#dc2626]" />
      </div>

      <div className="w-full max-w-lg space-y-4 mb-12 text-center opacity-80">
        <p className="text-slate-400 font-mono text-xs uppercase tracking-widest">
            Protocol: WEB WAR I // Neural Link v1.0
        </p>
        <p className="text-blue-400 font-bold uppercase text-sm tracking-tight">
            Syncing Combat Data with Ephemeral Rollup...
        </p>
      </div>

      {/* Terminal Style Log Window */}
      <div className="w-full max-w-xl bg-black border border-slate-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="bg-slate-900 px-4 py-2 flex items-center gap-2 border-b border-slate-800">
            <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <div className="w-2 h-2 rounded-full bg-green-500" />
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">Combat_Deployment_Logs</span>
        </div>
        
        <div className="p-6 font-mono text-sm space-y-3 min-h-[200px]">
          {logs.length === 0 && (
            <div className="text-slate-700 animate-pulse">Awaiting handshake with Solana Validator...</div>
          )}
          <ForEach
            values={logs}
            renderer={(log, index) => (
              <div key={index} className="flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300">
                <span className="text-slate-600">[{index + 1}]</span>
                <span className={index === logs.length - 1 ? "text-green-400 font-bold" : "text-slate-300"}>
                    {log}
                </span>
              </div>
            )}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center gap-2 text-slate-600 text-[10px] uppercase font-bold tracking-[0.2em]">
            <div className="w-4 h-4 border-2 border-slate-700 border-t-red-600 rounded-full animate-spin" />
            Verifying Blockchain Entropy
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
      
      // Delay navigation so the user can feel the "Deployment" completion
      setTimeout(() => navigate("/play/" + code), 1200);
      
    } catch (error) {
      console.error("create-error", error);
      onError("SIGNAL_LOST: Could not manifest the Web War I theater.");
    }
  }, 500);

  return () => clearTimeout(timeout);
}
