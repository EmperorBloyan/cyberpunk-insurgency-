import { PoisonRingOverlay } from "./PoisonRingOverlay";
import * as React from "react";
import { PublicKey } from "@solana/web3.js";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { MagicBlockQueue } from "../../../engine/MagicBlockQueue";
import { GameGridRows } from "../grid/GameGridRows";
import { gameSystemCommand } from "../../../states/gameSystemCommand";

// --- Blitz Brawler Specialized Components ---
import { PoisonRingOverlay } from "./PoisonRingOverlay"; 
import { PowerUpNotification } from "./PowerUpNotification";

export function GamePlayMap({
  entityPda,
  game,
}: {
  entityPda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();
  const queue = React.useMemo(() => new MagicBlockQueue(engine), [engine]);

  // Track local visual state for the "Ghost" and power-ups
  const [activePowerUp, setActivePowerUp] = React.useState<string | null>(null);
  const [activity, setActivity] = React.useState({ x: -1, y: -1 });

  const command = React.useRef({
    active: false,
    lastX: -1,
    lastY: -1,
    playerIndex: -1,
  });

  // Hyper-realistic calculation: The ring shrinks based on the 'game.tick' or a 'ringRadius' property
  // If your BOLT component doesn't have it yet, we default to a safe value.
  const ringRadius = game.arena?.currentRadius ?? 10; 
  const isGhostActive = game.ghost?.isActive ?? false;

  // --- Logic for Power-Up Flavor Text ---
  React.useEffect(() => {
    if (game.lastPowerUpDrop) {
      const flavors = ["SHADOW HASTE ACQUIRED", "VOID SHIELD ACTIVE", "CRANK OVERLOAD"];
      setActivePowerUp(flavors[Math.floor(Math.random() * flavors.length)]);
      setTimeout(() => setActivePowerUp(null), 3000); // Fade out after 3s
    }
  }, [game.lastPowerUpDrop]);

  const onCommandStart = (targetX: number, targetY: number) => {
    if (!game.status.playing) return;
    
    // Check if player is outside the Poison Ring
    const dist = Math.sqrt(Math.pow(targetX - 5, 2) + Math.pow(targetY - 5, 2));
    if (dist > ringRadius) {
        console.warn("CANNOT MOVE: Outside the safe zone!");
        return;
    }

    const cell = game.cells[targetY * game.sizeX + targetX];
    if (!cell || !cell.owner.player) return;

    const playerIndex = cell.owner.player[0];
    const player = game.players[playerIndex];
    
    if (!player.authority.equals(engine.getSessionPayer())) return;

    command.current = { active: true, lastX: targetX, lastY: targetY, playerIndex };
    setActivity({ x: targetX, y: targetY });
  };

  const onCommandMove = (targetX: number, targetY: number) => {
    if (!command.current.active) return;
    const { lastX, lastY, playerIndex } = command.current;
    if (lastX === targetX && lastY === targetY) return;

    command.current = { ...command.current, lastX: targetX, lastY: targetY };
    setActivity({ x: targetX, y: targetY });

    // Execute Move/Attack via MagicBlock Queue (Ephemeral Rollup)
    onCommandAttack(playerIndex, lastX, lastY, targetX, targetY);
  };

  const onCommandAttack = (pIdx: number, sX: number, sY: number, tX: number, tY: number) => {
    gameSystemCommand(queue, entityPda, pIdx, sX, sY, tX, tY, 100).catch(console.error);
  };

  const onCommand = (targetX: number, targetY: number, type: string) => {
    if (type === "start") onCommandStart(targetX, targetY);
    if (type === "move") onCommandMove(targetX, targetY);
    if (type === "end") {
      command.current.active = false;
      setActivity({ x: -1, y: -1 });
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl border-4 border-slate-800 shadow-2xl bg-black">
      {/* 1. The Dynamic Poison Ring (Visual Overlay) */}
      <PoisonRingOverlay radius={ringRadius} center={{x: 5, y: 5}} />

      {/* 2. HUD: Arena Status */}
      <div className="absolute top-4 left-4 z-50 pointer-events-none">
        <div className="bg-slate-900/80 p-3 rounded-lg border border-red-500/50 backdrop-blur-md">
          <h2 className="text-red-500 font-black tracking-tighter text-xl">SHADOW ARENA</h2>
          <p className="text-slate-400 text-xs uppercase">Safe Zone: {ringRadius.toFixed(1)}m</p>
          {isGhostActive && (
             <div className="mt-2 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 animate-pulse rounded-full" />
                <span className="text-blue-400 text-[10px] font-bold">GHOST REPLAY ACTIVE</span>
             </div>
          )}
        </div>
      </div>

      {/* 3. Power-Up Flavor Text Pop-ups */}
      {activePowerUp && (
        <div className="absolute inset-0 flex items-center justify-center z-[60] pointer-events-none">
          <h1 className="text-5xl font-black italic text-yellow-400 animate-bounce drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]">
            {activePowerUp}
          </h1>
        </div>
      )}

      {/* 4. The Core Game Grid */}
      <div className="transform transition-transform duration-500 hover:scale-[1.01]">
        <GameGridRows 
            game={game} 
            activity={activity} 
            onCommand={onCommand} 
        />
      </div>

      {/* 5. Realistic Map Grit (Scanlines & Noise) */}
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
    </div>
  );
}
