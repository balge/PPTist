import React from 'react'
import type { PPTChartElement } from '@/types/slides'
import ElementOutline from '@/views/components/element/ElementOutline'
import Chart from './Chart'
import './BaseChartElement.scss'

interface BaseChartElementProps {
  elementInfo: PPTChartElement
}

const BaseChartElement: React.FC<BaseChartElementProps> = ({ elementInfo }) => {
  return (
    <div 
      className="base-element-chart"
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
