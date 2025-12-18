import React, { useMemo, useRef } from "react";
import { ElementTypes, type PPTElement } from "@/types/slides";
import type { ContextmenuItem } from "@/components/Contextmenu/types";
import { ElementAlignCommands, ElementOrderCommands } from "@/types/edit";

import useDeleteElement from "@/hooks/useDeleteElement";
import useOrderElement from "@/hooks/useOrderElement";
import useAlignElementToCanvas from "@/hooks/useAlignElementToCanvas";
import useCopyAndPasteElement from "@/hooks/useCopyAndPasteElement";
import useContextMenu from "@/hooks/useContextMenu";

import {
  ImageElement,
  TextElement,
  ShapeElement,
  LineElement,
  PlaceholderElement,
} from "@/views/components/element";

interface EditableElementProps {
  elementInfo: PPTElement;
  elementIndex: number;
  isMultiSelect: boolean;
  selectElement: (
    e: React.MouseEvent | React.TouchEvent,
    element: PPTElement,
    canMove?: boolean
  ) => void;
  openLinkDialog?: () => void;
}

const EditableElement: React.FC<EditableElementProps> = ({
  elementInfo,
  elementIndex,
  isMultiSelect,
  selectElement,
}) => {
  const { orderElement } = useOrderElement();
  const { alignElementToCanvas } = useAlignElementToCanvas();
  const { deleteElement } = useDeleteElement();
  const { copyElement, pasteElement, cutElement } = useCopyAndPasteElement();
  const elementRef = useRef<HTMLDivElement>(null);

  const CurrentElementComponent = useMemo(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: ImageElement,
      [ElementTypes.TEXT]: TextElement,
      [ElementTypes.SHAPE]: ShapeElement,
      [ElementTypes.LINE]: LineElement,
      [ElementTypes.CHART]: PlaceholderElement,
      [ElementTypes.TABLE]: PlaceholderElement,
      [ElementTypes.LATEX]: PlaceholderElement,
      [ElementTypes.VIDEO]: PlaceholderElement,
      [ElementTypes.AUDIO]: PlaceholderElement,
    };
    return elementTypeMap[elementInfo.type] || null;
  }, [elementInfo.type]);

  const contextmenus = (): ContextmenuItem[] => {
    return [
      {
        text: "剪切",
        subText: "Ctrl + X",
        handler: cutElement,
      },
      {
        text: "复制",
        subText: "Ctrl + C",
        handler: copyElement,
      },
      {
        text: "粘贴",
        subText: "Ctrl + V",
        handler: pasteElement,
      },
      { divider: true },
      {
        text: "水平居中",
        handler: () => alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
        children: [
          {
            text: "水平垂直居中",
            handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
          },
          {
            text: "水平居中",
            handler: () =>
              alignElementToCanvas(ElementAlignCommands.HORIZONTAL),
          },
          {
            text: "左对齐",
            handler: () => alignElementToCanvas(ElementAlignCommands.LEFT),
          },
          {
            text: "右对齐",
            handler: () => alignElementToCanvas(ElementAlignCommands.RIGHT),
          },
        ],
      },
      {
        text: "垂直居中",
        handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
        children: [
          {
            text: "水平垂直居中",
            handler: () => alignElementToCanvas(ElementAlignCommands.CENTER),
          },
          {
            text: "垂直居中",
            handler: () => alignElementToCanvas(ElementAlignCommands.VERTICAL),
          },
          {
            text: "顶部对齐",
            handler: () => alignElementToCanvas(ElementAlignCommands.TOP),
          },
          {
            text: "底部对齐",
            handler: () => alignElementToCanvas(ElementAlignCommands.BOTTOM),
          },
        ],
      },
      { divider: true },
      {
        text: "置于顶层",
        disable: isMultiSelect && !elementInfo.groupId,
        handler: () => orderElement(elementInfo, ElementOrderCommands.TOP),
        children: [
          {
            text: "置于顶层",
            handler: () => orderElement(elementInfo, ElementOrderCommands.TOP),
          },
          {
            text: "上移一层",
            handler: () => orderElement(elementInfo, ElementOrderCommands.UP),
          },
        ],
      },
      {
        text: "置于底层",
        disable: isMultiSelect && !elementInfo.groupId,
        handler: () => orderElement(elementInfo, ElementOrderCommands.BOTTOM),
        children: [
          {
            text: "置于底层",
            handler: () =>
              orderElement(elementInfo, ElementOrderCommands.BOTTOM),
          },
          {
            text: "下移一层",
            handler: () => orderElement(elementInfo, ElementOrderCommands.DOWN),
          },
        ],
      },
      { divider: true },
      {
        text: "删除",
        subText: "Delete",
        handler: deleteElement,
      },
    ];
  };

  useContextMenu(elementRef, contextmenus);

  if (!CurrentElementComponent) return null;

  return (
    <div
      ref={elementRef}
      className="editable-element"
      id={`editable-element-${elementInfo.id}`}
      style={{
        zIndex: elementIndex,
      }}
    >
      <CurrentElementComponent
        elementInfo={elementInfo}
        selectElement={selectElement}
        contextmenus={contextmenus}
      />
    </div>
  );
};

export default EditableElement;
