import React, { useMemo, useRef } from 'react'
import clsx from 'clsx'
import { useMainStore, useSlidesStore } from '@/store'
import { fillDigit } from '@/utils/common'
import ThumbnailSlide from '@/views/components/ThumbnailSlide'
import useContextMenu from '@/hooks/useContextMenu'
import useSlideHandler from '@/hooks/useSlideHandler'
import './index.scss'

interface ThumbnailItemProps {
  slide: any
  index: number
  selected: boolean
  active: boolean
  onClick: (e: React.MouseEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  slide,
  index,
  selected,
  active,
  onClick,
  onMouseDown,
}) => {
  const itemRef = useRef<HTMLDivElement>(null)
  const {
    copySlide,
    pasteSlide,
    cutSlide,
    deleteSlide,
    copyAndPasteSlide,
    createSlide,
  } = useSlideHandler()

  const contextmenus = () => [
    { text: '剪切', subText: 'Ctrl + X', handler: cutSlide },
    { text: '复制', subText: 'Ctrl + C', handler: copySlide },
    { text: '粘贴', subText: 'Ctrl + V', handler: pasteSlide },
    { divider: true },
    { text: '新建页面', subText: 'Enter', handler: createSlide },
    { text: '复制页面', subText: 'Ctrl + D', handler: copyAndPasteSlide },
    { divider: true },
    { text: '删除页面', subText: 'Delete', handler: () => deleteSlide() },
  ]

  useContextMenu(itemRef, contextmenus)

  return (
    <div
      ref={itemRef}
      className={clsx('thumbnail-item', {
        active,
        selected,
      })}
      onClick={onClick}
      onMouseDown={onMouseDown}
    >
      <div className={clsx('label', { 'offset-left': index >= 99 })}>
        {fillDigit(index + 1, 2)}
      </div>
      <div className="thumbnail">
        <ThumbnailSlide slide={slide} size={120} />
      </div>
    </div>
  )
}

const Thumbnails: React.FC = () => {
  const { selectedSlidesIndex: _selectedSlidesIndex, setActiveElementIdList, updateSelectedSlidesIndex, setThumbnailsFocus } = useMainStore()
  const { slides, slideIndex, updateSlideIndex } = useSlidesStore()

  const selectedSlidesIndex = useMemo(() => [
    ..._selectedSlidesIndex,
    slideIndex,
  ], [_selectedSlidesIndex, slideIndex])

  const handleClickSlideThumbnail = (e: React.MouseEvent, index: number) => {
    // TODO: Handle multi-select (Ctrl/Shift)
    updateSelectedSlidesIndex([])
    setActiveElementIdList([])
    
    if (slideIndex === index) return
    updateSlideIndex(index)
  }

  const handleMouseDownSlideThumbnail = (e: React.MouseEvent, index: number) => {
    // Right click
    if (e.button === 2) {
      if (!selectedSlidesIndex.includes(index)) {
        updateSelectedSlidesIndex([])
        setActiveElementIdList([])
        updateSlideIndex(index)
      }
    }
  }

  return (
    <div 
      className="thumbnails"
      onMouseDown={() => setThumbnailsFocus(true)}
    >
      <div className="thumbnail-list">
        {slides.map((slide, index) => (
          <ThumbnailItem
            key={slide.id}
            slide={slide}
            index={index}
            active={slideIndex === index}
            selected={selectedSlidesIndex.includes(index)}
            onClick={(e) => handleClickSlideThumbnail(e, index)}
            onMouseDown={(e) => handleMouseDownSlideThumbnail(e, index)}
          />
        ))}
      </div>
    </div>
  )
}

export default Thumbnails
