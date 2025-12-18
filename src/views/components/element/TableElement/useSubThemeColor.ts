import { useMemo } from 'react'
import type { TableTheme } from '@/types/slides'
import { getTableSubThemeColor } from '@/utils/element'

// 通过表格的主题色计算辅助颜色

export default (theme: TableTheme | undefined) => {
  const subThemeColor = useMemo(() => {
    if (theme) {
      return getTableSubThemeColor(theme.color)
    }
    return ['', '']
  }, [theme])

  return {
    subThemeColor,
  }
}
