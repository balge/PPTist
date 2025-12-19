import React from 'react'
import type { PPTLatexElement } from '@/types/slides'
import styles from './BaseLatexElement.module.scss'

interface BaseLatexElementProps {
  elementInfo: PPTLatexElement;
}

const BaseLatexElement: React.FC<BaseLatexElementProps> = ({ elementInfo }) => {
  return (
    <div
      className={styles.baseElementLatex}
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
        <div className={styles.elementContent}>
          <svg
            overflow="visible"
            width={elementInfo.width}
            height={elementInfo.height}
            stroke={elementInfo.color}
            strokeWidth={elementInfo.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <g
              transform={`scale(${
                elementInfo.width / elementInfo.viewBox[0]
              }, ${
                elementInfo.height / elementInfo.viewBox[1]
              }) translate(0,0) matrix(1,0,0,1,0,0)`}
            >
              <path d={elementInfo.path}></path>
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default BaseLatexElement
