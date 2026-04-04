import * as React from "react";

import { useNavigate } from "react-router-dom";

import { useMagicBlockEngine } from "../../engine/MagicBlockEngineProvider";

import { ForEach } from "../util/ForEach";
import { Text } from "../util/Text";
import { Button } from "../util/Button";

import { gameList } from "../../states/gameList";

export function PageHome() {
  const navigate = useNavigate();
  const engine = useMagicBlockEngine();

  const [entries, setEntries] = React.useState(undefined);
  React.useEffect(() => {
    const timeout = setTimeout(async () => {
      setEntries(await gameList(engine, 10));
    }, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, [engine]);

  return (
    <div className="Container Centered">
      <Text value="Blitz Brawler" isTitle={true} />
      
      <Button
        text="+ Create New Blitz Brawler Match +"
        onClick={() => {
          navigate("/create");
        }}
      />
      
      <ForEach<any>
        values={entries}
        before={() => <Text value="Latest Blitz Brawler Matches" isTitle={true} />}
        renderer={(entry) => {
          const status = entry.game.status;
          const code = entry.entityPda.toBase58();
          const num = entry.entityId.toString().padStart(8, "0");

          let indicator = "⚔️";
          if (status.generate) indicator = "🥚";
          if (status.lobby) indicator = "⏳";
          if (status.playing) indicator = "🔥";
          if (status.finished) indicator = "🏆";

          return (
            <Button
              key={code}
              text={indicator + " Match " + num + " • " + code.slice(0, 8) + "..."}
              isSoft={true}
              onClick={() => {
                navigate("/play/" + code);
              }}
            />
          );
        }}
      />
    </div>
  );
}