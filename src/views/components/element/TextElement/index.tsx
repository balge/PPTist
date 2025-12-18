import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react'
import { debounce } from 'lodash'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTTextElement } from '@/types/slides'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import ElementOutline from '@/views/components/element/ElementOutline'
import ProsemirrorEditor from '@/views/components/element/ProsemirrorEditor'
import { ElementProps } from '../types'
import './index.scss'

const TextElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTTextElement
  const { handleElementId, isScaling } = useMainStore()
  const { updateElement, deleteElement } = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const elementRef = useRef<HTMLDivElement>(null)

  const { shadowStyle } = useElementShadow(element.shadow)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent, canMove = true) => {
    e.stopPropagation()
    selectElement?.(e, element, canMove)
  }

  // 监听文本元素的尺寸变化
  const realHeightCache = useRef(-1)
  const realWidthCache = useRef(-1)

  useEffect(() => {
    if (!isScaling && handleElementId === element.id) {
        if (!element.vertical && realHeightCache.current !== -1) {
            updateElement({
                id: element.id,
                props: { height: realHeightCache.current },
            })
            realHeightCache.current = -1
        }
        if (element.vertical && realWidthCache.current !== -1) {
            updateElement({
                id: element.id,
                props: { width: realWidthCache.current },
            })
            realWidthCache.current = -1
        }
    }
  }, [isScaling, handleElementId, element.id, element.vertical, updateElement])

  const updateTextElementHeight = useCallback((entries: ResizeObserverEntry[]) => {
    const contentRect = entries[0].contentRect
    if (!elementRef.current) return

    const realHeight = contentRect.height + 20
    const realWidth = contentRect.width + 20

    if (!element.vertical && element.height !== realHeight) {
      if (!isScaling) {
        updateElement({
          id: element.id,
          props: { height: realHeight },
        })
      }
      else realHeightCache.current = realHeight
    }
    if (element.vertical && element.width !== realWidth) {
      if (!isScaling) {
        updateElement({
          id: element.id,
          props: { width: realWidth },
        })
      }
      else realWidthCache.current = realWidth
    }
  }, [element.vertical, element.height, element.width, element.id, isScaling, updateElement])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateTextElementHeight)
    if (elementRef.current) resizeObserver.observe(elementRef.current)
    return () => {
        if (elementRef.current) resizeObserver.unobserve(elementRef.current)
        resizeObserver.disconnect()
    }
  }, [updateTextElementHeight])

  const updateContent = (value: string, ignore = false) => {
    updateElement({
      id: element.id,
      props: { content: value },
    })
    
    if (!ignore) addHistorySnapshot()
  }

  const checkEmptyText = useMemo(() => debounce(() => {
    const pureText = element.content.replace(/<[^>]+>/g, '')
    if (!pureText) deleteElement(element.id)
  }, 300, { trailing: true }), [element.content, element.id, deleteElement])

  const isHandleElement = handleElementId === element.id
  
  // Watch for handleElementId change to check empty text when deselected
  const prevHandleElementId = useRef(handleElementId)
  useEffect(() => {
    if (prevHandleElementId.current === element.id && handleElementId !== element.id) {
        checkEmptyText()
    }
    prevHandleElementId.current = handleElementId
  }, [handleElementId, element.id, checkEmptyText])

  return (
    <div 
      className="editable-element-text" 
      style={{
        top: element.top + 'px',
        left: element.left + 'px',
        width: element.width + 'px',
        height: element.height + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${element.rotate}deg)` }}
      >
        <div 
          className="element-content"
          ref={elementRef}
          style={{
            width: element.vertical ? 'auto' : element.width + 'px',
            height: element.vertical ? element.height + 'px' : 'auto',
            backgroundColor: element.fill,
            opacity: element.opacity,
            textShadow: shadowStyle,
            lineHeight: element.lineHeight,
            letterSpacing: (element.wordSpace || 0) + 'px',
            color: element.defaultColor,
            fontFamily: element.defaultFontName,
            writingMode: element.vertical ? 'vertical-rl' : 'horizontal-tb',
          }}
          // v-contextmenu="contextmenus"
          onMouseDown={(e) => handleSelectElement(e)}
          onTouchStart={(e) => handleSelectElement(e)}
        >
          <ElementOutline
            width={element.width}
            height={element.height}
            outline={element.outline}
          />
          <ProsemirrorEditor
            // className="text" // TODO: Add className prop to ProsemirrorEditor
            elementId={element.id}
            defaultColor={element.defaultColor}
            defaultFontName={element.defaultFontName}
            editable={true}
            value={element.content}
            style={{
              '--paragraphSpace': `${element.paragraphSpace === undefined ? 5 : element.paragraphSpace}px`,
            } as React.CSSProperties}
            onUpdate={({ value, ignore }) => updateContent(value, ignore)}
            onMouseDown={(e) => handleSelectElement(e, false)}
          />

          <div className="drag-handler top"></div>
          <div className="drag-handler bottom"></div>
        </div>
      </div>
    </div>
  )
}

export default TextElement
