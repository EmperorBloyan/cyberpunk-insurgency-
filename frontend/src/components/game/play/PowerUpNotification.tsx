import * as React from "react";
import "./PowerUpNotification.scss";

interface PowerUpProps {
  text: string;
  onComplete?: () => void; // Callback to tell the parent to stop showing this
}

export function PowerUpNotification({ text, onComplete }: PowerUpProps) {
  React.useEffect(() => {
    // 1. Set a timer to clear the notification after 2 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => clearTimeout(timer);
  }, [text, onComplete]);

  if (!text) return null;

  return (
    <div className="PowerUpNotification">
      <div className={`Toast ${text.includes("ATTACK") ? "Attack" : ""}`}>
        <div className="flex flex-col items-center">
          <span className="text-[10px] opacity-70 tracking-widest">SYSTEM UPGRADE</span>
          <h1 className="text-4xl font-black tracking-tighter">
            {text}
          </h1>
          {/* Decorative Shimmer Line */}
          <div className="h-0.5 bg-current w-full mt-1 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
