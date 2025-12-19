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
    return outline?.color || '#d14424'
  }, [outline?.color])

  const outlineStyle = useMemo(() => {
    return outline?.style || 'solid'
  }, [outline?.style])

  const strokeDashArray = useMemo(() => {
    const size = outlineWidth
    if (outlineStyle === 'dashed') {
      return size <= 6
        ? `${size * 4.5} ${size * 2}`
        : `${size * 4} ${size * 1.5}`
    }
    if (outlineStyle === 'dotted') {
      return size <= 6
        ? `${size * 1.8} ${size * 1.6}`
        : `${size * 1.5} ${size * 1.2}`
    }
    return '0 0'
  }, [outline?.style])

  return {
    outlineWidth,
    outlineColor,
    strokeDashArray,
  }
}
