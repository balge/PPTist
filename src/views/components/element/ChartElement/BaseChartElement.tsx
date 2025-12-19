import React from 'react'
import type { PPTChartElement } from '@/types/slides'
import ElementOutline from '@/views/components/element/ElementOutline'
import Chart from './Chart'
import styles from './BaseChartElement.module.scss'

interface BaseChartElementProps {
  elementInfo: PPTChartElement;
}

const BaseChartElement: React.FC<BaseChartElementProps> = ({ elementInfo }) => {
  return (
    <div
      className={styles.baseElementChart}
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
          style={{ backgroundColor: elementInfo.fill }}
        >
          <ElementOutline
            width={elementInfo.width}
            height={elementInfo.height}
            outline={elementInfo.outline}
          />
          <Chart
            width={elementInfo.width}
            height={elementInfo.height}
            type={elementInfo.chartType}
            data={elementInfo.data}
            themeColors={elementInfo.themeColors}
            textColor={elementInfo.textColor}
            lineColor={elementInfo.lineColor}
            options={elementInfo.options}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseChartElement
