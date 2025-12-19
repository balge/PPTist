import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useMainStore, useKeyboardStore } from '@/store'
import type { CreateElementSelectionData } from '@/types/edit'
import clsx from 'clsx'
import './ElementCreateSelection.scss'

interface ElementCreateSelectionProps {
  onCreated: (payload: CreateElementSelectionData) => void
}

const ElementCreateSelection: React.FC<ElementCreateSelectionProps> = ({ onCreated }) => {
  const { creatingElement, setCreatingElement } = useMainStore()
  const { ctrlOrShiftKeyActive } = useKeyboardStore()

  const [start, setStart] = useState<[number, number] | null>(null)
  const [end, setEnd] = useState<[number, number] | null>(null)
  
  const selectionRef = useRef<HTMLDivElement>(null)
  const offset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (!selectionRef.current) return
    const { x, y } = selectionRef.current.getBoundingClientRect()
    offset.current = { x, y }
  }, [])

  const lineData = useMemo(() => {
    if (!start || !end) return null
    if (!creatingElement || creatingElement.type !== 'line') return null

    const [_startX, _startY] = start
    const [_endX, _endY] = end
    const minX = Math.min(_startX, _endX)
    const maxX = Math.max(_startX, _endX)
    const minY = Math.min(_startY, _endY)
    const maxY = Math.max(_startY, _endY)

    const svgWidth = maxX - minX >= 24 ? maxX - minX : 24
    const svgHeight = maxY - minY >= 24 ? maxY - minY : 24

    const startX = _startX === minX ? 0 : maxX - minX
    const startY = _startY === minY ? 0 : maxY - minY
    const endX = _endX === minX ? 0 : maxX - minX
    const endY = _endY === minY ? 0 : maxY - minY

    const path = `M${startX}, ${startY} L${endX}, ${endY}`

    return {
      svgWidth,
      svgHeight,
      path,
    }
  }, [start, end, creatingElement])

  const position = useMemo(() => {
    if (!start || !end) return {}

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const width = maxX - minX
    const height = maxY - minY

    return {
      left: minX - offset.current.x + 'px',
      top: minY - offset.current.y + 'px',
      width: width + 'px',
      height: height + 'px',
    }
  }, [start, end])

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation()
    let isMouseDown = true

    const startPageX = e.pageX
    const startPageY = e.pageY
    setStart([startPageX, startPageY])

    const onMouseMove = (e: MouseEvent) => {
      if (!creatingElement || !isMouseDown) return

      let currentPageX = e.pageX
      let currentPageY = e.pageY

      if (ctrlOrShiftKeyActive) {
        const moveX = currentPageX - startPageX
        const moveY = currentPageY - startPageY

        const absX = Math.abs(moveX)
        const absY = Math.abs(moveY)

        if (creatingElement.type === 'shape') {
          const isOpposite = (moveY > 0 && moveX < 0) || (moveY < 0 && moveX > 0)

          if (absX > absY) {
            currentPageY = isOpposite ? startPageY - moveX : startPageY + moveX
          }
          else {
            currentPageX = isOpposite ? startPageX - moveY : startPageX + moveY
          }
        }
        else if (creatingElement.type === 'line') {
          if (absX > absY) currentPageY = startPageY
          else currentPageX = startPageX
        }
      }

      setEnd([currentPageX, currentPageY])
    }

    const onMouseUp = (e: MouseEvent) => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)

      if (e.button === 2) {
        setTimeout(() => setCreatingElement(null), 0)
        return
      }

      isMouseDown = false

      const endPageX = e.pageX
      const endPageY = e.pageY

      const minSize = 30
      
      let finalEndX = endPageX
      let finalEndY = endPageY
      
      if (ctrlOrShiftKeyActive && creatingElement) {
        const moveX = endPageX - startPageX
        const moveY = endPageY - startPageY
        const absX = Math.abs(moveX)
        const absY = Math.abs(moveY)
         
        if (creatingElement.type === 'shape') {
          const isOpposite = (moveY > 0 && moveX < 0) || (moveY < 0 && moveX > 0)
          if (absX > absY) {
            finalEndY = isOpposite ? startPageY - moveX : startPageY + moveX
          }
          else {
            finalEndX = isOpposite ? startPageX - moveY : startPageX + moveY
          }
        }
        else if (creatingElement.type === 'line') {
          if (absX > absY) finalEndY = startPageY
          else finalEndX = startPageX
        }
      }

      if (
        creatingElement?.type === 'line' &&
        (Math.abs(finalEndX - startPageX) >= minSize || Math.abs(finalEndY - startPageY) >= minSize)
      ) {
        onCreated({
          start: [startPageX, startPageY],
          end: [finalEndX, finalEndY],
        })
      }
      else if (
        creatingElement?.type !== 'line' &&
        (Math.abs(finalEndX - startPageX) >= minSize && Math.abs(finalEndY - startPageY) >= minSize)
      ) {
        onCreated({
          start: [startPageX, startPageY],
          end: [finalEndX, finalEndY],
        })
      }
      else {
        const defaultSize = 200
        const minX = Math.min(finalEndX, startPageX)
        const minY = Math.min(finalEndY, startPageY)
        const maxX = Math.max(finalEndX, startPageX)
        const maxY = Math.max(finalEndY, startPageY)
        const offsetX = maxX - minX >= minSize ? maxX - minX : defaultSize
        const offsetY = maxY - minY >= minSize ? maxY - minY : defaultSize
        onCreated({
          start: [minX, minY],
          end: [minX + offsetX, minY + offsetY],
        })
      }
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return (
    <div 
      className="element-create-selection"
      ref={selectionRef}
      onMouseDown={handleMouseDown}
      onContextMenu={(e) => {
        e.stopPropagation(); e.preventDefault() 
      }}
    >
      {start && end && (
        <div 
          className={clsx('selection', creatingElement?.type)} 
          style={position}
        >
          {creatingElement?.type === 'line' && lineData && (
            <svg
              overflow="visible" 
              width={lineData.svgWidth}
              height={lineData.svgHeight}
            >
              <path
                d={lineData.path} 
                stroke="#d14424" 
                fill="none" 
                strokeWidth="2" 
              ></path>
            </svg>
          )}
        </div>
      )}
    </div>
  )
}

export default ElementCreateSelection
