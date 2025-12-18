import React from "react";
import useGlobalHotkey from "@/hooks/useGlobalHotkey";
import { useMainStore } from "@/store";
import Canvas from "./Canvas";
import Thumbnails from "./Thumbnails";
import "./index.scss";

const Editor: React.FC = () => {
  // Enable global hotkeys
  useGlobalHotkey();

  return (
    <div className="pptist-editor">
      <div className="layout-content">
        <div className="layout-content-left">
          <Thumbnails />
        </div>
        <div className="layout-content-center">
          <Canvas />
        </div>
      </div>
    </div>
  );
};

export default Editor;
