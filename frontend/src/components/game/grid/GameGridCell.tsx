import * as React from "react";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";
import { If } from "../../util/If";
import "./GameGridCell.scss";

export function GameGridCell({
  x,
  y,
  size,
  game,
  active,
  onCommand,
}: {
  x: number;
  y: number;
  size: number;
  game: any;
  active: boolean;
  onCommand?: (x: number, y: number, type: string) => void;
}) {
  const engine = useMagicBlockEngine();
  const cell = game.cells[y * game.sizeX + x];
  const isYou = engine.getSessionPayer();

  let rootClassNames = ["GameGridCell", "relative", "transition-all", "duration-200"];

  // 1. Identify Occupants (Players/Ghosts)
  if (cell.owner?.Player !== undefined) {
    const playerIndex = cell.owner.Player;
    rootClassNames.push(`Occupied-${playerIndex}`);
    
    // Check if the player on this cell is YOU or the GHOST
    const isOwnerYou = game.players[playerIndex].authority.equals(isYou);
    rootClassNames.push(isOwnerYou ? "IsUser" : "IsGhost");
  }

  if (active) rootClassNames.push("Active");

  // 2. Event Handlers
  const handleEvent = (type: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onCommand) onCommand(x, y, type);
  };

  return (
    <div
      className={rootClassNames.join(" ")}
      onMouseDown={handleEvent("start")}
      onMouseEnter={(e) => e.buttons === 1 && handleEvent("move")(e)} // Smooth drag-to-move
      onMouseUp={handleEvent("end")}
      style={{ width: size, height: size }}
    >
      {/* 3. Render Loot (Power-Ups from Rust occupant field) */}
      {cell.occupant !== null && (
        <div className="Loot absolute inset-0 flex items-center justify-center animate-bounce">
          {cell.occupant === 0 ? "❤️" : "⚡"}
        </div>
      )}

      {/* 4. Render Character Avatar */}
      {cell.owner?.Player !== undefined && (
        <div className="Avatar absolute inset-0 flex items-center justify-center text-2xl">
           {rootClassNames.includes("IsUser") ? "👤" : "👻"}
        </div>
      )}

      {/* 5. Health/Strength Overlay */}
      <If
        value={cell.strength > 0}
        renderer={() => (
          <div className="Strength-Badge absolute bottom-0 right-0 px-1 bg-black/60 text-[10px] font-mono">
            {cell.strength}
          </div>
        )}
      />
    </div>
  );
}
