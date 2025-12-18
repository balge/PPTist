import React, { useRef, useMemo, useState } from "react";
import { useMainStore, useSlidesStore, useKeyboardStore } from "@/store";
import type { PPTElement } from "@/types/slides";
import type {
  AlignmentLineProps,
  OperateResizeHandlers,
  OperateLineHandlers,
} from "@/types/edit";
import useCreateElement from "@/hooks/useCreateElement";

import useScaleElement from "./hooks/useScaleElement";
import useSelectElement from "./hooks/useSelectElement";
import useRotateElement from "./hooks/useRotateElement";
import useDragLineElement from "./hooks/useDragLineElement";
import useDragElement from "./hooks/useDragElement";
import useMoveShapeKeypoint from "./hooks/useMoveShapeKeypoint";
import useViewportSize from "./hooks/useViewportSize";
import useMouseSelection from "./hooks/useMouseSelection";
import useDrop from "./hooks/useDrop";
import useInsertFromCreateSelection from "./hooks/useInsertFromCreateSelection";
import useContextMenu from "@/hooks/useContextMenu";

import ViewportBackground from "./ViewportBackground";
import GridLines from "./GridLines";
import EditableElement from "./EditableElement";
import Operate from "./Operate";
import MouseSelection from "./MouseSelection";
import ElementCreateSelection from "./ElementCreateSelection";
import ShapeCreateCanvas from "./ShapeCreateCanvas";
import MultiSelectOperate from "./Operate/MultiSelectOperate";
import AlignmentLine from "./AlignmentLine";
import "./index.scss";

const Canvas: React.FC = () => {
  const {
    canvasScale,
    activeElementIdList,
    handleElementId,
    activeGroupElementId,
    creatingElement,
    creatingCustomShape,
    gridLinesState,
  } = useMainStore();
  const { currentSlide } = useSlidesStore();
  const { spaceKeyState } = useKeyboardStore();
  const { createCustomShapeElement } = useCreateElement();

  const containerRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const elementList = currentSlide?.elements || [];

  const setElementList = (
    newListOrUpdater: PPTElement[] | ((prev: PPTElement[]) => PPTElement[])
  ) => {
    const current = useSlidesStore.getState().currentSlide;
    if (!current) return;

    let newList: PPTElement[];
    if (typeof newListOrUpdater === "function") {
      newList = newListOrUpdater(current.elements);
    } else {
      newList = newListOrUpdater;
    }
    useSlidesStore.getState().updateSlide({ elements: newList });
  };

  const [alignmentLines, setAlignmentLines] = useState<AlignmentLineProps[]>(
    []
  );

  const { dragElement } = useDragElement(
    elementList,
    setElementList,
    setAlignmentLines
  );
  const { selectElement } = useSelectElement(elementList, dragElement);
  const { scaleElement, scaleMultiElement } = useScaleElement(
    elementList,
    setElementList,
    setAlignmentLines
  );
  const { rotateElement } = useRotateElement(
    elementList,
    setElementList,
    viewportRef
  );
  const { dragLineElement } = useDragLineElement(elementList, setElementList);
  const { moveShapeKeypoint } = useMoveShapeKeypoint(
    elementList,
    setElementList
  );
  const { viewportStyles, dragViewport } = useViewportSize(containerRef);
  const { selectionState, mouseSelectionVisible, updateMouseSelection } =
    useMouseSelection(elementList, containerRef);

  useDrop(containerRef);

  const { insertElementFromCreateSelection } =
    useInsertFromCreateSelection(viewportRef);

  const menus = useMemo(
    () => [
      {
        text: "粘贴",
        subText: "Ctrl + V",
        handler: () => {
          console.log("Paste not implemented yet");
        },
      },
      {
        text: "全选",
        subText: "Ctrl + A",
        handler: () => {
          const ids = elementList.map((el) => el.id);
          useMainStore.getState().setActiveElementIdList(ids);
        },
      },
      { divider: true },
      {
        text: "网格线",
        handler: () => {
          const { gridLinesState, setGridLinesState } = useMainStore.getState();
          setGridLinesState(!gridLinesState);
        },
      },
      {
        text: "重置画布",
        handler: () => {
          useMainStore.getState().setCanvasPercentage(90);
        },
      },
    ],
    [elementList]
  );

  useContextMenu(containerRef, menus);

  const handleSelectElement = (
    e: React.MouseEvent | React.TouchEvent,
    element: PPTElement,
    canMove = true
  ) => {
    e.stopPropagation();
    selectElement(e.nativeEvent, element, canMove);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // If clicking on canvas background (not on element)
    if (
      e.target === e.currentTarget ||
      (e.target as HTMLElement).closest(".viewport-background")
    ) {
      if (activeElementIdList.length > 0) {
        if (!creatingElement) {
          updateMouseSelection(e);
        }
      } else {
        if (!creatingElement) {
          updateMouseSelection(e);
        }
      }
    }
  };

  const handleContainerMouseDown = (e: React.MouseEvent) => {
    if (spaceKeyState) {
      dragViewport(e.nativeEvent);
      return;
    }
    handleMouseDown(e);
  };

  // Wrappers for Operate handlers
  const handleRotateElement = (e: React.MouseEvent, element: any) => {
    rotateElement(e.nativeEvent, element);
  };
  const handleScaleElement = (
    e: React.MouseEvent,
    element: any,
    command: OperateResizeHandlers
  ) => {
    scaleElement(e.nativeEvent, element, command);
  };
  const handleDragLineElement = (
    e: React.MouseEvent,
    element: any,
    command: OperateLineHandlers
  ) => {
    dragLineElement(e.nativeEvent, element, command);
  };
  const handleMoveShapeKeypoint = (
    e: React.MouseEvent,
    element: any,
    index: number
  ) => {
    moveShapeKeypoint(e.nativeEvent, element, index);
  };
  const handleScaleMultiElement = (
    e: React.MouseEvent,
    range: any,
    command: OperateResizeHandlers
  ) => {
    scaleMultiElement(e.nativeEvent, range, command);
  };

  return (
    <div
      className="canvas-container"
      ref={containerRef}
      onMouseDown={handleContainerMouseDown}
      onDragOver={(e) => e.preventDefault()}
    >
      {creatingElement && (
        <ElementCreateSelection onCreated={insertElementFromCreateSelection} />
      )}

      {creatingCustomShape && (
        <ShapeCreateCanvas
          onClose={() =>
            useMainStore.getState().setCreatingCustomShapeState(false)
          }
          onCreated={createCustomShapeElement}
        />
      )}

      <div
        className="viewport-wrapper"
        style={{
          width: viewportStyles.width * canvasScale,
          height: viewportStyles.height * canvasScale,
          left: viewportStyles.left,
          top: viewportStyles.top,
          position: "absolute",
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.01), 0 0 12px 0 rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          className="operates"
          style={{
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          <ViewportBackground />

          {alignmentLines.map((line, index) => (
            <AlignmentLine
              key={index}
              type={line.type}
              axis={line.axis}
              length={line.length}
              canvasScale={canvasScale}
            />
          ))}

          {activeElementIdList.length > 1 && (
            <MultiSelectOperate
              elementList={currentSlide?.elements || []}
              scaleMultiElement={handleScaleMultiElement}
            />
          )}

          {currentSlide?.elements.map((element) => (
            <Operate
              key={element.id}
              elementInfo={element}
              isSelected={activeElementIdList.includes(element.id)}
              isActive={handleElementId === element.id}
              isActiveGroupElement={activeGroupElementId === element.id}
              isMultiSelect={activeElementIdList.length > 1}
              rotateElement={handleRotateElement}
              scaleElement={handleScaleElement}
              dragLineElement={handleDragLineElement}
              moveShapeKeypoint={handleMoveShapeKeypoint}
            />
          ))}
        </div>

        <div
          className="viewport"
          ref={viewportRef}
          style={{
            transform: `scale(${canvasScale})`,
            transformOrigin: "0 0",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        >
          {mouseSelectionVisible && selectionState && (
            <MouseSelection
              top={selectionState.top}
              left={selectionState.left}
              width={selectionState.width}
              height={selectionState.height}
              quadrant={selectionState.quadrant}
            />
          )}

          {currentSlide?.elements.map((element, index) => (
            <EditableElement
              key={element.id}
              elementInfo={element}
              elementIndex={index + 1}
              isMultiSelect={activeElementIdList.length > 1}
              selectElement={handleSelectElement}
            />
          ))}
        </div>
      </div>

      {gridLinesState && <GridLines />}
    </div>
  );
};

export default Canvas;
