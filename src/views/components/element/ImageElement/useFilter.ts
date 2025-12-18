import { useMemo } from 'react'
import type { ImageElementFilters, ImageElementFilterKeys } from '@/types/slides'

export default (filters: ImageElementFilters | undefined) => {
  const filter = useMemo(() => {
    if (!filters) return ''
    let filter = ''
    const keys = Object.keys(filters) as ImageElementFilterKeys[]
    for (const key of keys) {
      filter += `${key}(${filters[key]}) `
    }
    return filter
  }, [filters])

  return {
    filter,
  }
}
