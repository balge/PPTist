import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { KEYS } from '@/configs/hotkey'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const { currentSlide, updateSlide } = useSlidesStore()
  const { activeElementIdList, activeGroupElementId } = useMainStore()

  const { addHistorySnapshot } = useHistorySnapshot()

  /**
   * 将元素向指定方向移动指定的距离
   * 组合元素成员中，存在被选中可独立操作的元素时，优先移动该元素。否则默认移动所有被选中的元素
   * @param command 移动方向
   * @param step 移动距离
   */
  const moveElement = (command: string, step = 1) => {
    if (!currentSlide) return
    
    let newElementList: PPTElement[] = []

    const move = (el: PPTElement) => {
      let { left, top } = el
      switch (command) {
        case KEYS.LEFT: 
          left = left - step
          break
        case KEYS.RIGHT: 
          left = left + step
          break
        case KEYS.UP: 
          top = top - step
          break
        case KEYS.DOWN: 
          top = top + step
          break
        default: break
      }
      return { ...el, left, top }
    }

    if (activeGroupElementId) {
      newElementList = currentSlide.elements.map(el => {
        return activeGroupElementId === el.id ? move(el) : el
      })
    }
    else {
      newElementList = currentSlide.elements.map(el => {
        return activeElementIdList.includes(el.id) ? move(el) : el
      })
    }

    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  return {
    moveElement,
  }
}
