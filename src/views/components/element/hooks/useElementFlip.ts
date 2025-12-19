import { useMemo } from 'react'

// 计算元素的翻转样式
export default (flipH: boolean | undefined, flipV: boolean | undefined) => {
  const flipStyle = useMemo(() => {
    let style = ''

    if (flipH && flipV) style = 'rotateX(180deg) rotateY(180deg)'
    else if (flipV) style = 'rotateX(180deg)'
    else if (flipH) style = 'rotateY(180deg)'

    return style
  }, [flipH, flipV])

  return {
    flipStyle,
  }
}
