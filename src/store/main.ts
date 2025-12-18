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
import { useSlidesStore } from "./slides";

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
  gridLinesState: boolean;
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
  setGridLinesState: (state: boolean) => void;
  setRulerState: (show: boolean) => void;
  setCreatingElement: (element: CreatingElement | null) => void;
  setCreatingCustomShapeState: (state: boolean) => void;
  setClipingImageElementId: (elId: string) => void;
  setRichtextAttrs: (attrs: TextAttrs) => void;
  setSelectedTableCells: (cells: string[]) => void;
  setScalingState: (isScaling: boolean) => void;
  updateSelectedSlidesIndex: (selectedSlidesIndex: number[]) => void;
  setTextFormatPainter: (textFormatPainter: TextFormatPainter | null) => void;
  setShapeFormatPainter: (
    shapeFormatPainter: ShapeFormatPainter | null
  ) => void;
}

const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
);
export const databaseId = nanoid(10);

export const useMainStore = create<MainState>((set) => ({
  activeElementIdList: [], // 被选中的元素ID集合，包含 handleElementId
  handleElementId: "", // 正在操作的元素ID
  activeGroupElementId: "", // 组合元素成员中，被选中可独立操作的元素ID
  hiddenElementIdList: [], // 被隐藏的元素ID集合
  canvasPercentage: 90, // 画布可视区域百分比
  canvasScale: 1, // 画布缩放比例（基于宽度{{slidesStore.viewportSize}}像素）
  canvasDragged: false, // 画布被拖拽移动
  thumbnailsFocus: false, // 左侧导航缩略图区域聚焦
  editorAreaFocus: false, //  编辑区域聚焦
  disableHotkeys: false, // 禁用快捷键
  gridLineSize: 0, // 网格线尺寸（0表示不显示网格线）
  gridLinesState: false, // 网格线状态
  showRuler: false, // 显示标尺
  creatingElement: null, // 正在插入的元素信息，需要通过绘制插入的元素（文字、形状、线条）
  creatingCustomShape: false, // 正在绘制任意多边形
  clipingImageElementId: "", // 当前正在裁剪的图片ID
  richTextAttrs: defaultRichTextAttrs, // 富文本状态
  selectedTableCells: [], // 选中的表格单元格
  isScaling: false, // 正在进行元素缩放
  selectedSlidesIndex: [], // 当前被选中的页面索引集合
  databaseId, // 标识当前应用的indexedDB数据库ID
  textFormatPainter: null, // 文字格式刷
  shapeFormatPainter: null, // 形状格式刷

  setActiveElementIdList: (activeElementIdList: string[]) =>
    set(() => {
      const handleElementId =
        activeElementIdList.length === 1 ? activeElementIdList[0] : "";
      return { activeElementIdList, handleElementId };
    }),

  setHandleElementId: (handleElementId: string) => set({ handleElementId }),

  setActiveGroupElementId: (activeGroupElementId: string) =>
    set({ activeGroupElementId }),

  setHiddenElementIdList: (hiddenElementIdList: string[]) =>
    set({ hiddenElementIdList }),

  setCanvasPercentage: (percentage: number) =>
    set({ canvasPercentage: percentage }),

  setCanvasScale: (scale: number) => set({ canvasScale: scale }),

  setCanvasDragged: (isDragged: boolean) => set({ canvasDragged: isDragged }),

  setThumbnailsFocus: (isFocus: boolean) => set({ thumbnailsFocus: isFocus }),

  setEditorareaFocus: (isFocus: boolean) => set({ editorAreaFocus: isFocus }),

  setDisableHotkeysState: (disable: boolean) =>
    set({ disableHotkeys: disable }),

  setGridLineSize: (size: number) => set({ gridLineSize: size }),

  setGridLinesState: (state: boolean) => set({ gridLinesState: state }),

  setRulerState: (show: boolean) => set({ showRuler: show }),

  setCreatingElement: (element: CreatingElement | null) =>
    set({ creatingElement: element }),

  setCreatingCustomShapeState: (state: boolean) =>
    set({ creatingCustomShape: state }),

  setClipingImageElementId: (elId: string) =>
    set({ clipingImageElementId: elId }),

  setRichtextAttrs: (attrs: TextAttrs) => set({ richTextAttrs: attrs }),

  setSelectedTableCells: (cells: string[]) =>
    set({ selectedTableCells: cells }),

  setScalingState: (isScaling: boolean) => set({ isScaling: isScaling }),

  updateSelectedSlidesIndex: (selectedSlidesIndex: number[]) =>
    set({ selectedSlidesIndex }),

  setTextFormatPainter: (textFormatPainter: TextFormatPainter | null) =>
    set({ textFormatPainter }),

  setShapeFormatPainter: (shapeFormatPainter: ShapeFormatPainter | null) =>
    set({ shapeFormatPainter }),
}));

// Helper hooks for getters
export const useActiveElementList = () => {
  const activeElementIdList = useMainStore(
    (state) => state.activeElementIdList
  );
  const currentSlide = useSlidesStore((state) => state.currentSlide);

  if (!currentSlide || !currentSlide.elements) return [];
  return currentSlide.elements.filter((element) =>
    activeElementIdList.includes(element.id)
  );
};

export const useHandleElement = () => {
  const handleElementId = useMainStore((state) => state.handleElementId);
  const currentSlide = useSlidesStore((state) => state.currentSlide);

  if (!currentSlide || !currentSlide.elements) return null;
  return (
    currentSlide.elements.find((element) => handleElementId === element.id) ||
    null
  );
};
