import React, { useMemo } from 'react'
import { useMainStore } from '@/store'
import { ElementTypes, PPTElement } from '@/types/slides'
import { OperateResizeHandlers, OperateLineHandlers } from '@/types/edit'

import CommonElementOperate from './CommonElementOperate'
import ImageElementOperate from './ImageElementOperate'
import TextElementOperate from './TextElementOperate'
import ShapeElementOperate from './ShapeElementOperate'
import LineElementOperate from './LineElementOperate'
import TableElementOperate from './TableElementOperate'
import LinkHandler from './LinkHandler'
import './index.scss'

interface OperateProps {
  elementInfo: PPTElement
  isSelected: boolean
  isActive: boolean
  isActiveGroupElement: boolean
  isMultiSelect: boolean
  rotateElement?: (e: React.MouseEvent, element: any) => void
  scaleElement?: (e: React.MouseEvent, element: any, command: OperateResizeHandlers) => void
  dragLineElement?: (e: React.MouseEvent, element: any, command: OperateLineHandlers) => void
  moveShapeKeypoint?: (e: React.MouseEvent, element: any, index: number) => void
  openLinkDialog?: () => void
}

const Operate: React.FC<OperateProps> = ({
  elementInfo,
  isSelected,
  isActive,
  isActiveGroupElement,
  isMultiSelect,
  rotateElement = () => {},
  scaleElement = () => {},
  dragLineElement = () => {},
  moveShapeKeypoint = () => {},
  openLinkDialog = () => {},
}) => {
  const { canvasScale } = useMainStore()

  const rotate = 'rotate' in elementInfo ? elementInfo.rotate || 0 : 0
  const height = 'height' in elementInfo ? elementInfo.height || 0 : 0

  const CurrentOperateComponent = useMemo(() => {
    const elementTypeMap = {
      [ElementTypes.IMAGE]: ImageElementOperate,
      [ElementTypes.TEXT]: TextElementOperate,
      [ElementTypes.SHAPE]: ShapeElementOperate,
      [ElementTypes.LINE]: LineElementOperate,
      [ElementTypes.TABLE]: TableElementOperate,
      [ElementTypes.CHART]: CommonElementOperate,
      [ElementTypes.LATEX]: CommonElementOperate,
      [ElementTypes.VIDEO]: CommonElementOperate,
      [ElementTypes.AUDIO]: CommonElementOperate,
    }
    return elementTypeMap[elementInfo.type] || null
  }, [elementInfo.type])

  if (!CurrentOperateComponent) return null

  const Component = CurrentOperateComponent as React.FC<any>

  return (
    <div
      className={`operate ${isMultiSelect && !isActive ? 'multi-select' : ''}`}
      style={{
        top: elementInfo.top * canvasScale + 'px',
        left: elementInfo.left * canvasScale + 'px',
        transform: `rotate(${rotate}deg)`,
        transformOrigin: `${(elementInfo.width * canvasScale) / 2}px ${
          (height * canvasScale) / 2
        }px`,
      }}
    >
      {isSelected && (
        <Component
          elementInfo={elementInfo}
          handlerVisible={isActiveGroupElement || !isMultiSelect}
          rotateElement={rotateElement}
          scaleElement={scaleElement}
          dragLineElement={dragLineElement}
          moveShapeKeypoint={moveShapeKeypoint}
        />
      )}
      {isActive && elementInfo.link && (
        <LinkHandler
          elementInfo={elementInfo}
          link={elementInfo.link}
          openLinkDialog={openLinkDialog}
        />
      )}
    </div>
  )
}

export default Operate
