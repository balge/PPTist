import React, { useMemo, useRef } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTAudioElement } from '@/types/slides'
import AudioPlayer from './AudioPlayer'
import './index.scss'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import { VolumeNotice } from '@icon-park/react'
import useContextMenu from '@/hooks/useContextMenu'

export interface ElementProps {
  elementInfo: PPTAudioElement;
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTAudioElement,
    canMove?: boolean
  ) => void;
  contextmenus: () => ContextmenuItem[] | null;
}

const AudioElement: React.FC<ElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  /**
   * 组件入口：渲染音频元素及控制条，并绑定右键菜单与选择事件
   */
  const { canvasScale, handleElementId } = useMainStore()
  const { viewportRatio, viewportSize } = useSlidesStore()
  const contentRef = useRef<HTMLDivElement>(null)

  const audioIconSize = useMemo(() => {
    return Math.min(elementInfo.width, elementInfo.height) + 'px'
  }, [elementInfo.width, elementInfo.height])

  const audioPlayerPosition = useMemo(() => {
    const canvasWidth = viewportSize
    const canvasHeight = viewportSize * viewportRatio

    const audioWidth = 280 / canvasScale
    const audioHeight = 50 / canvasScale

    const elWidth = elementInfo.width
    const elHeight = elementInfo.height
    const elLeft = elementInfo.left
    const elTop = elementInfo.top

    let left = 0
    let top = elHeight

    if (elLeft + audioWidth >= canvasWidth) left = elWidth - audioWidth
    if (elTop + elHeight + audioHeight >= canvasHeight) top = -audioHeight

    return {
      left: left + 'px',
      top: top + 'px',
    }
  }, [
    viewportSize,
    viewportRatio,
    canvasScale,
    elementInfo.width,
    elementInfo.height,
    elementInfo.left,
    elementInfo.top,
  ])

  /**
   * 处理元素选择事件，转换为原生事件以匹配选择函数类型
   */
  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e.nativeEvent, elementInfo)
  }

  /**
   * 绑定右键菜单到内容容器
   */
  useContextMenu(contentRef, () => contextmenus?.() || [])

  return (
    <div
      className="editable-element-audio"
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
        width: elementInfo.width + 'px',
        height: elementInfo.height + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${elementInfo.rotate}deg)` }}
      >
        <div
          ref={contentRef}
          className="element-content"
          onMouseDown={(e) => handleSelectElement(e)}
          onTouchStart={(e) => handleSelectElement(e)}
        >
          <VolumeNotice
            className="audio-icon"
            style={{ fontSize: audioIconSize, color: elementInfo.color }}
          />

          {handleElementId === elementInfo.id && (
            <AudioPlayer
              className="audio-player"
              style={{ ...audioPlayerPosition }}
              src={elementInfo.src}
              loop={elementInfo.loop}
              scale={canvasScale}
              onMouseDown={(e) => e.stopPropagation()}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default AudioElement
