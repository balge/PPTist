import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react'
import { useMainStore, useKeyboardStore, useSlidesStore } from '@/store'
import type { CreateCustomShapeData } from '@/types/edit'
import { KEYS } from '@/configs/hotkey'
import './ShapeCreateCanvas.scss'

interface ShapeCreateCanvasProps {
  onCreated: (payload: CreateCustomShapeData) => void
  onClose: () => void
}

const ShapeCreateCanvas: React.FC<ShapeCreateCanvasProps> = ({ onCreated, onClose }) => {
  const { setCreatingCustomShapeState } = useMainStore()
  const { ctrlOrShiftKeyActive } = useKeyboardStore()
  const { theme } = useSlidesStore()

  const shapeCanvasRef = useRef<HTMLDivElement>(null)
  const isMouseDown = useRef(false)
  const offset = useRef({ x: 0, y: 0 })

  const [mousePosition, setMousePosition] = useState<[number, number] | null>(null)
  const [points, setPoints] = useState<[number, number][]>([])
  const [closed, setClosed] = useState(false)

  useEffect(() => {
    if (!shapeCanvasRef.current) return
    const { x, y } = shapeCanvasRef.current.getBoundingClientRect()
    offset.current = { x, y }
  }, [])

  const getPoint = (e: React.MouseEvent, custom = false) => {
    let pageX = e.pageX - offset.current.x
    let pageY = e.pageY - offset.current.y

    if (custom) return { pageX, pageY }

    if (ctrlOrShiftKeyActive && points.length) {
      const [lastPointX, lastPointY] = points[points.length - 1]
      if (Math.abs(lastPointX - pageX) - Math.abs(lastPointY - pageY) > 0) {
        pageY = lastPointY
      }
      else pageX = lastPointX
    }
    return { pageX, pageY }
  }

  const updateMousePosition = (e: React.MouseEvent) => {
    if (isMouseDown.current) {
      const { pageX, pageY } = getPoint(e, true)
      setPoints(prev => [...prev, [pageX, pageY]])
      setMousePosition(null)
      return
    }

    const { pageX, pageY } = getPoint(e)
    setMousePosition([pageX, pageY])

    if (points.length >= 2) {
      const [firstPointX, firstPointY] = points[0]
      if (
        Math.abs(firstPointX - pageX) < 5 &&
        Math.abs(firstPointY - pageY) < 5
      ) {
        setClosed(true)
      }
      else setClosed(false)
    }
    else setClosed(false)
  }

  const path = useMemo(() => {
    let d = ''
    for (let i = 0; i < points.length; i++) {
      const point = points[i]
      if (i === 0) d += `M ${point[0]} ${point[1]} `
      else d += `L ${point[0]} ${point[1]} `
    }
    if (points.length && mousePosition) {
      d += `L ${mousePosition[0]} ${mousePosition[1]}`
    }
    return d
  }, [points, mousePosition])

  const getCreateData = (close = true) => {
    const xList = points.map((item) => item[0])
    const yList = points.map((item) => item[1])
    const minX = Math.min(...xList)
    const minY = Math.min(...yList)
    const maxX = Math.max(...xList)
    const maxY = Math.max(...yList)

    const formatedPoints = points.map((point) => {
      return [point[0] - minX, point[1] - minY]
    })

    let path = ''
    for (let i = 0; i < formatedPoints.length; i++) {
      const point = formatedPoints[i]
      if (i === 0) path += `M ${point[0]} ${point[1]} `
      else path += `L ${point[0]} ${point[1]} `
    }
    if (close) path += 'Z'

    const start: [number, number] = [
      minX + offset.current.x,
      minY + offset.current.y,
    ]
    const end: [number, number] = [maxX + offset.current.x, maxY + offset.current.y]
    const viewBox: [number, number] = [maxX - minX, maxY - minY]

    return {
      start,
      end,
      path,
      viewBox,
    }
  }

  const addPoint = (e: React.MouseEvent) => {
    const { pageX, pageY } = getPoint(e)
    isMouseDown.current = true

    if (closed) onCreated(getCreateData())
    else setPoints(prev => [...prev, [pageX, pageY]])

    const onMouseUp = () => {
      isMouseDown.current = false
      document.removeEventListener('mouseup', onMouseUp)
    }
    document.addEventListener('mouseup', onMouseUp)
  }

  const close = () => {
    onClose()
  }

  const create = useCallback(() => {
    onCreated({
      ...getCreateData(false),
      fill: 'rgba(0, 0, 0, 0)',
      outline: {
        width: 2,
        color: theme.themeColors[0],
        style: 'solid',
      },
    })
    close()
  }, [onCreated, theme, points])

  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const key = e.key.toUpperCase()
      if (key === KEYS.ESC) close()
      if (key === KEYS.ENTER) create()
    }
    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
    }
  }, [create])

  return (
    <div
      className="shape-create-canvas"
      ref={shapeCanvasRef}
      onMouseDown={(e) => { e.stopPropagation(); addPoint(e) }}
      onMouseMove={(e) => updateMousePosition(e)}
      onContextMenu={(e) => { e.stopPropagation(); e.preventDefault(); close() }}
    >
      <svg overflow="visible">
        <path
          d={path}
          stroke="#d14424"
          fill={closed ? 'rgba(226, 83, 77, 0.15)' : 'none'}
          strokeWidth="2"
        ></path>
      </svg>
    </div>
  )
}

export default ShapeCreateCanvas
