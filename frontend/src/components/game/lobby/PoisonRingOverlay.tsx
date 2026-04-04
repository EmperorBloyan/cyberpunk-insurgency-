import * as React from "react";

interface PoisonRingProps {
  radius: number; // The current safe radius from the chain
  center: { x: number; y: number };
}

export function PoisonRingOverlay({ radius, center }: PoisonRingProps) {
  // Convert grid radius to a percentage for the CSS gradient
  // Assuming a 10x10 grid, a radius of 5 is 50%
  const radiusPercent = (radius / 10) * 100;

  return (
    <div 
      className="absolute inset-0 z-40 pointer-events-none transition-all duration-1000 ease-linear"
      style={{
        background: `radial-gradient(circle at center, transparent ${radiusPercent}%, rgba(220, 38, 38, 0.4) ${radiusPercent + 5}%, rgba(127, 29, 29, 0.8) 100%)`,
        boxShadow: `inset 0 0 ${20 - radius}px rgba(255, 0, 0, 0.5)`,
      }}
    >
      {/* Animated Pulse Border for the Ring Edge */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.7)]"
        style={{
          width: `${radiusPercent * 2}%`,
          height: `${radiusPercent * 2}%`,
        }}
      />
      
      {/* Ghostly Static/Fog Effect */}
      <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] mix-blend-overlay" />
    </div>
  );
}
