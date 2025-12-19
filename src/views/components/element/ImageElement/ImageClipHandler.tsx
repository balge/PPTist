import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import clsx from "clsx";
import { useMainStore, useKeyboardStore } from "@/store";
import { KEYS } from "@/configs/hotkey";
import type { ImageClipedEmitData } from "@/types/edit";
import { OperateResizeHandlers } from "@/types/edit";
import type { ImageClipDataRange, ImageElementClip } from "@/types/slides";
import "./ImageClipHandler.scss";

// Helper for click outside
const useClickOutside = (
  ref: React.RefObject<HTMLElement>,
  handler: () => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
};

interface ImageClipHandlerProps {
  src: string;
  clipPath: string;
  width: number;
  height: number;
  top: number;
  left: number;
  rotate: number;
  clipData?: ImageElementClip;
  onClip: (payload: ImageClipedEmitData | null) => void;
}

const ImageClipHandler: React.FC<ImageClipHandlerProps> = ({
  src,
  clipPath,
  width,
  height,
  top,
  left,
  rotate,
  clipData,
  onClip,
}) => {
  const { canvasScale } = useMainStore();
  const { ctrlOrShiftKeyActive } = useKeyboardStore();

  const [clipWrapperPositionStyle, setClipWrapperPositionStyle] = useState({
    top: "0%",
    left: "0%",
  });
  const isSettingClipRange = useRef(false);
  const currentRange = useRef<ImageClipDataRange | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // 获取裁剪区域信息（裁剪区域占原图的宽高比例，处在原图中的位置）
  const getClipDataTransformInfo = useCallback(() => {
    const [start, end] = clipData
      ? clipData.range
      : [
          [0, 0],
          [100, 100],
        ];

    const widthScale = (end[0] - start[0]) / 100;
    const heightScale = (end[1] - start[1]) / 100;
    const leftVal = start[0] / widthScale;
    const topVal = start[1] / heightScale;

    return { widthScale, heightScale, left: leftVal, top: topVal };
  }, [clipData]);

  // 底层图片位置大小（遮罩区域图片）
  const imgPosition = useMemo(() => {
    const { widthScale, heightScale, left, top } = getClipDataTransformInfo();
    return {
      left: -left,
      top: -top,
      width: 100 / widthScale,
      height: 100 / heightScale,
    };
  }, [getClipDataTransformInfo]);

  // 底层图片位置大小样式（遮罩区域图片）
  const bottomImgPositionStyle = useMemo(() => {
    return {
      top: imgPosition.top + "%",
      left: imgPosition.left + "%",
      width: imgPosition.width + "%",
      height: imgPosition.height + "%",
    };
  }, [imgPosition]);

  // 顶层图片容器位置大小（裁剪高亮区域）
  const [topImgWrapperPosition, setTopImgWrapperPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  // 顶层图片容器位置大小样式（裁剪高亮区域）
  const topImgWrapperPositionStyle = useMemo(() => {
    const { top, left, width, height } = topImgWrapperPosition;
    return {
      top: top + "%",
      left: left + "%",
      width: width + "%",
      height: height + "%",
    };
  }, [topImgWrapperPosition]);

  // 顶层图片位置大小样式（裁剪区域图片）
  const topImgPositionStyle = useMemo(() => {
    const bottomWidth = imgPosition.width;
    const bottomHeight = imgPosition.height;

    const { top, left, width, height } = topImgWrapperPosition;

    // Avoid division by zero
    if (width === 0 || height === 0) return {};

    return {
      left: -left * (100 / width) + "%",
      top: -top * (100 / height) + "%",
      width: (bottomWidth / width) * 100 + "%",
      height: (bottomHeight / height) * 100 + "%",
    };
  }, [imgPosition, topImgWrapperPosition]);

  // 初始化裁剪位置信息
  useEffect(() => {
    const { left, top } = getClipDataTransformInfo();
    setTopImgWrapperPosition({
      left: left,
      top: top,
      width: 100,
      height: 100,
    });

    setClipWrapperPositionStyle({
      top: -top + "%",
      left: -left + "%",
    });
  }, [getClipDataTransformInfo]);

  // 计算并更新裁剪区域范围数据
  const updateRange = useCallback(() => {
    // topImgPositionStyle is calculated from state, we need to calculate it manually here to get latest values
    const bottomWidth = imgPosition.width;
    const bottomHeight = imgPosition.height;
    const { top, left, width, height } = topImgWrapperPosition;

    if (width === 0 || height === 0) return;

    const styleLeft = -left * (100 / width);
    const styleTop = -top * (100 / height);
    const styleWidth = (bottomWidth / width) * 100;
    const styleHeight = (bottomHeight / height) * 100;

    const retPosition = {
      left: styleLeft,
      top: styleTop,
      width: styleWidth,
      height: styleHeight,
    };

    const widthScale = 100 / retPosition.width;
    const heightScale = 100 / retPosition.height;

    const start: [number, number] = [
      -retPosition.left * widthScale,
      -retPosition.top * heightScale,
    ];
    const end: [number, number] = [
      widthScale * 100 + start[0],
      heightScale * 100 + start[1],
    ];

    currentRange.current = [start, end];
  }, [imgPosition, topImgWrapperPosition]);

  // 执行裁剪：计算裁剪后的图片位置大小和裁剪信息，并将数据同步出去
  const handleClip = useCallback(() => {
    if (isSettingClipRange.current) return;

    // If currentRange is not set yet (e.g. no interaction), calculate it
    if (!currentRange.current) {
      updateRange();
    }

    if (!currentRange.current) {
      onClip(null);
      return;
    }

    const { left: originLeft, top: originTop } = getClipDataTransformInfo();

    const position = {
      left: ((topImgWrapperPosition.left - originLeft) / 100) * width,
      top: ((topImgWrapperPosition.top - originTop) / 100) * height,
      width: ((topImgWrapperPosition.width - 100) / 100) * width,
      height: ((topImgWrapperPosition.height - 100) / 100) * height,
    };

    const clipedEmitData: ImageClipedEmitData = {
      range: currentRange.current,
      position,
    };
    onClip(clipedEmitData);
  }, [
    getClipDataTransformInfo,
    topImgWrapperPosition,
    width,
    height,
    onClip,
    updateRange,
  ]);

  useClickOutside(containerRef, handleClip);

  // 快捷键监听：回车确认裁剪
  useEffect(() => {
    const keyboardListener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase();
      if (key === KEYS.ENTER) handleClip();
    };
    document.addEventListener("keydown", keyboardListener);
    return () => {
      document.removeEventListener("keydown", keyboardListener);
    };
  }, [handleClip]);

  // 移动裁剪区域
  const moveClipRange = (e: React.MouseEvent) => {
    e.stopPropagation();
    isSettingClipRange.current = true;
    let isMouseDown = true;

    const startPageX = e.pageX;
    const startPageY = e.pageY;
    const bottomPosition = imgPosition;
    const originPositopn = { ...topImgWrapperPosition };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const currentPageX = e.pageX;
      const currentPageY = e.pageY;

      const _moveX = (currentPageX - startPageX) / canvasScale;
      const _moveY = (currentPageY - startPageY) / canvasScale;

      const _moveL = Math.sqrt(_moveX * _moveX + _moveY * _moveY);
      const _moveLRotate = Math.atan2(_moveY, _moveX);

      const rotateRad = _moveLRotate - (rotate / 180) * Math.PI;

      const moveX = ((_moveL * Math.cos(rotateRad)) / width) * 100;
      const moveY = ((_moveL * Math.sin(rotateRad)) / height) * 100;

      let targetLeft = originPositopn.left + moveX;
      let targetTop = originPositopn.top + moveY;

      if (targetLeft < 0) targetLeft = 0;
      else if (targetLeft + originPositopn.width > bottomPosition.width) {
        targetLeft = bottomPosition.width - originPositopn.width;
      }
      if (targetTop < 0) targetTop = 0;
      else if (targetTop + originPositopn.height > bottomPosition.height) {
        targetTop = bottomPosition.height - originPositopn.height;
      }

      setTopImgWrapperPosition({
        ...originPositopn, // Keep other props if any
        left: targetLeft,
        top: targetTop,
        width: originPositopn.width,
        height: originPositopn.height,
      });
    };

    const onMouseUp = () => {
      isMouseDown = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      updateRange();

      setTimeout(() => {
        isSettingClipRange.current = false;
      }, 0);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  // 缩放裁剪区域
  const scaleClipRange = (e: React.MouseEvent, type: OperateResizeHandlers) => {
    e.stopPropagation();
    isSettingClipRange.current = true;
    let isMouseDown = true;

    const minWidth = (50 / width) * 100;
    const minHeight = (50 / height) * 100;

    const startPageX = e.pageX;
    const startPageY = e.pageY;
    const bottomPosition = imgPosition;
    const originPositopn = { ...topImgWrapperPosition };

    const aspectRatio =
      topImgWrapperPosition.width / topImgWrapperPosition.height;

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const currentPageX = e.pageX;
      const currentPageY = e.pageY;

      const _moveX = (currentPageX - startPageX) / canvasScale;
      const _moveY = (currentPageY - startPageY) / canvasScale;

      const _moveL = Math.sqrt(_moveX * _moveX + _moveY * _moveY);
      const _moveLRotate = Math.atan2(_moveY, _moveX);

      const rotateRad = _moveLRotate - (rotate / 180) * Math.PI;

      let moveX = ((_moveL * Math.cos(rotateRad)) / width) * 100;
      let moveY = ((_moveL * Math.sin(rotateRad)) / height) * 100;

      if (ctrlOrShiftKeyActive) {
        if (
          type === OperateResizeHandlers.RIGHT_BOTTOM ||
          type === OperateResizeHandlers.LEFT_TOP
        ) {
          moveY = moveX / aspectRatio;
        }
        if (
          type === OperateResizeHandlers.LEFT_BOTTOM ||
          type === OperateResizeHandlers.RIGHT_TOP
        ) {
          moveY = -moveX / aspectRatio;
        }
      }

      let targetLeft = originPositopn.left;
      let targetTop = originPositopn.top;
      let targetWidth = originPositopn.width;
      let targetHeight = originPositopn.height;

      if (type === OperateResizeHandlers.LEFT_TOP) {
        if (originPositopn.left + moveX < 0) {
          moveX = -originPositopn.left;
        }
        if (originPositopn.top + moveY < 0) {
          moveY = -originPositopn.top;
        }
        if (originPositopn.width - moveX < minWidth) {
          moveX = originPositopn.width - minWidth;
        }
        if (originPositopn.height - moveY < minHeight) {
          moveY = originPositopn.height - minHeight;
        }
        targetWidth = originPositopn.width - moveX;
        targetHeight = originPositopn.height - moveY;
        targetLeft = originPositopn.left + moveX;
        targetTop = originPositopn.top + moveY;
      } else if (type === OperateResizeHandlers.RIGHT_TOP) {
        if (
          originPositopn.left + originPositopn.width + moveX >
          bottomPosition.width
        ) {
          moveX =
            bottomPosition.width - (originPositopn.left + originPositopn.width);
        }
        if (originPositopn.top + moveY < 0) {
          moveY = -originPositopn.top;
        }
        if (originPositopn.width + moveX < minWidth) {
          moveX = minWidth - originPositopn.width;
        }
        if (originPositopn.height - moveY < minHeight) {
          moveY = originPositopn.height - minHeight;
        }
        targetWidth = originPositopn.width + moveX;
        targetHeight = originPositopn.height - moveY;
        targetLeft = originPositopn.left;
        targetTop = originPositopn.top + moveY;
      } else if (type === OperateResizeHandlers.LEFT_BOTTOM) {
        if (originPositopn.left + moveX < 0) {
          moveX = -originPositopn.left;
        }
        if (
          originPositopn.top + originPositopn.height + moveY >
          bottomPosition.height
        ) {
          moveY =
            bottomPosition.height -
            (originPositopn.top + originPositopn.height);
        }
        if (originPositopn.width - moveX < minWidth) {
          moveX = originPositopn.width - minWidth;
        }
        if (originPositopn.height + moveY < minHeight) {
          moveY = minHeight - originPositopn.height;
        }
        targetWidth = originPositopn.width - moveX;
        targetHeight = originPositopn.height + moveY;
        targetLeft = originPositopn.left + moveX;
        targetTop = originPositopn.top;
      } else if (type === OperateResizeHandlers.RIGHT_BOTTOM) {
        if (
          originPositopn.left + originPositopn.width + moveX >
          bottomPosition.width
        ) {
          moveX =
            bottomPosition.width - (originPositopn.left + originPositopn.width);
        }
        if (
          originPositopn.top + originPositopn.height + moveY >
          bottomPosition.height
        ) {
          moveY =
            bottomPosition.height -
            (originPositopn.top + originPositopn.height);
        }
        if (originPositopn.width + moveX < minWidth) {
          moveX = minWidth - originPositopn.width;
        }
        if (originPositopn.height + moveY < minHeight) {
          moveY = minHeight - originPositopn.height;
        }
        targetWidth = originPositopn.width + moveX;
        targetHeight = originPositopn.height + moveY;
        targetLeft = originPositopn.left;
        targetTop = originPositopn.top;
      } else if (type === OperateResizeHandlers.TOP) {
        if (originPositopn.top + moveY < 0) {
          moveY = -originPositopn.top;
        }
        if (originPositopn.height - moveY < minHeight) {
          moveY = originPositopn.height - minHeight;
        }
        targetWidth = originPositopn.width;
        targetHeight = originPositopn.height - moveY;
        targetLeft = originPositopn.left;
        targetTop = originPositopn.top + moveY;
      } else if (type === OperateResizeHandlers.BOTTOM) {
        if (
          originPositopn.top + originPositopn.height + moveY >
          bottomPosition.height
        ) {
          moveY =
            bottomPosition.height -
            (originPositopn.top + originPositopn.height);
        }
        if (originPositopn.height + moveY < minHeight) {
          moveY = minHeight - originPositopn.height;
        }
        targetWidth = originPositopn.width;
        targetHeight = originPositopn.height + moveY;
        targetLeft = originPositopn.left;
        targetTop = originPositopn.top;
      } else if (type === OperateResizeHandlers.LEFT) {
        if (originPositopn.left + moveX < 0) {
          moveX = -originPositopn.left;
        }
        if (originPositopn.width - moveX < minWidth) {
          moveX = originPositopn.width - minWidth;
        }
        targetWidth = originPositopn.width - moveX;
        targetHeight = originPositopn.height;
        targetLeft = originPositopn.left + moveX;
        targetTop = originPositopn.top;
      } else {
        if (
          originPositopn.left + originPositopn.width + moveX >
          bottomPosition.width
        ) {
          moveX =
            bottomPosition.width - (originPositopn.left + originPositopn.width);
        }
        if (originPositopn.width + moveX < minWidth) {
          moveX = minWidth - originPositopn.width;
        }
        targetHeight = originPositopn.height;
        targetWidth = originPositopn.width + moveX;
        targetLeft = originPositopn.left;
        targetTop = originPositopn.top;
      }

      setTopImgWrapperPosition({
        left: targetLeft,
        top: targetTop,
        width: targetWidth,
        height: targetHeight,
      });
    };

    const onMouseUp = () => {
      isMouseDown = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      updateRange();

      setTimeout(() => (isSettingClipRange.current = false), 0);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const rotateClassName = useMemo(() => {
    const prefix = "rotate-";
    const r = rotate;
    if (r > -22.5 && r <= 22.5) return prefix + 0;
    else if (r > 22.5 && r <= 67.5) return prefix + 45;
    else if (r > 67.5 && r <= 112.5) return prefix + 90;
    else if (r > 112.5 && r <= 157.5) return prefix + 135;
    else if (r > 157.5 || r <= -157.5) return prefix + 0;
    else if (r > -157.5 && r <= -112.5) return prefix + 45;
    else if (r > -112.5 && r <= -67.5) return prefix + 90;
    else if (r > -67.5 && r <= -22.5) return prefix + 135;
    return prefix + 0;
  }, [rotate]);

  const cornerPoint = [
    OperateResizeHandlers.LEFT_TOP,
    OperateResizeHandlers.RIGHT_TOP,
    OperateResizeHandlers.LEFT_BOTTOM,
    OperateResizeHandlers.RIGHT_BOTTOM,
  ];
  const edgePoints = [
    OperateResizeHandlers.TOP,
    OperateResizeHandlers.BOTTOM,
    OperateResizeHandlers.LEFT,
    OperateResizeHandlers.RIGHT,
  ];

  return (
    <div
      className="image-clip-handler"
      style={clipWrapperPositionStyle}
      ref={containerRef}
    >
      <img
        className="bottom-img"
        src={src}
        draggable={false}
        alt=""
        style={bottomImgPositionStyle}
      />

      <div
        className="top-image-content"
        style={{
          ...topImgWrapperPositionStyle,
          clipPath,
        }}
      >
        <img
          className="top-img"
          src={src}
          draggable={false}
          alt=""
          style={topImgPositionStyle}
        />
      </div>

      <div
        className="operate"
        style={topImgWrapperPositionStyle}
        onMouseDown={moveClipRange}
      >
        {cornerPoint.map((point) => (
          <div
            key={point}
            className={clsx("clip-point", point, rotateClassName)}
            onMouseDown={(e) => scaleClipRange(e, point)}
          >
            <svg width="16" height="16" fill="#fff" stroke="#333">
              <path
                stroke-width="0.3"
                shape-rendering="crispEdges"
                d="M 16 0 L 0 0 L 0 16 L 4 16 L 4 4 L 16 4 L 16 0 Z"
              ></path>
            </svg>
          </div>
        ))}
        {edgePoints.map((point) => (
          <div
            key={point}
            className={clsx("clip-point", point, rotateClassName)}
            onMouseDown={(e) => scaleClipRange(e, point)}
          >
            <svg width="16" height="16" fill="#fff" stroke="#333">
              <path
                strokeWidth="0.3"
                shapeRendering="crispEdges"
                d="M 16 0 L 0 0 L 0 4 L 16 4 Z"
              ></path>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageClipHandler;
