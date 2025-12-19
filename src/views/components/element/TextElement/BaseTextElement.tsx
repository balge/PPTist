import React from 'react'
import clsx from 'clsx'
import type { PPTTextElement } from '@/types/slides'
import ElementOutline from '@/views/components/element/ElementOutline'
import useElementShadow from '@/views/components/element/hooks/useElementShadow'
import styles from './BaseTextElement.module.scss'

interface BaseTextElementProps {
  elementInfo: PPTTextElement;
  target?: string;
}

const BaseTextElement: React.FC<BaseTextElementProps> = ({
  elementInfo,
  target,
}) => {
  const { shadowStyle } = useElementShadow(elementInfo.shadow)

  return (
    <div
      className={styles.baseElementText}
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
        width: elementInfo.width + 'px',
        height: elementInfo.height + 'px',
      }}
    >
      <div
        className={styles.rotateWrapper}
        style={{ transform: `rotate(${elementInfo.rotate}deg)` }}
      >
        <div
          className={styles.elementContent}
          style={{
            width: elementInfo.vertical ? 'auto' : elementInfo.width + 'px',
            height: elementInfo.vertical ? elementInfo.height + 'px' : 'auto',
            backgroundColor: elementInfo.fill,
            opacity: elementInfo.opacity,
            textShadow: shadowStyle,
            lineHeight: elementInfo.lineHeight,
            letterSpacing: (elementInfo.wordSpace || 0) + 'px',
            color: elementInfo.defaultColor,
            fontFamily: elementInfo.defaultFontName,
            writingMode: elementInfo.vertical ? 'vertical-rl' : 'horizontal-tb',
          }}
        >
          <ElementOutline
            width={elementInfo.width}
            height={elementInfo.height}
            outline={elementInfo.outline}
          />
          <div
            className={clsx(styles.text, 'ProseMirror-static', {
              [styles.thumbnail]: target === 'thumbnail',
            })}
            style={
              {
                '--paragraphSpace': `${
                  elementInfo.paragraphSpace === undefined
                    ? 5
                    : elementInfo.paragraphSpace
                }px`,
              } as React.CSSProperties
            }
            dangerouslySetInnerHTML={{ __html: elementInfo.content }}
          ></div>
        </div>
      </div>
    </div>
  )
}

export default BaseTextElement
