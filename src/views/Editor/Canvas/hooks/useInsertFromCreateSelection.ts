import { type RefObject } from 'react'
import { useMainStore } from '@/store'
import type { CreateElementSelectionData } from '@/types/edit'
import useCreateElement from '@/hooks/useCreateElement'

export default (viewportRef: RefObject<HTMLElement | null>) => {
  const { canvasScale, creatingElement, setCreatingElement } = useMainStore()
  const { createTextElement, createShapeElement, createLineElement } = useCreateElement()

  // Calculate selection position and size based on start/end points
  const formatCreateSelection = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.current) return
    const viewportRect = viewportRef.current.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale
    const top = (minY - viewportRect.y) / canvasScale
    const width = (maxX - minX) / canvasScale
    const height = (maxY - minY) / canvasScale

    return { left, top, width, height }
  }

  // Calculate line position and start/end points based on selection
  const formatCreateSelectionForLine = (selectionData: CreateElementSelectionData) => {
    const { start, end } = selectionData

    if (!viewportRef.current) return
    const viewportRect = viewportRef.current.getBoundingClientRect()

    const [startX, startY] = start
    const [endX, endY] = end
    const minX = Math.min(startX, endX)
    const maxX = Math.max(startX, endX)
    const minY = Math.min(startY, endY)
    const maxY = Math.max(startY, endY)

    const left = (minX - viewportRect.x) / canvasScale
    const top = (minY - viewportRect.y) / canvasScale
    const width = (maxX - minX) / canvasScale
    const height = (maxY - minY) / canvasScale

    const _start: [number, number] = [
      startX === minX ? 0 : width,
      startY === minY ? 0 : height,
    ]
    const _end: [number, number] = [
      endX === minX ? 0 : width,
      endY === minY ? 0 : height,
    ]

    return {
      left,
      top,
      start: _start,
      end: _end,
    }
  }

  // Insert element based on selection data
  const insertElementFromCreateSelection = (selectionData: CreateElementSelectionData) => {
    if (!creatingElement) return

    const type = creatingElement.type
    if (type === 'text') {
      const position = formatCreateSelection(selectionData)
      position && createTextElement(position, { vertical: creatingElement.vertical })
    }
    else if (type === 'shape') {
      const position = formatCreateSelection(selectionData)
      // @ts-ignore: data property existence check
      position && createShapeElement(position, creatingElement.data)
    }
    else if (type === 'line') {
      const position = formatCreateSelectionForLine(selectionData)
      // @ts-ignore: data property existence check
      position && createLineElement(position, creatingElement.data)
    }
    setCreatingElement(null)
  }

  return {
    formatCreateSelection,
    insertElementFromCreateSelection,
  }
}
