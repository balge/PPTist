import { customAlphabet } from "nanoid";
import { create } from "zustand";
import type {
  CreatingElement,
  ShapeFormatPainter,
  TextFormatPainter,
} from "@/types/edit";
import {
  type TextAttrs,
  defaultRichTextAttrs,
} from "@/utils/prosemirror/utils";

export interface MainState {
  activeElementIdList: string[];
  handleElementId: string;
  activeGroupElementId: string;
  hiddenElementIdList: string[];
  canvasPercentage: number;
  canvasScale: number;
  canvasDragged: boolean;
  thumbnailsFocus: boolean;
  editorAreaFocus: boolean;
  disableHotkeys: boolean;
  gridLineSize: number;
  gridLinesState: boolean; // Added
  showRuler: boolean;
  creatingElement: CreatingElement | null;
  creatingCustomShape: boolean;
  clipingImageElementId: string;
  isScaling: boolean;
  richTextAttrs: TextAttrs;
  selectedTableCells: string[];
  selectedSlidesIndex: number[];
  databaseId: string;
  textFormatPainter: TextFormatPainter | null;
  shapeFormatPainter: ShapeFormatPainter | null;

  // Actions
  setActiveElementIdList: (activeElementIdList: string[]) => void;
  setHandleElementId: (handleElementId: string) => void;
  setActiveGroupElementId: (activeGroupElementId: string) => void;
  setHiddenElementIdList: (hiddenElementIdList: string[]) => void;
  setCanvasPercentage: (percentage: number) => void;
  setCanvasScale: (scale: number) => void;
  setCanvasDragged: (isDragged: boolean) => void;
  setThumbnailsFocus: (isFocus: boolean) => void;
  setEditorareaFocus: (isFocus: boolean) => void;
  setDisableHotkeysState: (disable: boolean) => void;
  setGridLineSize: (size: number) => void;
  setGridLinesState: (state: boolean) => void; // Added
  setRulerState: (show: boolean) => void;
  setCreatingElement: (element: CreatingElement | null) => void;
  setCreatingCustomShapeState: (state: boolean) => void;
  setClipingImageElementId: (elId: string) => void;
  setRichtextAttrs: (attrs: TextAttrs) => void;
  setSelectedTableCells: (cells: string[]) => void;
  setScalingState: (isScaling: boolean) => void;
  updateSelectedSlidesIndex: (selectedSlidesIndex: number[]) => void;
  setTextFormatPainter: (textFormatPainter: TextFormatPainter | null) => void;
  setShapeFormatPainter: (shapeFormatPainter: ShapeFormatPainter | null) => void;
}

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
);
export const databaseId = nanoid(10);

export const useMainStore = create<MainState>((set) => ({
  activeElementIdList: [],
  handleElementId: "",
  activeGroupElementId: "",
  hiddenElementIdList: [],
  canvasPercentage: 90,
  canvasScale: 1,
  canvasDragged: false,
  thumbnailsFocus: false,
  editorAreaFocus: false,
  disableHotkeys: false,
  gridLineSize: 0,
  gridLinesState: false,
  showRuler: false,
  creatingElement: null,
  creatingCustomShape: false,
  clipingImageElementId: "",
  richTextAttrs: defaultRichTextAttrs,
  selectedTableCells: [],
  isScaling: false,
  selectedSlidesIndex: [],
  databaseId,
  textFormatPainter: null,
  shapeFormatPainter: null,

  setActiveElementIdList: (activeElementIdList: string[]) =>
    set(() => {
      const handleElementId = activeElementIdList.length === 1 ? activeElementIdList[0] : "";
      return { activeElementIdList, handleElementId };
    }),

  setHandleElementId: (handleElementId: string) => set({ handleElementId }),

  setActiveGroupElementId: (activeGroupElementId: string) => set({ activeGroupElementId }),

  setHiddenElementIdList: (hiddenElementIdList: string[]) => set({ hiddenElementIdList }),

  setCanvasPercentage: (percentage: number) => set({ canvasPercentage: percentage }),

  setCanvasScale: (scale: number) => set({ canvasScale: scale }),

  setCanvasDragged: (isDragged: boolean) => set({ canvasDragged: isDragged }),

  setThumbnailsFocus: (isFocus: boolean) => set({ thumbnailsFocus: isFocus }),

  setEditorareaFocus: (isFocus: boolean) => set({ editorAreaFocus: isFocus }),

  setDisableHotkeysState: (disable: boolean) => set({ disableHotkeys: disable }),

  setGridLineSize: (size: number) => set({ gridLineSize: size }),

  setGridLinesState: (state: boolean) => set({ gridLinesState: state }),

  setRulerState: (show: boolean) => set({ showRuler: show }),

  setCreatingElement: (element: CreatingElement | null) => set({ creatingElement: element }),

  setCreatingCustomShapeState: (state: boolean) => set({ creatingCustomShape: state }),

  setClipingImageElementId: (elId: string) => set({ clipingImageElementId: elId }),

  setRichtextAttrs: (attrs: TextAttrs) => set({ richTextAttrs: attrs }),

  setSelectedTableCells: (cells: string[]) => set({ selectedTableCells: cells }),

  setScalingState: (isScaling: boolean) => set({ isScaling: isScaling }),

  updateSelectedSlidesIndex: (selectedSlidesIndex: number[]) => set({ selectedSlidesIndex }),

  setTextFormatPainter: (textFormatPainter: TextFormatPainter | null) => set({ textFormatPainter }),

  setShapeFormatPainter: (shapeFormatPainter: ShapeFormatPainter | null) => set({ shapeFormatPainter }),
}));
