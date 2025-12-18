import { useMemo } from 'react'
import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import type { Slide } from '@/types/slides'
import { copyText, readClipboard } from '@/utils/clipboard'
import { encrypt } from '@/utils/crypto'
import { createElementIdMap } from '@/utils/element'
import { KEYS } from '@/configs/hotkey'
import usePasteTextClipboardData from '@/hooks/usePasteTextClipboardData'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'
import useAddSlidesOrElements from '@/hooks/useAddSlidesOrElements'

export default () => {
  const { selectedSlidesIndex: _selectedSlidesIndex, activeElementIdList, setActiveElementIdList, setThumbnailsFocus, updateSelectedSlidesIndex: updateSelectedSlidesIndexAction } = useMainStore()
  const { currentSlide, slides, theme, slideIndex, updateSlideIndex: updateSlideIndexAction, addSlide, deleteSlide: deleteSlideAction, updateSlide, setSlides } = useSlidesStore()

  const selectedSlidesIndex = useMemo(() => [
    ..._selectedSlidesIndex,
    slideIndex,
  ], [_selectedSlidesIndex, slideIndex])

  const selectedSlides = useMemo(() =>
    slides.filter((item, index) =>
      selectedSlidesIndex.includes(index)
    )
  , [slides, selectedSlidesIndex])

  const selectedSlidesId = useMemo(() =>
    selectedSlides.map((item) => item.id)
  , [selectedSlides])

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { addSlidesFromData } = useAddSlidesOrElements()
  const { addHistorySnapshot } = useHistorySnapshot()

  // 重置幻灯片
  const resetSlides = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.backgroundColor,
      },
    }
    updateSlideIndexAction(0)
    setActiveElementIdList([])
    setSlides([emptySlide])
  }

  /**
   * 移动页面焦点
   * @param command 移动页面焦点命令：上移、下移
   */
  const updateSlideIndex = (command: string) => {
    if (command === KEYS.UP && slideIndex > 0) {
      if (activeElementIdList.length) {
        setActiveElementIdList([])
      }
      updateSlideIndexAction(slideIndex - 1)
    }
    else if (
      command === KEYS.DOWN &&
      slideIndex < slides.length - 1
    ) {
      if (activeElementIdList.length) {
        setActiveElementIdList([])
      }
      updateSlideIndexAction(slideIndex + 1)
    }
  }

  // 将当前页面数据加密后复制到剪贴板
  const copySlide = () => {
    const text = encrypt(
      JSON.stringify({
        type: 'slides',
        data: selectedSlides,
      })
    )

    copyText(text).then(() => {
      setThumbnailsFocus(true)
    })
  }

  // 尝试将剪贴板页面数据解密后添加到下一页（粘贴）
  const pasteSlide = () => {
    readClipboard()
      .then((text) => {
        pasteTextClipboardData(text, { onlySlide: true })
      })
      .catch((err) => console.warn(err))
  }

  // 创建一页空白页并添加到下一页
  const createSlide = () => {
    const emptySlide: Slide = {
      id: nanoid(10),
      elements: [],
      background: {
        type: 'solid',
        color: theme.backgroundColor,
      },
    }
    setActiveElementIdList([])
    addSlide(emptySlide)
    addHistorySnapshot()
  }

  // 根据模板创建新页面
  const createSlideByTemplate = (slide: Slide) => {
    const { groupIdMap, elIdMap } = createElementIdMap(slide.elements)

    for (const element of slide.elements) {
      element.id = elIdMap[element.id]
      if (element.groupId) element.groupId = groupIdMap[element.groupId]
    }
    const newSlide = {
      ...slide,
      id: nanoid(10),
    }
    setActiveElementIdList([])
    addSlide(newSlide)
    addHistorySnapshot()
  }

  // 将当前页复制一份到下一页
  const copyAndPasteSlide = () => {
    const slide = JSON.parse(JSON.stringify(currentSlide))
    addSlidesFromData([slide])
  }

  // 删除当前页，若将删除全部页面，则执行重置幻灯片操作
  const deleteSlide = (targetSlidesId = selectedSlidesId) => {
    if (slides.length === targetSlidesId.length) resetSlides()
    else deleteSlideAction(targetSlidesId)

    updateSelectedSlidesIndexAction([])

    addHistorySnapshot()
  }

  // 将当前页复制后删除（剪切）
  // 由于复制操作会导致多选状态消失，所以需要提前将需要删除的页面ID进行缓存
  const cutSlide = () => {
    const targetSlidesId = [...selectedSlidesId]
    copySlide()
    deleteSlide(targetSlidesId)
  }

  // 选中全部幻灯片
  const selectAllSlide = () => {
    const newSelectedSlidesIndex = Array.from(
      Array(slides.length),
      (item, index) => index
    )
    setActiveElementIdList([])
    updateSelectedSlidesIndexAction(newSelectedSlidesIndex)
  }

  // 拖拽调整幻灯片顺序同步数据
  const sortSlides = (newIndex: number, oldIndex: number) => {
    if (oldIndex === newIndex) return

    const _slides: Slide[] = JSON.parse(JSON.stringify(slides))

    const movingSlide = _slides[oldIndex]
    const movingSlideSection = movingSlide.sectionTag
    if (movingSlideSection) {
      const movingSlideSectionNext = _slides[oldIndex + 1]
      delete movingSlide.sectionTag
      if (movingSlideSectionNext && !movingSlideSectionNext.sectionTag) {
        movingSlideSectionNext.sectionTag = movingSlideSection
      }
    }
    if (newIndex === 0) {
      const firstSection = _slides[0].sectionTag
      if (firstSection) {
        delete _slides[0].sectionTag
        movingSlide.sectionTag = firstSection
      }
    }

    const _slide = _slides[oldIndex]
    _slides.splice(oldIndex, 1)
    _slides.splice(newIndex, 0, _slide)
    setSlides(_slides)
    updateSlideIndexAction(newIndex)
  }

  const isEmptySlide = useMemo(() => {
    if (slides.length > 1) return false
    if (slides[0].elements.length > 0) return false
    return true
  }, [slides])

  return {
    resetSlides,
    updateSlideIndex,
    copySlide,
    pasteSlide,
    createSlide,
    createSlideByTemplate,
    copyAndPasteSlide,
    deleteSlide,
    cutSlide,
    selectAllSlide,
    sortSlides,
    isEmptySlide,
  }
}
