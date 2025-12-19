import React, { useMemo, useRef } from 'react'
import clsx from 'clsx'
import { useMainStore, useSlidesStore } from '@/store'
import { fillDigit } from '@/utils/common'
import ThumbnailSlide from '@/views/components/ThumbnailSlide'
import './index.scss'

interface ThumbnailItemProps {
  slide: any;
  index: number;
  selected: boolean;
  active: boolean;
  onClick: (e: React.MouseEvent) => void;
}

const ThumbnailItem: React.FC<ThumbnailItemProps> = ({
  slide,
  index,
  selected,
  active,
  onClick,
}) => {
  const itemRef = useRef<HTMLDivElement>(null)

  return (
    <div
      ref={itemRef}
      className={clsx('thumbnail-item', {
        active,
        selected,
      })}
      onClick={onClick}
    >
      <div className={clsx('label', { 'offset-left': index >= 99 })}>
        {fillDigit(index + 1, 2)}
      </div>
      <ThumbnailSlide className="thumbnail" slide={slide} size={120} />
    </div>
  )
}

const Thumbnails: React.FC<{ className?: string }> = ({ className }) => {
  const {
    selectedSlidesIndex: _selectedSlidesIndex,
    updateSelectedSlidesIndex,
  } = useMainStore()
  const { slides, slideIndex, updateSlideIndex } = useSlidesStore()

  const selectedSlidesIndex = useMemo(
    () => [..._selectedSlidesIndex, slideIndex],
    [_selectedSlidesIndex, slideIndex]
  )

  // 切换页面
  const changeSlideIndex = (index: number) => {
    updateSelectedSlidesIndex([])

    if (slideIndex === index) return
    updateSlideIndex(index)
  }

  // 点击缩略图
  const handleClickSlideThumbnail = (index: number) => {
    updateSelectedSlidesIndex([])
    changeSlideIndex(index)
  }

  return (
    <div className={clsx('thumbnails', className)}>
      <div className="thumbnail-list">
        {slides.map((slide, index) => (
          <div className="thumbnail-container" key={slide.id}>
            <ThumbnailItem
              slide={slide}
              index={index}
              active={slideIndex === index}
              selected={selectedSlidesIndex.includes(index)}
              onClick={() => handleClickSlideThumbnail(index)}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Thumbnails
