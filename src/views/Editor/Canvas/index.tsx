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
  } = useMainStore();
  const { currentSlide, viewportRatio, viewportSize } = useSlidesStore();
  const { spaceKeyState } = useKeyboardStore();
  const { createElement, createCustomShapeElement } = useCreateElement();

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

  // Context Menu
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

  const viewportStyle = {
    ...viewportStyles,
    transform: `scale(${canvasScale})`,
  };

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
      (e.target as HTMLElement).closest(".canvas-viewport")
    ) {
      // If we have active elements, deselect them
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
      <div className="canvas-viewport" ref={viewportRef} style={viewportStyle}>
        <ViewportBackground />

        <div className="viewport-content">
          {currentSlide?.elements.map((element, index) => (
            <React.Fragment key={element.id}>
              <EditableElement
                elementInfo={element}
                elementIndex={index + 1}
                isMultiSelect={activeElementIdList.length > 1}
                selectElement={handleSelectElement}
              />
              <Operate
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
            </React.Fragment>
          ))}
        </div>

        {alignmentLines.map((line, index) => (
          <AlignmentLine
            key={index}
            type={line.type}
            axis={line.axis}
            length={line.length}
          />
        ))}

        {activeElementIdList.length > 1 && (
          <MultiSelectOperate
            elementList={currentSlide?.elements || []}
            scaleMultiElement={handleScaleMultiElement}
          />
        )}

        {mouseSelectionVisible && selectionState && (
          <MouseSelection
            top={selectionState.top}
            left={selectionState.left}
            width={selectionState.width}
            height={selectionState.height}
            quadrant={selectionState.quadrant}
          />
        )}

        {creatingElement && (
          <ElementCreateSelection
            onCreated={insertElementFromCreateSelection}
          />
        )}

        {creatingCustomShape && (
          <ShapeCreateCanvas
            onClose={() =>
              useMainStore.getState().setCreatingCustomShapeState(false)
            }
            onCreated={createCustomShapeElement}
          />
        )}

        <GridLines />
      </div>
    </div>
  );
};

export default Canvas;
