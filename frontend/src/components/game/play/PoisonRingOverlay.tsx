import * as React from "react";

export function PoisonRingOverlay({ radius, center }: { radius: number; center: { x: number; y: number } }) {
  // Convert grid coordinates to percentage for the CSS gradient
  // Assuming a 10x10 grid (0-9)
  const centerX = (center.x / 9) * 100;
  const centerY = (center.y / 9) * 100;
  const ringSize = (radius / 10) * 100;

  return (
    <div 
      className="absolute inset-0 pointer-events-none z-20 transition-all duration-1000 ease-in-out"
      style={{
        background: `radial-gradient(circle at ${centerX}% ${centerY}%, transparent ${ringSize}%, rgba(220, 38, 38, 0.4) ${ringSize + 5}%, rgba(0, 0, 0, 0.8) ${ringSize + 15}%)`,
        border: '2px solid rgba(220, 38, 38, 0.2)'
      }}
    >
      {/* Visual pulsing effect for the "Poison" */}
      <div className="absolute inset-0 animate-pulse bg-red-600/10 mix-blend-overlay" />
    </div>
  );
}
