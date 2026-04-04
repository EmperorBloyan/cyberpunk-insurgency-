import * as React from "react";
import "./PoisonRingOverlay.scss";

export function PoisonRingOverlay({ game }: { game: any }) {
  // Logic: Every 10 ticks, the ring shrinks by 1 cell from each side
  const shrinkAmount = Math.floor(game.tickNextSlot / 10);
  
  const style = {
    top: `${shrinkAmount * 64}px`, // Assuming 64px cell size
    bottom: `${shrinkAmount * 64}px`,
    left: `${shrinkAmount * 64}px`,
    right: `${shrinkAmount * 64}px`,
  };

  if (game.status !== "Playing") return null;

  return (
    <div className="PoisonRingOverlay shrinking" style={style}>
      <div className="WarningText absolute top-2 left-1/2 -translate-x-1/2 text-[10px] text-red-500 animate-pulse">
        ⚠️ POISON RING SHRINKING ⚠️
      </div>
    </div>
  );
}
