import { useMainStore, useSlidesStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const { activeElementIdList, activeGroupElementId, setActiveElementIdList } = useMainStore()
  const { currentSlide, updateSlide } = useSlidesStore()
  
  // Note: hooks must be called at the top level
  const { addHistorySnapshot } = useHistorySnapshot()

  // 删除全部选中元素
  // 组合元素成员中，存在被选中可独立操作的元素时，优先删除该元素。否则默认删除所有被选中的元素
  const deleteElement = () => {
    if (!activeElementIdList.length) return
    if (!currentSlide) return

    let newElementList: PPTElement[] = []
    if (activeGroupElementId) {
      newElementList = currentSlide.elements.filter(el => el.id !== activeGroupElementId)
    }
    else {
      newElementList = currentSlide.elements.filter(el => !activeElementIdList.includes(el.id))
    }

    setActiveElementIdList([])
    updateSlide({ elements: newElementList })
    addHistorySnapshot()
  }

  // 删除内面内全部元素(无论是否选中)
  const deleteAllElements = () => {
    if (!currentSlide || !currentSlide.elements.length) return
    setActiveElementIdList([])
    updateSlide({ elements: [] })
    addHistorySnapshot()
  }

  return {
    deleteElement,
    deleteAllElements,
  }
}
