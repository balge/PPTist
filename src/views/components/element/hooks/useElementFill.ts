import type { PPTShapeElement } from '@/types/slides'
import { useMemo } from 'react'

// 计算元素的填充样式
export default (element: PPTShapeElement, source: string) => {
  const fill = useMemo(() => {
    if (element.pattern) return `url(#${source}-pattern-${element.id})`
    if (element.gradient) return `url(#${source}-gradient-${element.id})`
    return element.fill || 'none'
  }, [element.pattern, element.gradient, element.fill, element.id, source])

  return {
    fill,
  }
}
