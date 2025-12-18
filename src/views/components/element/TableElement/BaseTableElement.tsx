import React from 'react'
import type { PPTTableElement } from '@/types/slides'
import StaticTable from './StaticTable'
import './BaseTableElement.scss'

interface BaseTableElementProps {
  elementInfo: PPTTableElement
}

const BaseTableElement: React.FC<BaseTableElementProps> = ({ elementInfo }) => {
  return (
    <div 
      className="base-element-table"
      style={{
        top: elementInfo.top + 'px',
        left: elementInfo.left + 'px',
        width: elementInfo.width + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${elementInfo.rotate}deg)` }}
      >
        <div className="element-content">
          <StaticTable
            data={elementInfo.data}
            width={elementInfo.width}
            cellMinHeight={elementInfo.cellMinHeight}
            colWidths={elementInfo.colWidths}
            outline={elementInfo.outline}
            theme={elementInfo.theme}
          />
        </div>
      </div>
    </div>
  )
}

export default BaseTableElement
