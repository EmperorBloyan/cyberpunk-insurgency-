import * as React from "react";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";

import { Text } from "../util/Text";

import "./GamePlayer.scss";

export function GamePlayer({
  playerIndex,
  player,
}: {
  playerIndex: number;
  player: any;
}) {
  const engine = useMagicBlockEngine();

  const isYou = player.authority.equals(engine.getSessionPayer());

  let name = "";
  let title = "";
  let subtitle = "";
  let emoji = "⚔️";

  if (playerIndex === 0) {
    // Player 0 is the human challenger
    name = isYou ? "YOU" : "CHALLENGER";
    title = isYou ? "The Living Brawler" : "The Living Challenger";
    subtitle = isYou 
      ? "You are fighting to become the new Ghost" 
      : "Fighting for glory";
    emoji = "🟢";
  } else {
    // Player 1 is the Ghost (Shadow Replay)
    name = "GHOST";
    title = "Shadow of the Previous Champion";
    subtitle = "Recorded onchain • Every move was real";
    emoji = "👻";
  }

  let status = "";
  if (player.ready) {
    status = isYou ? "● You are ready" : "● Ready";
  } else {
    status = "⏳ Waiting to join the arena...";
  }

  // Health / survival flavor for Blitz Brawler
  const health = player.health !== undefined ? Math.max(0, player.health) : 100;
  const healthBar = "█".repeat(Math.floor(health / 10)) + "░".repeat(10 - Math.floor(health / 10));

  return (
    <div
      className={[
        "GamePlayer",
        "Horizontal",
        "Centered",
        "P" + playerIndex,
      ].join(" ")}
      style={{
        border: isYou ? "2px solid #00ff9d" : "2px solid #ff00aa",
        backgroundColor: isYou ? "rgba(0, 255, 157, 0.1)" : "rgba(255, 0, 170, 0.1)",
        padding: "12px",
        borderRadius: "8px",
        margin: "8px",
      }}
    >
      <div style={{ fontSize: "2.2rem", marginRight: "16px" }}>{emoji}</div>

      <div style={{ flex: 1, textAlign: "left" }}>
        <Text value={name} isTitle={true} style={{ fontSize: "1.4rem", marginBottom: "4px" }} />
        <Text value={title} isFading={true} style={{ fontSize: "1rem", opacity: 0.9 }} />
        
        <div style={{ marginTop: "8px", fontSize: "0.95rem" }}>
          {subtitle}
        </div>

        {player.ready && (
          <div style={{ marginTop: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span>❤️ Health:</span>
              <span style={{ fontFamily: "monospace", color: health > 50 ? "#00ff9d" : "#ff4444" }}>
                {healthBar} {health}%
              </span>
            </div>
          </div>
        )}

        <Text value={status} isFading={true} style={{ marginTop: "8px", fontSize: "0.9rem" }} />
      </div>
    </div>
  );
}