import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { MagicBlockQueue } from "../../../engine/MagicBlockQueue";
import { GameGridRows } from "../grid/GameGridRows";
import { gameSystemCommand } from "../../../states/gameSystemCommand";
import { PoisonRingOverlay } from "./PoisonRingOverlay"; // Make sure this exists!

export function GamePlayMap({ entityPda, game }: { entityPda: PublicKey; game: any }) {
  const engine = useMagicBlockEngine();
  const queue = React.useMemo(() => new MagicBlockQueue(engine), [engine]);
  const [activity, setActivity] = React.useState({ x: -1, y: -1 });

  // Map Constants from your Bolt Component
  const ringRadius = game.arena?.currentRadius ?? 8;
  const mapCenter = { x: 5, y: 5 };

  const onCommand = (targetX: number, targetY: number, type: string) => {
    if (type === "start") {
      // Check if clicking inside the Ring
      const dist = Math.sqrt(Math.pow(targetX - mapCenter.x, 2) + Math.pow(targetY - mapCenter.y, 2));
      if (dist > ringRadius) return; // Prevent clicking in the poison

      const cell = game.cells[targetY * game.sizeX + targetX];
      if (cell?.owner?.player?.[0] !== undefined) {
          setActivity({ x: targetX, y: targetY });
      }
    }
    
    if (type === "move" && activity.x !== -1) {
      gameSystemCommand(queue, entityPda, 0, activity.x, activity.y, targetX, targetY, 100);
      setActivity({ x: targetX, y: targetY });
    }

    if (type === "end") setActivity({ x: -1, y: -1 });
  };

  return (
    <div className="relative cursor-crosshair">
      {/* 1. The Dynamic Ring */}
      <PoisonRingOverlay radius={ringRadius} center={mapCenter} />
      
      {/* 2. The Game Grid */}
      <GameGridRows game={game} activity={activity} onCommand={onCommand} />
      
      {/* 3. Ghost Trail Effect (Visual Only) */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}
