import * as React from "react";
import { Text } from "../util/Text";

export function GameError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-950/20 border-2 border-red-600 rounded-xl shadow-[0_0_40px_rgba(220,38,38,0.2)]">
      <div className="text-6xl mb-4 animate-bounce">⚠️</div>
      <h2 className="text-2xl font-black text-red-500 italic tracking-tighter uppercase mb-2">
        Critical Link Failure
      </h2>
      <div className="font-mono text-xs text-red-400 bg-black/50 p-4 rounded border border-red-900/50 max-w-sm text-center">
        {message.toUpperCase()}
      </div>
      <button 
        onClick={() => window.location.reload()}
        className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded hover:bg-red-500 transition-colors uppercase text-xs tracking-widest"
      >
        Re-establish Connection
      </button>
      <p className="mt-4 text-[8px] text-slate-600 font-mono">ERROR_CODE: SHADOW_SYNC_LOST_0x04</p>
    </div>
  );
}
