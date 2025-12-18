import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { PPTTableElement, TableCell } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

import EditableTable from './EditableTable'
import { ElementProps } from '../types'
import './index.scss'

const TableElement: React.FC<ElementProps> = ({ elementInfo, selectElement, contextmenus }) => {
  const element = elementInfo as PPTTableElement
  const { canvasScale, handleElementId, isScaling, setDisableHotkeysState, setSelectedTableCells } = useMainStore()
  const { updateElement } = useSlidesStore()
  const { addHistorySnapshot } = useHistorySnapshot()

  const elementRef = useRef<HTMLDivElement>(null)
  const [editable, setEditable] = useState(false)
  const realHeightCache = useRef(-1)

  const handleSelectElement = (e: React.MouseEvent | React.TouchEvent, canMove = true) => {
    e.stopPropagation()
    selectElement?.(e, element, canMove)
  }

  // Handle editable state change and hotkeys disabling
  useEffect(() => {
    if (handleElementId !== element.id) setEditable(false)
  }, [handleElementId, element.id])

  useEffect(() => {
    setDisableHotkeysState(editable)
  }, [editable, setDisableHotkeysState])

  const startEdit = () => {
    setEditable(true)
  }

  // Handle scaling and height updates
  useEffect(() => {
    if (handleElementId !== element.id) return

    if (isScaling) setEditable(false)

    if (!isScaling && realHeightCache.current !== -1) {
      updateElement({
        id: element.id,
        props: { height: realHeightCache.current },
      })
      realHeightCache.current = -1
    }
  }, [isScaling, handleElementId, element.id, updateElement])

  const updateTableElementHeight = useCallback((entries: ResizeObserverEntry[]) => {
    const contentRect = entries[0].contentRect
    if (!elementRef.current) return

    const realHeight = contentRect.height

    if (element.height !== realHeight) {
      if (!isScaling) {
        updateElement({
          id: element.id,
          props: { height: realHeight },
        })
      }
      else realHeightCache.current = realHeight
    }
  }, [element.height, element.id, isScaling, updateElement])

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateTableElementHeight)
    if (elementRef.current) resizeObserver.observe(elementRef.current)
    return () => {
      if (elementRef.current) resizeObserver.unobserve(elementRef.current)
      resizeObserver.disconnect()
    }
  }, [updateTableElementHeight])

  const updateTableCells = (data: TableCell[][]) => {
    updateElement({
      id: element.id, 
      props: { data },
    })
    addHistorySnapshot()
  }

  const updateColWidths = (widths: number[]) => {
    const width = widths.reduce((a, b) => a + b)
    const colWidths = widths.map(item => item / width)

    updateElement({
      id: element.id, 
      props: { width, colWidths },
    })
    addHistorySnapshot()
  }

  const updateSelectedCells = (cells: string[]) => {
    // We use setTimeout to avoid update loop if needed, but here it should be fine
    setTimeout(() => setSelectedTableCells(cells), 0)
  }

  return (
    <div 
      className="editable-element-table"
      ref={elementRef}
      style={{
        top: element.top + 'px',
        left: element.left + 'px',
        width: element.width + 'px',
      }}
    >
      <div
        className="rotate-wrapper"
        style={{ transform: `rotate(${element.rotate}deg)` }}
      >
        <div 
          className="element-content" 
          // v-contextmenu="contextmenus"
        >
          <EditableTable 
            data={element.data}
            width={element.width}
            cellMinHeight={element.cellMinHeight}
            colWidths={element.colWidths}
            outline={element.outline}
            theme={element.theme}
            editable={editable}
            onChange={updateTableCells}
            onChangeColWidths={updateColWidths}
            onChangeSelectedCells={updateSelectedCells}
            onMouseDown={(e) => e.stopPropagation()}
            contextmenus={(el) => []} // TODO: Implement context menus
          />
          {!editable && (
            <div 
              className="table-mask" 
              onDoubleClick={startEdit}
              onMouseDown={handleSelectElement}
              onTouchStart={handleSelectElement}
            >
              {handleElementId === element.id && (
                <div 
                  className="mask-tip" 
                  style={{ transform: `scale(${ 1 / canvasScale })` }}
                >
                  双击编辑
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableElement
