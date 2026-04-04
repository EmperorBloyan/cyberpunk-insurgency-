import * as React from "react";
import { GameGridCell } from "./GameGridCell";
import "./GameGridRows.scss";

export function GameGridRows({
  game,
  activity,
  onCommand,
}: {
  game: any;
  activity?: { x: number; y: number };
  onCommand?: (x: number, y: number, type: string) => void;
}) {
  const [rendering, setRendering] = React.useState(() => computeRendering(game));

  // Handle Resize for Responsive Grid
  React.useEffect(() => {
    const onResize = () => setRendering(computeRendering(game));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [game]);

  const rows = [];

  // 1. HORIZONTAL RENDER (Desktop/Laptop)
  if (rendering.horizontal) {
    for (let y = 0; y < game.sizeY; y++) {
      const cells = [];
      for (let x = 0; x < game.sizeX; x++) {
        // Find the specific cell data from the flattened array in lib.rs
        const cellData = game.cells[y * game.sizeX + x];
        
        cells.push(
          <GameGridCell
            key={`${x}-${y}`}
            x={x}
            y={y}
            size={rendering.size}
            game={game}
            cellData={cellData} // Pass the raw Rust struct data (includes .occupant)
            active={activity ? activity.x === x && activity.y === y : false}
            onCommand={onCommand}
          />
        );
      }
      rows.push(
        <div key={`row-${y}`} className="Row flex justify-center">
          {cells}
        </div>
      );
    }
  } 
  // 2. VERTICAL RENDER (Mobile Optimization)
  else {
    for (let x = 0; x < game.sizeX; x++) {
      const cells = [];
      for (let y = game.sizeY - 1; y >= 0; y--) {
        const cellData = game.cells[y * game.sizeX + x];
        
        cells.push(
          <GameGridCell
            key={`${x}-${y}`}
            x={x}
            y={y}
            size={rendering.size}
            game={game}
            cellData={cellData}
            active={activity ? activity.x === x && activity.y === y : false}
            onCommand={onCommand}
          />
        );
      }
      rows.push(
        <div key={`col-${x}`} className="Row flex flex-col items-center">
          {cells}
        </div>
      );
    }
  }

  return (
    <div className="GameGridRows w-full h-full flex flex-col items-center justify-center p-4">
      <div className="Rows perspective-1000">
        {rows}
      </div>
    </div>
  );
}

// Utility to calculate best fit for the screen
function computeRendering(game: any) {
  const horizontalSize = computeCellSize(game.sizeX, game.sizeY);
  const verticalSize = computeCellSize(game.sizeY, game.sizeX);
  
  if (verticalSize > horizontalSize) {
    return { horizontal: false, size: verticalSize };
  }
  return { horizontal: true, size: horizontalSize };
}

function computeCellSize(gameSizeX: number, gameSizeY: number) {
  const spaceX = window.innerWidth * 0.9; // 90% of width
  const spaceY = window.innerHeight / 2;

  const sizeForX = Math.floor(spaceX / gameSizeX);
  const sizeForY = Math.floor(spaceY / gameSizeY);

  // Cap the cell size between 32px and 64px for a consistent brawler feel
  return Math.max(32, Math.min(Math.min(sizeForX, sizeForY), 64));
}
