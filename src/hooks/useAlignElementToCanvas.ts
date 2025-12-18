import { useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { ElementAlignCommands } from '@/types/edit'
import { getElementListRange } from '@/utils/element'
import useHistorySnapshot from './useHistorySnapshot'

export default () => {
  const { activeElementIdList } = useMainStore()
  const { currentSlide, viewportRatio, viewportSize, updateSlide } = useSlidesStore()

  const activeElementList = useMemo(() => {
    if (!currentSlide || !currentSlide.elements) return []
    return currentSlide.elements.filter(el => activeElementIdList.includes(el.id))
  }, [currentSlide, activeElementIdList])

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 将所有选中的元素对齐到画布
   * @param command 对齐方向
   */
  const alignElementToCanvas = (command: ElementAlignCommands) => {
    if (!currentSlide) return

    const viewportWidth = viewportSize
    const viewportHeight = viewportSize * viewportRatio
    const { minX, maxX, minY, maxY } = getElementListRange(activeElementList)
  
    const newElementList: PPTElement[] = JSON.parse(JSON.stringify(currentSlide.elements))
    for (const element of newElementList) {
      if (!activeElementIdList.includes(element.id)) continue
      
      // 水平垂直居中
      if (command === ElementAlignCommands.CENTER) {
        const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
        const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
        element.top = element.top - offsetY 
        element.left = element.left - offsetX           
      }

      // 顶部对齐
      if (command === ElementAlignCommands.TOP) {
        const offsetY = minY - 0
        element.top = element.top - offsetY            
      }

      // 垂直居中
      else if (command === ElementAlignCommands.VERTICAL) {
        const offsetY = minY + (maxY - minY) / 2 - viewportHeight / 2
        element.top = element.top - offsetY            
      }

      // 底部对齐
      else if (command === ElementAlignCommands.BOTTOM) {
        const offsetY = maxY - viewportHeight
        element.top = element.top - offsetY       
      }
      
      // 左侧对齐
      else if (command === ElementAlignCommands.LEFT) {
        const offsetX = minX - 0
        element.left = element.left - offsetX            
      }

      // 水平居中
      else if (command === ElementAlignCommands.HORIZONTAL) {
        const offsetX = minX + (maxX - minX) / 2 - viewportWidth / 2
        element.left = element.left - offsetX            
      }

      // 右侧对齐
      else if (command === ElementAlignCommands.RIGHT) {
        const offsetX = maxX - viewportWidth
        element.left = element.left - offsetX            
      }
    }

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    alignElementToCanvas,
  }
}
