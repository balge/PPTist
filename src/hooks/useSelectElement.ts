import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'

export default () => {
  const mainStore = useMainStore()
  const { currentSlide } = storeToRefs(useSlidesStore())
  const { hiddenElementIdList, handleElementId } = storeToRefs(mainStore)

  // 将当前页面全部元素设置为被选择状态
  /**
   * 将当前页面全部可见元素设置为被选中状态
   */
  const selectAllElements = () => {
    const visibleElements = currentSlide.value.elements.filter(el => !hiddenElementIdList.value.includes(el.id))
    const newActiveElementIdList = visibleElements.map(el => el.id)
    mainStore.setActiveElementIdList(newActiveElementIdList)
  }
  
  // 将指定元素设置为被选择状态
  /**
   * 将指定元素设置为被选中状态
   * @param id 元素ID
   */
  const selectElement = (id: string) => {
    if (handleElementId.value === id) return
    if (hiddenElementIdList.value.includes(id)) return

    mainStore.setActiveElementIdList([id])
  }

  return {
    selectAllElements,
    selectElement,
  }
}
