import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTShapeElement, ShapeText } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementFlip from '@/views/components/element/hooks/useElementFlip'
import useElementFill from '@/views/components/element/hooks/useElementFill'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import GradientDefs from './GradientDefs'
import PatternDefs from './PatternDefs'
import ProsemirrorEditor, { ProsemirrorEditorRef } from '@/views/components/element/ProsemirrorEditor'
import { ElementProps } from '../types'
import './index.scss'

const ShapeElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTShapeElement
  
  const { handleElementId, shapeFormatPainter, setShapeFormatPainter } = useMainStore()
  const { theme, updateElement, removeElementProps } = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const { fill } = useElementFill(element, 'editable')
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(element.outline)
  const { shadowStyle } = useElementShadow(element.shadow)
  const { flipStyle } = useElementFlip(element.flipH, element.flipV)

  const [editable, setEditable] = useState(false)
  const prosemirrorEditorRef = useRef<ProsemirrorEditorRef>(null)

  const text = useMemo<ShapeText>(() => {
    const defaultText: ShapeText = {
      content: '',
      align: 'middle',
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
    }
    if (!element.text) return defaultText

    return element.text
  }, [element.text, theme])

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent, canMove = true) => {
    e.stopPropagation()
    selectElement?.(e, element, canMove)
  }

  const execFormatPainter = () => {
    if (!shapeFormatPainter) return
    const { keep, ...newProps } = shapeFormatPainter

    updateElement({
      id: element.id,
      props: newProps,
    })

    addHistorySnapshot()
    if (!keep) setShapeFormatPainter(null)
  }

  useEffect(() => {
    if (handleElementId !== element.id) {
      if (editable) setEditable(false)
    }
  }, [handleElementId, element.id, editable])

  const updateText = (content: string, ignore = false) => {
    const _text = { ...text, content }
    updateElement({
      id: element.id,
      props: { text: _text },
    })

    if (!ignore) addHistorySnapshot()
  }

  const checkEmptyText = () => {
    if (!element.text) return

    const pureText = element.text.content.replace(/<[^>]+>/g, '')
    if (!pureText) {
      removeElementProps({
        id: element.id,
        propName: 'text',
      })
      addHistorySnapshot()
    }
  }

  const startEdit = () => {
    setEditable(true)
    setTimeout(() => prosemirrorEditorRef.current?.focus(), 0)
  }

  return (
    <div 
      className={clsx('editable-element-shape', { 'format-painter': shapeFormatPainter })}
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
          style={{
            opacity: element.opacity,
            filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
            transform: flipStyle,
            color: text.defaultColor,
            fontFamily: text.defaultFontName,
          }}
          // v-contextmenu="contextmenus"
          onMouseDown={handleSelectElement}
          onMouseUp={execFormatPainter}
          onTouchStart={handleSelectElement}
          onDoubleClick={startEdit}
        >
          <svg 
            overflow="visible" 
            width={element.width}
            height={element.height}
          >
            <defs>
              {element.pattern ? (
                <PatternDefs
                  id={`editable-pattern-${element.id}`} 
                  src={element.pattern}
                />
              ) : element.gradient ? (
                <GradientDefs
                  id={`editable-gradient-${element.id}`} 
                  type={element.gradient.type}
                  colors={element.gradient.colors}
                  rotate={element.gradient.rotate}
                />
              ) : null}
            </defs>
            <g 
              transform={`scale(${element.width / element.viewBox[0]}, ${element.height / element.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path 
                className="shape-path"
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="butt" 
                strokeMiterlimit="8"
                d={element.path} 
                fill={fill}
                stroke={outlineColor}
                strokeWidth={outlineWidth} 
                strokeDasharray={strokeDashArray} 
              ></path>
            </g>
          </svg>

          <div className={clsx('shape-text', text.align, { editable: editable || text.content })}>
            {(editable || text.content) && (
              <ProsemirrorEditor
                ref={prosemirrorEditorRef}
                elementId={element.id}
                defaultColor={text.defaultColor}
                defaultFontName={text.defaultFontName}
                editable={true}
                value={text.content}
                onUpdate={({ value, ignore }) => updateText(value, ignore)}
                onBlur={checkEmptyText}
                onMouseDown={(e) => handleSelectElement(e, false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShapeElement
