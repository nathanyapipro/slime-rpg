import React, { useEffect, useState } from "react";
import { Box } from "@mui/system";
import { WebGlEngine } from "./engine/WebGlEngine";

type Props = {};

const Engine: React.FC<Props> = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<WebGlEngine | undefined>();

  useEffect(() => {
    if (ref.current === null) {
      return;
    }

    const webGlEngine = new WebGlEngine({ rootEl: ref.current });
    webGlEngine.start();
    setEngine(webGlEngine);

    return () => {
      engine?.stop();
    };
  }, [ref]);

  return (
    <Box
      ref={ref}
      sx={{
        display: "flex",
        flex: "1 1 0",
      }}
    />
  );
};

export default Engine;
