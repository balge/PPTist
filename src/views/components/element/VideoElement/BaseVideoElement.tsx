import React from 'react'
import type { PPTVideoElement } from '@/types/slides'
import styles from './BaseVideoElement.module.scss'
import { PlayOne } from '@icon-park/react'

interface BaseVideoElementProps {
  elementInfo: PPTVideoElement;
}

const BaseVideoElement: React.FC<BaseVideoElementProps> = ({ elementInfo }) => {
  return (
    <div
      className={styles.baseElementVideo}
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
            backgroundImage: elementInfo.poster
              ? `url(${elementInfo.poster})`
              : '',
          }}
        >
          <div className={styles.icon}>
            <PlayOne />
          </div>
        </div>
      </div>
    </div>
  )
}

export default BaseVideoElement
