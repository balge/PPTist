import React from "react";
import useGlobalHotkey from "@/hooks/useGlobalHotkey";
import { useMainStore } from "@/store";
import Canvas from "./Canvas";
import Thumbnails from "./Thumbnails";

const Editor: React.FC = () => {
  // Enable global hotkeys
  useGlobalHotkey();

  const { canvasScale } = useMainStore();

  return (
    <div
      className="pptist-editor"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          flex: 1,
          position: "relative",
          overflow: "hidden",
          display: "flex",
        }}
      >
        <Thumbnails />
        <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
          <Canvas />
        </div>
      </div>
    </div>
  );
};

export default Editor;
