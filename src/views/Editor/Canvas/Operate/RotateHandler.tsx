import React from 'react'
import styles from './RotateHandler.module.scss'

interface RotateHandlerProps {
  style?: React.CSSProperties;
  onMouseDown?: (e: React.MouseEvent) => void;
}

const RotateHandler: React.FC<RotateHandlerProps> = ({
  style,
  onMouseDown,
}) => {
  return (
    <div className={styles.rotateHandler} style={style} onMouseDown={onMouseDown} />
  )
}

export default RotateHandler
