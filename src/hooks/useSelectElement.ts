import { useMainStore, useSlidesStore } from '@/store'

export default () => {
  const { currentSlide } = useSlidesStore()
  const { hiddenElementIdList, handleElementId, setActiveElementIdList } = useMainStore()

  // 将当前页面全部元素设置为被选择状态
  /**
   * 将当前页面全部可见元素设置为被选中状态
   */
  const selectAllElements = () => {
    if (!currentSlide) return
    const visibleElements = currentSlide.elements.filter(el => !hiddenElementIdList.includes(el.id))
    const newActiveElementIdList = visibleElements.map(el => el.id)
    setActiveElementIdList(newActiveElementIdList)
  }
  
  // 将指定元素设置为被选择状态
  /**
   * 将指定元素设置为被选中状态
   * @param id 元素ID
   */
  const selectElement = (id: string) => {
    if (handleElementId === id) return
    if (hiddenElementIdList.includes(id)) return

    setActiveElementIdList([id])
  }

  return {
    selectAllElements,
    selectElement,
  }
}
