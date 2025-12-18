import React from 'react'
import type { PPTChartElement } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import ElementOutline from '@/views/components/element/ElementOutline'
import Chart from './Chart'
import { ElementProps } from '../types'
import './index.scss'

const ChartElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTChartElement

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e, element)
  }

  const openDataEditor = () => {
    emitter.emit(EmitterEvents.OPEN_CHART_DATA_EDITOR)
  }

  return (
    <div 
      className="editable-element-chart"
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
          style={{ backgroundColor: element.fill }}
          // v-contextmenu="contextmenus"
          onMouseDown={handleSelectElement}
          onTouchStart={handleSelectElement}
          onDoubleClick={openDataEditor}
        >
          <ElementOutline
            width={element.width}
            height={element.height}
            outline={element.outline}
          />
          <Chart
            width={element.width}
            height={element.height}
            type={element.chartType}
            data={element.data}
            themeColors={element.themeColors}
            textColor={element.textColor}
            lineColor={element.lineColor}
            options={element.options}
          />
        </div>
      </div>
    </div>
  )
}

export default ChartElement
