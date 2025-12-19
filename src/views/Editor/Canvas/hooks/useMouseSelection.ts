import { useState, useRef, type RefObject } from 'react'
import { useMainStore, useKeyboardStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { getElementRange } from '@/utils/element'

export default (
  elementList: PPTElement[],
  viewportRef: RefObject<HTMLElement | null>
) => {
  const [isVisible, setIsVisible] = useState(false)
  const [selection, setSelection] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    quadrant: 1,
  })

  // Ref to track selection during drag without depending on state updates
  const selectionRef = useRef({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
    quadrant: 1,
  })

  const updateMouseSelection = (e: React.MouseEvent) => {
    if (!viewportRef.current) return

    e.stopPropagation()

    let isMouseDown = true
    const viewportRect = viewportRef.current.getBoundingClientRect()
    const { canvasScale, hiddenElementIdList, setActiveElementIdList } =
      useMainStore.getState()

    const minSelectionRange = 5

    const startPageX = e.pageX
    const startPageY = e.pageY

    const left = (startPageX - viewportRect.x) / canvasScale
    const top = (startPageY - viewportRect.y) / canvasScale

    // Init
    selectionRef.current = {
      top,
      left,
      width: 0,
      height: 0,
      quadrant: 4,
    }
    setSelection({ ...selectionRef.current })
    setIsVisible(false)

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return

      const currentPageX = e.pageX
      const currentPageY = e.pageY

      const offsetWidth = (currentPageX - startPageX) / canvasScale
      const offsetHeight = (currentPageY - startPageY) / canvasScale

      const width = Math.abs(offsetWidth)
      const height = Math.abs(offsetHeight)

      if (width < minSelectionRange || height < minSelectionRange) return

      let quadrant = 0
      if (offsetWidth > 0 && offsetHeight > 0) quadrant = 4
      else if (offsetWidth < 0 && offsetHeight < 0) quadrant = 2
      else if (offsetWidth > 0 && offsetHeight < 0) quadrant = 1
      else if (offsetWidth < 0 && offsetHeight > 0) quadrant = 3

      selectionRef.current = {
        ...selectionRef.current,
        width,
        height,
        quadrant,
      }

      setSelection({ ...selectionRef.current })
      setIsVisible(true)
    }

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      isMouseDown = false

      const { ctrlOrShiftKeyActive } = useKeyboardStore.getState()

      const currentSelection = selectionRef.current
      const mouseSelectionLeft = currentSelection.left
      const mouseSelectionTop = currentSelection.top
      const mouseSelectionWidth = currentSelection.width
      const mouseSelectionHeight = currentSelection.height
      const mouseSelectionQuadrant = currentSelection.quadrant

      let inRangeElementList: PPTElement[] = []

      // Use elementList from closure (might be stale if props changed during drag? unlikely for this interaction)
      // Ideally use a ref for elementList if it changes frequently.
      for (let i = 0; i < elementList.length; i++) {
        const element = elementList[i]
        const { minX, maxX, minY, maxY } = getElementRange(element)

        let isInclude = false
        if (ctrlOrShiftKeyActive) {
          if (mouseSelectionQuadrant === 4) {
            isInclude =
              maxX > mouseSelectionLeft &&
              minX < mouseSelectionLeft + mouseSelectionWidth &&
              maxY > mouseSelectionTop &&
              minY < mouseSelectionTop + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 2) {
            isInclude =
              maxX > mouseSelectionLeft - mouseSelectionWidth &&
              minX <
                mouseSelectionLeft -
                  mouseSelectionWidth +
                  mouseSelectionWidth &&
              maxY > mouseSelectionTop - mouseSelectionHeight &&
              minY <
                mouseSelectionTop - mouseSelectionHeight + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 1) {
            isInclude =
              maxX > mouseSelectionLeft &&
              minX < mouseSelectionLeft + mouseSelectionWidth &&
              maxY > mouseSelectionTop - mouseSelectionHeight &&
              minY <
                mouseSelectionTop - mouseSelectionHeight + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 3) {
            isInclude =
              maxX > mouseSelectionLeft - mouseSelectionWidth &&
              minX <
                mouseSelectionLeft -
                  mouseSelectionWidth +
                  mouseSelectionWidth &&
              maxY > mouseSelectionTop &&
              minY < mouseSelectionTop + mouseSelectionHeight
          }
        }
        else {
          if (mouseSelectionQuadrant === 4) {
            isInclude =
              minX > mouseSelectionLeft &&
              maxX < mouseSelectionLeft + mouseSelectionWidth &&
              minY > mouseSelectionTop &&
              maxY < mouseSelectionTop + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 2) {
            isInclude =
              minX > mouseSelectionLeft - mouseSelectionWidth &&
              maxX <
                mouseSelectionLeft -
                  mouseSelectionWidth +
                  mouseSelectionWidth &&
              minY > mouseSelectionTop - mouseSelectionHeight &&
              maxY <
                mouseSelectionTop - mouseSelectionHeight + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 1) {
            isInclude =
              minX > mouseSelectionLeft &&
              maxX < mouseSelectionLeft + mouseSelectionWidth &&
              minY > mouseSelectionTop - mouseSelectionHeight &&
              maxY <
                mouseSelectionTop - mouseSelectionHeight + mouseSelectionHeight
          }
          else if (mouseSelectionQuadrant === 3) {
            isInclude =
              minX > mouseSelectionLeft - mouseSelectionWidth &&
              maxX <
                mouseSelectionLeft -
                  mouseSelectionWidth +
                  mouseSelectionWidth &&
              minY > mouseSelectionTop &&
              maxY < mouseSelectionTop + mouseSelectionHeight
          }
        }

        if (isInclude && !hiddenElementIdList.includes(element.id)) {
          inRangeElementList.push(element)
        }
      }

      inRangeElementList = inRangeElementList.filter((inRangeElement) => {
        if (inRangeElement.groupId) {
          const inRangeElementIdList = inRangeElementList.map(
            (inRangeElement) => inRangeElement.id
          )
          const groupElementList = elementList.filter(
            (element) => element.groupId === inRangeElement.groupId
          )
          return groupElementList.every((groupElement) =>
            inRangeElementIdList.includes(groupElement.id)
          )
        }
        return true
      })
      const inRangeElementIdList = inRangeElementList.map(
        (inRangeElement) => inRangeElement.id
      )
      setActiveElementIdList(inRangeElementIdList)

      setIsVisible(false)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  return {
    selectionState: selection,
    mouseSelectionVisible: isVisible,
    updateMouseSelection,
  }
}
