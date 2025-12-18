import {
  useState,
  useEffect,
  useMemo,
  useRef,
  type RefObject,
  useCallback,
} from "react";
import { useMainStore, useSlidesStore } from "@/store";

export default (canvasRef: RefObject<HTMLElement>) => {
  const [viewportLeft, setViewportLeft] = useState(0);
  const [viewportTop, setViewportTop] = useState(0);

  const canvasPercentage = useMainStore((state) => state.canvasPercentage);
  const canvasDragged = useMainStore((state) => state.canvasDragged);
  const setCanvasScale = useMainStore((state) => state.setCanvasScale);
  const setCanvasDragged = useMainStore((state) => state.setCanvasDragged);

  const viewportRatio = useSlidesStore((state) => state.viewportRatio);
  const viewportSize = useSlidesStore((state) => state.viewportSize);

  const prevPercentageRef = useRef(canvasPercentage);

  // 初始化画布可视区域的位置
  const initViewportPosition = useCallback(() => {
    if (!canvasRef.current) return;
    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;

    if (canvasWidth === 0 || canvasHeight === 0) return; // 避免除以0或无效计算

    // 使用传入的 canvasPercentage (通过依赖更新)

    if (canvasHeight / canvasWidth > viewportRatio) {
      const viewportActualWidth = canvasWidth * (canvasPercentage / 100);
      setCanvasScale(viewportActualWidth / viewportSize);
      setViewportLeft((canvasWidth - viewportActualWidth) / 2);
      setViewportTop((canvasHeight - viewportActualWidth * viewportRatio) / 2);
    } else {
      const viewportActualHeight = canvasHeight * (canvasPercentage / 100);
      setCanvasScale(viewportActualHeight / (viewportSize * viewportRatio));
      setViewportLeft((canvasWidth - viewportActualHeight / viewportRatio) / 2);
      setViewportTop((canvasHeight - viewportActualHeight) / 2);
    }
  }, [
    canvasRef,
    viewportRatio,
    viewportSize,
    canvasPercentage,
    setCanvasScale,
  ]);

  // 更新画布可视区域的位置
  useEffect(() => {
    const oldValue = prevPercentageRef.current;
    const newValue = canvasPercentage;

    if (oldValue === newValue) return;
    prevPercentageRef.current = newValue;

    if (!canvasRef.current) return;
    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;

    if (canvasHeight / canvasWidth > viewportRatio) {
      const newViewportActualWidth = canvasWidth * (newValue / 100);
      const oldViewportActualWidth = canvasWidth * (oldValue / 100);
      const newViewportActualHeight = newViewportActualWidth * viewportRatio;
      const oldViewportActualHeight = oldViewportActualWidth * viewportRatio;

      setCanvasScale(newViewportActualWidth / viewportSize);

      setViewportLeft(
        (prev) => prev - (newViewportActualWidth - oldViewportActualWidth) / 2
      );
      setViewportTop(
        (prev) => prev - (newViewportActualHeight - oldViewportActualHeight) / 2
      );
    } else {
      const newViewportActualHeight = canvasHeight * (newValue / 100);
      const oldViewportActualHeight = canvasHeight * (oldValue / 100);
      const newViewportActualWidth = newViewportActualHeight / viewportRatio;
      const oldViewportActualWidth = oldViewportActualHeight / viewportRatio;

      setCanvasScale(newViewportActualHeight / (viewportSize * viewportRatio));

      setViewportLeft(
        (prev) => prev - (newViewportActualWidth - oldViewportActualWidth) / 2
      );
      setViewportTop(
        (prev) => prev - (newViewportActualHeight - oldViewportActualHeight) / 2
      );
    }
  }, [
    canvasPercentage,
    viewportRatio,
    viewportSize,
    setCanvasScale,
    canvasRef,
  ]);

  // 可视区域缩放或比例变化时，重置/更新可视区域的位置
  useEffect(() => {
    initViewportPosition();
  }, [initViewportPosition]);

  // 画布拖拽状态改变（复原）时，重置可视区域的位置
  useEffect(() => {
    if (!canvasDragged) initViewportPosition();
  }, [canvasDragged, initViewportPosition]);

  // 监听画布尺寸发生变化时，重置可视区域的位置
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    // 立即执行一次以处理初始渲染
    initViewportPosition();

    const resizeObserver = new ResizeObserver(() => {
      initViewportPosition();
    });
    resizeObserver.observe(el);
    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef, initViewportPosition]);

  // 画布可视区域位置和大小的样式
  const viewportStyles = useMemo(
    () => ({
      width: viewportSize,
      height: viewportSize * viewportRatio,
      left: viewportLeft,
      top: viewportTop,
    }),
    [viewportSize, viewportRatio, viewportLeft, viewportTop]
  );

  // 拖拽画布
  const dragViewport = (e: MouseEvent) => {
    let isMouseDown = true;

    const startPageX = e.pageX;
    const startPageY = e.pageY;

    const originLeft = viewportLeft;
    const originTop = viewportTop;

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;

      const currentPageX = e.pageX;
      const currentPageY = e.pageY;

      setViewportLeft(originLeft + (currentPageX - startPageX));
      setViewportTop(originTop + (currentPageY - startPageY));
    };

    const onMouseUp = () => {
      isMouseDown = false;
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      setCanvasDragged(true);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  return {
    viewportStyles,
    dragViewport,
  };
};
