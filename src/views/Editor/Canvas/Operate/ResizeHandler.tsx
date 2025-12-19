import React, { useMemo } from 'react'
import type { OperateResizeHandlers } from '@/types/edit'
import clsx from 'clsx'
import styles from './ResizeHandler.module.scss'

interface ResizeHandlerProps {
  type: OperateResizeHandlers;
  rotate?: number;
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const ResizeHandler: React.FC<ResizeHandlerProps> = ({
  type,
  rotate = 0,
  style,
  onMouseDown,
}) => {
  const rotateClassName = useMemo(() => {
    const prefix = 'rotate-'
    const r = rotate
    if (r > -22.5 && r <= 22.5) return prefix + 0
    else if (r > 22.5 && r <= 67.5) return prefix + 45
    else if (r > 67.5 && r <= 112.5) return prefix + 90
    else if (r > 112.5 && r <= 157.5) return prefix + 135
    else if (r > 157.5 || r <= -157.5) return prefix + 0
    else if (r > -157.5 && r <= -112.5) return prefix + 45
    else if (r > -112.5 && r <= -67.5) return prefix + 90
    else if (r > -67.5 && r <= -22.5) return prefix + 135
    return prefix + 0
  }, [rotate])

  return (
    <div
      className={clsx(
        styles.resizeHandler,
        styles[rotateClassName],
        styles[type]
      )}
      style={style}
      onMouseDown={onMouseDown}
    />
  )
}

export default ResizeHandler
