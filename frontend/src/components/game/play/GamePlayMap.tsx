import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { MagicBlockQueue } from "../../../engine/MagicBlockQueue";
import { GameGridRows } from "../grid/GameGridRows";
import { gameSystemCommand } from "../../../states/gameSystemCommand";
import { PoisonRingOverlay } from "./PoisonRingOverlay"; 
import "./GamePlayMap.scss";

export function GamePlayMap({ entityPda, game }: { entityPda: PublicKey; game: any }) {
  const engine = useMagicBlockEngine();
  const queue = React.useMemo(() => new MagicBlockQueue(engine), [engine]);
  const [activity, setActivity] = React.useState({ x: -1, y: -1 });
  
  // 1. JUICE STATE: Shake & Sound
  const [isShaking, setIsShaking] = React.useState(false);
  const lastHealth = React.useRef(game.players[0].health);
  const glitchSfx = React.useMemo(() => new Audio("/sfx/glitch.mp3"), []);

  // 2. RING CALCULATIONS (Dynamic based on lib.rs size)
  const mapCenter = { x: Math.floor(game.sizeX / 2), y: Math.floor(game.sizeY / 2) };
  // Shrink radius by 1 every 10 ticks
  const currentRadius = Math.max(1, 8 - Math.floor(game.tickNextSlot / 10));

  // 3. DAMAGE WATCHER (Trigger Shake)
  React.useEffect(() => {
    if (game.players[0].health < lastHealth.current) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 200);
      // Play a quick glitch sound when hit
      glitchSfx.volume = 0.3;
      glitchSfx.play().catch(() => {});
    }
    lastHealth.current = game.players[0].health;
  }, [game.players[0].health, glitchSfx]);

  const onCommand = (targetX: number, targetY: number, type: string) => {
    // Distance check: Prevent moving outside the active Arena
    const dist = Math.sqrt(Math.pow(targetX - mapCenter.x, 2) + Math.pow(targetY - mapCenter.y, 2));
    
    if (type === "start") {
      if (dist > currentRadius) return; // Ignore clicks in the poison zone
      setActivity({ x: targetX, y: targetY });
    }
    
    if (type === "move" && activity.x !== -1) {
      if (dist <= currentRadius) {
        gameSystemCommand(queue, entityPda, 0, activity.x, activity.y, targetX, targetY, 100);
        setActivity({ x: targetX, y: targetY });
      }
    }

    if (type === "end") setActivity({ x: -1, y: -1 });
  };

  return (
    <div className={`GamePlayMap relative ${isShaking ? "shake-trigger" : ""} cursor-crosshair overflow-hidden`}>
      {/* 1. ARENA DATA OVERLAY */}
      <div className="absolute top-4 left-4 z-50 font-mono text-[10px] text-green-400 opacity-60">
        ARENA_LATENCY: 100ms <br />
        SHADOW_ID: {game.players[1].authority.toString().slice(0, 8)}...
      </div>

      {/* 2. THE DYNAMIC RING */}
      <PoisonRingOverlay game={game} radius={currentRadius} center={mapCenter} />
      
      {/* 3. THE GRID */}
      <div className="ArenaContainer">
        <GameGridRows game={game} activity={activity} onCommand={onCommand} />
      </div>

      {/* 4. CRT SCANLINE EFFECT (Visual Juice) */}
      <div className="absolute inset-0 pointer-events-none z-40 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
    </div>
  );
}
