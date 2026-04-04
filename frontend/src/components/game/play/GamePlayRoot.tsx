import * as React from "react";

import { PublicKey } from "@solana/web3.js";

import { MagicBlockEngine } from "../../../engine/MagicBlockEngine";
import { useMagicBlockEngine } from "../../../engine/MagicBlockEngineProvider";

import { Text } from "../../util/Text";
import { ForEach } from "../../util/ForEach";

import { GamePlayer } from "../GamePlayer";
import { GamePlayMap } from "./GamePlayMap";

import { gameSystemTick } from "../../../states/gameSystemTick";
import { gameSystemFinish } from "../../../states/gameSystemFinish";
import { gameFetch } from "../../../states/gameFetch";

export function GamePlayRoot({
  entityPda,
  gamePda,
  game,
}: {
  entityPda: PublicKey;
  gamePda: PublicKey;
  game: any;
}) {
  const engine = useMagicBlockEngine();

  // When the page is loaded, run some logic
  React.useEffect(() => {
    return scheduleTick(engine, entityPda, gamePda);
  }, [engine, entityPda, gamePda]);
  React.useEffect(() => {
    return scheduleFinish(engine, entityPda, gamePda);
  }, [engine, entityPda, gamePda]);

  // Hint on game status with Blitz Brawler flavor
  let status = "⚔️ Shadow Arena Active";
  if (game.status.playing) {
    status = "⚔️ Fighting the Ghost • Survive the Shrinking Poison Ring!";
  }
  if (game.status.finished) {
    status = "🏆 Arena Closed • New Ghost Recorded";
  }

  status += " (tick slot: " + game.tickNextSlot.toString() + ")";

  return (
    <>
      <Text value="Blitz Brawler: Shadow Arena" isTitle={true} />
      <Text value="You are fighting the Ghost of the previous champion" />
      <Text value="Every move is onchain • Beat the Shadow to claim the title" />

      <div
        className="Horizontal"
        style={{ border: "2px solid rgba(255, 255, 255, 0.3)", margin: "15px 0" }}
      >
        <ForEach
          values={game.players}
          renderer={(player, index) => (
            <GamePlayer key={index} playerIndex={index} player={player} />
          )}
        />
      </div>

      <Text value="Drag your units • Dodge the shrinking ring • Grab VRF power-ups" />
      <GamePlayMap entityPda={entityPda} game={game} />
      
      <Text value={status} />
    </>
  );
}

function scheduleTick(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  // Run ticks as fast as possible
  console.log("start tick crank - Blitz Brawler");
  let running = true;
  (async () => {
    const game = await gameFetch(engine, gamePda);
    if (!game) {
      return;
    }
    if (!game.status.playing) {
      return;
    }
    while (running) {
      // Wait a bit to avoid clogging the main thread
      await new Promise((resolve) => setTimeout(resolve, 100));
      // Run the tick system and try again as soon as it succeeds
      try {
        await gameSystemTick(engine, entityPda);
      } catch (error) {
        console.error("failed to tick the game", error);
      }
    }
  })();
  // on cleanup
  return () => {
    console.log("stop tick crank");
    running = false;
  };
}

function scheduleFinish(
  engine: MagicBlockEngine,
  entityPda: PublicKey,
  gamePda: PublicKey
) {
  // Every once in a while, run the finish check
  console.log("start finish checks - Blitz Brawler");
  const interval = setInterval(async () => {
    try {
      const game = await gameFetch(engine, gamePda);
      if (!game) {
        return;
      }
      if (!game.status.playing) {
        return;
      }
      await gameSystemFinish(engine, entityPda, 0);
      await gameSystemFinish(engine, entityPda, 1);
    } catch (error) {
      console.error("failed to finish the game", error);
    }
  }, 5000);
  // On cleanup
  return () => {
    console.log("stop finish checks");
    clearInterval(interval);
  };
}