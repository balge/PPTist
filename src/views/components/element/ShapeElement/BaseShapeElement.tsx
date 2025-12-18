import React, { useMemo } from 'react'
import clsx from 'clsx'
import { useSlidesStore } from '@/store'
import type { PPTShapeElement, ShapeText } from '@/types/slides'
import useElementOutline from '@/views/components/element/hooks/useElementOutline'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import useElementFlip from '@/views/components/element/hooks/useElementFlip'
import useElementFill from '@/views/components/element/hooks/useElementFill'

import GradientDefs from './GradientDefs'
import PatternDefs from './PatternDefs'
import './BaseShapeElement.scss'

interface BaseShapeElementProps {
  elementInfo: PPTShapeElement
}

const BaseShapeElement: React.FC<BaseShapeElementProps> = ({ elementInfo }) => {
  const { theme } = useSlidesStore()

  const { fill } = useElementFill(elementInfo, 'base')
  const { outlineWidth, outlineColor, strokeDashArray } = useElementOutline(elementInfo.outline)
  const { shadowStyle } = useElementShadow(elementInfo.shadow)
  const { flipStyle } = useElementFlip(elementInfo.flipH, elementInfo.flipV)

  const text = useMemo<ShapeText>(() => {
    const defaultText: ShapeText = {
      content: '',
      align: 'middle',
      defaultFontName: theme.fontName,
      defaultColor: theme.fontColor,
    }
    if (!elementInfo.text) return defaultText

    return elementInfo.text
  }, [elementInfo.text, theme])

  return (
    <div 
      className="base-element-shape"
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
          className="element-content"
          style={{
            opacity: elementInfo.opacity,
            filter: shadowStyle ? `drop-shadow(${shadowStyle})` : '',
            transform: flipStyle,
            color: text.defaultColor,
            fontFamily: text.defaultFontName,
          }}
        >
          <svg 
            overflow="visible" 
            width={elementInfo.width}
            height={elementInfo.height}
          >
            <defs>
              {elementInfo.pattern ? (
                <PatternDefs
                  id={`base-pattern-${elementInfo.id}`} 
                  src={elementInfo.pattern}
                />
              ) : elementInfo.gradient ? (
                <GradientDefs
                  id={`base-gradient-${elementInfo.id}`} 
                  type={elementInfo.gradient.type}
                  colors={elementInfo.gradient.colors}
                  rotate={elementInfo.gradient.rotate}
                />
              ) : null}
            </defs>
            <g 
              transform={`scale(${elementInfo.width / elementInfo.viewBox[0]}, ${elementInfo.height / elementInfo.viewBox[1]}) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path 
                vectorEffect="non-scaling-stroke" 
                strokeLinecap="butt" 
                strokeMiterlimit="8"
                d={elementInfo.path} 
                fill={fill}
                stroke={outlineColor}
                strokeWidth={outlineWidth} 
                strokeDasharray={strokeDashArray} 
              ></path>
            </g>
          </svg>

          <div className={clsx('shape-text', text.align)}>
            <div className="ProseMirror-static" dangerouslySetInnerHTML={{ __html: text.content }}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseShapeElement
