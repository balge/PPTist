import { useMemo } from 'react'
import { useMainStore } from '@/store'
import type { PPTElementOutline } from '@/types/slides'

export default (outline?: PPTElementOutline) => {
  const { canvasScale } = useMainStore()

  const outlineWidth = useMemo(() => {
    if (!outline?.width) return 0
    return outline.width * canvasScale
  }, [outline?.width, canvasScale])

  const outlineColor = useMemo(() => {
    return outline?.color || '#000'
  }, [outline?.color])

  const strokeDashArray = useMemo(() => {
    if (outline?.style === 'dashed') return '10 6'
    if (outline?.style === 'dotted') return '2 2'
    return '0 0'
  }, [outline?.style])

  return {
    outlineWidth,
    outlineColor,
    strokeDashArray,
  }
}
