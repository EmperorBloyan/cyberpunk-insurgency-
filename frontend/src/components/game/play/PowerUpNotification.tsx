import * as React from "react";

export function PowerUpNotification({ text }: { text: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center z-[100] pointer-events-none">
      <div className="animate-powerup-pop">
        <h1 className="text-6xl font-black italic text-yellow-400 drop-shadow-[0_0_20px_rgba(250,204,21,0.9)] tracking-tighter uppercase">
          {text}
        </h1>
        <div className="h-1 bg-yellow-400 w-full animate-shimmer shadow-[0_0_10px_#facc15]" />
      </div>
    </div>
  );
}
