import { useMemo } from 'react'
import { useMainStore } from '@/store'

export default () => {
  const { canvasPercentage, canvasScale, canvasDragged, setCanvasPercentage, setCanvasDragged } = useMainStore()

  const canvasScalePercentage = useMemo(() => Math.round(canvasScale * 100) + '%', [canvasScale])

  /**
   * 缩放画布百分比
   * @param command 缩放命令：放大、缩小
   */
  const scaleCanvas = (command: '+' | '-') => {
    let percentage = canvasPercentage
    const step = 5
    const max = 200
    const min = 30
    if (command === '+' && percentage <= max) percentage += step
    if (command === '-' && percentage >= min) percentage -= step

    setCanvasPercentage(percentage)
  }

  /**
   * 设置画布缩放比例
   * 但不是直接设置该值，而是通过设置画布可视区域百分比来动态计算
   * @param value 目标画布缩放比例
   */
  const setCanvasScalePercentage = (value: number) => {
    const percentage = Math.round(value / canvasScale * canvasPercentage) / 100
    setCanvasPercentage(percentage)
  }

  /**
   * 重置画布尺寸和位置
   */
  const resetCanvas = () => {
    setCanvasPercentage(90)
    if (canvasDragged) setCanvasDragged(false)
  }

  return {
    canvasScalePercentage,
    setCanvasScalePercentage,
    scaleCanvas,
    resetCanvas,
  }
}
