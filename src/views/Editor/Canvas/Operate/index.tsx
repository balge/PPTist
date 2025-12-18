import React, { useMemo } from "react";
import { useMainStore, useSlidesStore } from "@/store";
import { ElementTypes, PPTElement } from "@/types/slides";
import { OperateResizeHandlers, OperateLineHandlers } from "@/types/edit";

import CommonElementOperate from "./CommonElementOperate";
import ImageElementOperate from "./ImageElementOperate";
import TextElementOperate from "./TextElementOperate";
import ShapeElementOperate from "./ShapeElementOperate";
import LineElementOperate from "./LineElementOperate";
import TableElementOperate from "./TableElementOperate";
import LinkHandler from "./LinkHandler";
import "./index.scss";

interface OperateProps {
  elementInfo: PPTElement;
  isSelected: boolean;
  isActive: boolean;
  isActiveGroupElement: boolean;
  isMultiSelect: boolean;
  rotateElement?: (e: React.MouseEvent, element: any) => void;
  scaleElement?: (
    e: React.MouseEvent,
    element: any,
    command: OperateResizeHandlers
  ) => void;
  dragLineElement?: (
    e: React.MouseEvent,
    element: any,
    command: OperateLineHandlers
  ) => void;
  moveShapeKeypoint?: (
    e: React.MouseEvent,
    element: any,
    index: number
  ) => void;
  openLinkDialog?: () => void;
}

/**
 * 组件职责：在画布上渲染选中元素的操作层
 * - 根据元素类型选择对应的操作组件（图片/文本/形状/线条/表格/通用）
 * - 计算并应用缩放后的定位与旋转基点（transformOrigin）
 * - 控制多选状态、分组状态下操作点显隐
 * - 传递旋转、缩放、线条端点拖拽等交互处理函数
 */
const Operate: React.FC<OperateProps> = ({
  elementInfo,
  isSelected,
  isActive,
  isActiveGroupElement,
  isMultiSelect,
  rotateElement = () => {},
  scaleElement = () => {},
  dragLineElement = () => {},
  moveShapeKeypoint = () => {},
  openLinkDialog = () => {},
}) => {
  const { canvasScale } = useMainStore();

  const rotate = "rotate" in elementInfo ? elementInfo.rotate || 0 : 0;
  const { formatedAnimations } = useSlidesStore();

  const elementIndexListInAnimation = useMemo<number[]>(() => {
    const indexList: number[] = [];
    for (let i = 0; i < formatedAnimations.length; i++) {
      const elIds = formatedAnimations[i].animations.map((item) => item.elId);
      if (elIds.includes(elementInfo.id)) indexList.push(i + 1);
    }
    return indexList;
  }, [formatedAnimations, elementInfo.id]);

  const height = "height" in elementInfo ? elementInfo.height || 0 : 0;

  const CurrentOperateComponent = useMemo(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: ImageElementOperate,
      [ElementTypes.TEXT]: TextElementOperate,
      [ElementTypes.SHAPE]: ShapeElementOperate,
      [ElementTypes.LINE]: LineElementOperate,
      [ElementTypes.TABLE]: TableElementOperate,
      [ElementTypes.CHART]: CommonElementOperate,
      [ElementTypes.LATEX]: CommonElementOperate,
      [ElementTypes.VIDEO]: CommonElementOperate,
      [ElementTypes.AUDIO]: CommonElementOperate,
    };
    return elementTypeMap[elementInfo.type] || null;
  }, [elementInfo.type]);

  if (!CurrentOperateComponent) return null;

  // Ensure height is at least a small value to avoid 0 height issues for new text elements
  // But actually, for TextElement, if it's auto height, we rely on the elementInfo.height update
  // If elementInfo.height is 0, operate frame will be flat.
  // We can add a min-height for rendering operate frame if it's text and height is 0 (though it should be updated by ResizeObserver)

  const displayHeight =
    height === 0 && elementInfo.type === ElementTypes.TEXT ? 20 : height;

  const Component = CurrentOperateComponent as React.FC<any>;

  return (
    <div
      className={`operate ${isMultiSelect && !isActive ? "multi-select" : ""}`}
      style={{
        top: elementInfo.top * canvasScale + "px",
        left: elementInfo.left * canvasScale + "px",
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${(elementInfo.width * canvasScale) / 2}px ${
          (displayHeight * canvasScale) / 2
        }px`,
      }}
    >
      {isSelected && (
        <Component
          elementInfo={{ ...elementInfo, height: displayHeight }}
          handlerVisible={isActiveGroupElement || !isMultiSelect}
          rotateElement={rotateElement}
          scaleElement={scaleElement}
          dragLineElement={dragLineElement}
          moveShapeKeypoint={moveShapeKeypoint}
        />
      )}
      {isActive && elementInfo.link && (
        <LinkHandler
          elementInfo={elementInfo}
          link={elementInfo.link}
          openLinkDialog={openLinkDialog}
        />
      )}
    </div>
  );
};

export default Operate;
