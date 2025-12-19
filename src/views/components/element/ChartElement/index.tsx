import React, { useRef } from 'react'
import type { PPTChartElement } from '@/types/slides'
import emitter, { EmitterEvents } from '@/utils/emitter'
import ElementOutline from '@/views/components/element/ElementOutline'
import Chart from './Chart'
import styles from './index.module.scss'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import useContextMenu from '@/hooks/useContextMenu'

export interface ElementProps {
  elementInfo: PPTChartElement;
  selectElement: (
    e: MouseEvent | TouchEvent,
    element: PPTChartElement,
    canMove?: boolean
  ) => void;
  contextmenus: () => ContextmenuItem[] | null;
}

const ChartElement: React.FC<ElementProps> = ({
  elementInfo,
  selectElement,
  contextmenus,
}) => {
  const contentRef = useRef<HTMLDivElement>(null)
  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    selectElement?.(e.nativeEvent, elementInfo)
  }

  const openDataEditor = () => {
    emitter.emit(EmitterEvents.OPEN_CHART_DATA_EDITOR)
  }

  /**
   * 绑定右键菜单到内容容器
   */
  useContextMenu(contentRef, () => contextmenus?.() || [])

  return (
    <div
      className={styles.editableElementChart}
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
          ref={contentRef}
          className={styles.elementContent}
          style={{ backgroundColor: elementInfo.fill }}
          onMouseDown={handleSelectElement}
          onTouchStart={handleSelectElement}
          onDoubleClick={openDataEditor}
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

export default ChartElement
