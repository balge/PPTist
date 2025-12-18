import { useState, useEffect, useMemo, useRef, type RefObject } from "react";
import { useMainStore, useSlidesStore } from "@/store";

export default (canvasRef: RefObject<HTMLElement>) => {
  const [viewportLeft, setViewportLeft] = useState(0);
  const [viewportTop, setViewportTop] = useState(0);

  const mainStore = useMainStore();
  const canvasPercentage = useMainStore((state) => state.canvasPercentage);
  const canvasDragged = useMainStore((state) => state.canvasDragged);

  const viewportRatio = useSlidesStore((state) => state.viewportRatio);
  const viewportSize = useSlidesStore((state) => state.viewportSize);

  const prevPercentageRef = useRef(canvasPercentage);

  // 初始化画布可视区域的位置
  const initViewportPosition = () => {
    if (!canvasRef.current) return;
    const canvasWidth = canvasRef.current.clientWidth;
    const canvasHeight = canvasRef.current.clientHeight;

    if (canvasHeight / canvasWidth > viewportRatio) {
      const viewportActualWidth = canvasWidth * (canvasPercentage / 100);
      mainStore.setCanvasScale(viewportActualWidth / viewportSize);
      setViewportLeft((canvasWidth - viewportActualWidth) / 2);
      setViewportTop((canvasHeight - viewportActualWidth * viewportRatio) / 2);
    } else {
      const viewportActualHeight = canvasHeight * (canvasPercentage / 100);
      mainStore.setCanvasScale(
        viewportActualHeight / (viewportSize * viewportRatio)
      );
      setViewportLeft((canvasWidth - viewportActualHeight / viewportRatio) / 2);
      setViewportTop((canvasHeight - viewportActualHeight) / 2);
    }
  };

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

      mainStore.setCanvasScale(newViewportActualWidth / viewportSize);

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

      mainStore.setCanvasScale(
        newViewportActualHeight / (viewportSize * viewportRatio)
      );

      setViewportLeft(
        (prev) => prev - (newViewportActualWidth - oldViewportActualWidth) / 2
      );
      setViewportTop(
        (prev) => prev - (newViewportActualHeight - oldViewportActualHeight) / 2
      );
    }
  }, [canvasPercentage, viewportRatio, viewportSize]); // Dependencies: we need viewportRatio/Size too if they change? No, Vue watched canvasPercentage only for this logic.

  // 可视区域缩放或比例变化时，重置/更新可视区域的位置
  // watch(viewportRatio, initViewportPosition)
  // watch(viewportSize, initViewportPosition)
  useEffect(() => {
    initViewportPosition();
  }, [viewportRatio, viewportSize]);

  // 画布拖拽状态改变（复原）时，重置可视区域的位置
  // watch(canvasDragged, ...)
  useEffect(() => {
    if (!canvasDragged) initViewportPosition();
  }, [canvasDragged]);

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

  // 监听画布尺寸发生变化时，重置可视区域的位置
  useEffect(() => {
    if (!canvasRef.current) return;
    const resizeObserver = new ResizeObserver(initViewportPosition);
    resizeObserver.observe(canvasRef.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, [canvasRef.current]); // Re-run if ref changes (unlikely) or just once?
  // Ref object is stable, but current might change.
  // Actually, passing ref to dependency array is tricky. Usually we use a callback ref or just ref.current.
  // But canvasRef.current might be null initially.
  // We can depend on nothing and just check in effect, but if it mounts later...
  // Usually the component using this hook renders the canvas.

  // 拖拽画布
  const dragViewport = (e: MouseEvent) => {
    let isMouseDown = true;

    const startPageX = e.pageX;
    const startPageY = e.pageY;

    const originLeft = viewportLeft;
    const originTop = viewportTop;

    document.onmousemove = (e) => {
      if (!isMouseDown) return;

      const currentPageX = e.pageX;
      const currentPageY = e.pageY;

      setViewportLeft(originLeft + (currentPageX - startPageX));
      setViewportTop(originTop + (currentPageY - startPageY));
    };

    document.onmouseup = () => {
      isMouseDown = false;
      document.onmousemove = null;
      document.onmouseup = null;

      mainStore.setCanvasDragged(true);
    };
  };

  return {
    viewportStyles,
    dragViewport,
  };
};
