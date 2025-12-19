import React from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import GridLines from './GridLines'
import useSlideBackgroundStyle from '@/hooks/useSlideBackgroundStyle'
import styles from './ViewportBackground.module.scss'

const ViewportBackground: React.FC = () => {
  const { gridLineSize } = useMainStore()
  const { currentSlide } = useSlidesStore()
  const background = currentSlide?.background

  const { backgroundStyle } = useSlideBackgroundStyle(background)

  return (
    <div 
      className={styles.viewportBackground}
      style={backgroundStyle}
    >
      {gridLineSize > 0 && <GridLines />}
    </div>
  )
}

export default ViewportBackground
