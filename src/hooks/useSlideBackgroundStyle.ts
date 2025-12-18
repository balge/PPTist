import { useMemo } from 'react'
import type { SlideBackground } from '@/types/slides'

export default (background: SlideBackground | undefined) => {
  const backgroundStyle = useMemo(() => {
    if (!background) return { backgroundColor: '#fff' }

    const { type, color, image, gradient } = background

    // 纯色背景
    if (type === 'solid') {
      return { backgroundColor: color }
    }

    // 图片背景
    else if (type === 'image') {
      if (!image) return { backgroundColor: '#fff' }
      if (image.size === 'repeat') {
        return {
          backgroundImage: `url("${image.src}")`,
          backgroundRepeat: 'repeat',
          backgroundSize: 'contain',
        }
      }
      return {
        backgroundImage: `url("${image.src}")`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: image.size || 'cover',
      }
    }

    // 渐变背景
    else if (type === 'gradient') {
      const rotate = gradient?.rotate || 0
      const color1 = gradient?.colors[0].color || '#fff'
      const color2 = gradient?.colors[1].color || '#fff'
      
      if (gradient?.type === 'radial') {
        return { backgroundImage: `radial-gradient(${color1}, ${color2})` }
      }
      return { backgroundImage: `linear-gradient(${rotate}deg, ${color1}, ${color2})` }
    }

    return { backgroundColor: '#fff' }
  }, [background])

  return {
    backgroundStyle,
  }
}
