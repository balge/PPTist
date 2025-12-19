import React, { useMemo, useRef, useState, useEffect } from 'react'
import { throttle } from 'lodash'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import { KEYS } from '@/configs/hotkey'
import type {
  AlignmentLineProps,
  OperateResizeHandlers,
  OperateLineHandlers,
} from '@/types/edit'
import useCreateElement from '@/hooks/useCreateElement'
import useSlideHandler from '@/hooks/useSlideHandler'
import useContextMenu from '@/hooks/useContextMenu'
import useClickOutside from '@/hooks/useClickOutside'
import { removeAllRanges } from '@/utils/selection'

import useViewportSize from './hooks/useViewportSize'
import useMouseSelection from './hooks/useMouseSelection'
import useDrop from './hooks/useDrop'
import useInsertFromCreateSelection from './hooks/useInsertFromCreateSelection'
import useDragElement from './hooks/useDragElement'
import useSelectElement from './hooks/useSelectElement'
import useRotateElement from './hooks/useRotateElement'
import useScaleElement from './hooks/useScaleElement'
import useDragLineElement from './hooks/useDragLineElement'
import useMoveShapeKeypoint from './hooks/useMoveShapeKeypoint'

import ViewportBackground from './ViewportBackground'
import Operate from './Operate'
import AlignmentLine from './AlignmentLine'
import ElementCreateSelection from './ElementCreateSelection'
import ShapeCreateCanvas from './ShapeCreateCanvas'
import MouseSelection from './MouseSelection'
import MultiSelectOperate from './Operate/MultiSelectOperate'
import EditableElement from './EditableElement'
import LinkDialog from './LinkDialog'
import styles from './index.module.scss'

/**
 * Canvas 组件：承载编辑区域渲染、元素选择与操作、视口缩放与拖拽等核心交互
 */
const Canvas: React.FC = () => {
  const {
    canvasScale,
    activeElementIdList,
    handleElementId,
    activeGroupElementId,
    hiddenElementIdList,
    creatingElement,
    creatingCustomShape,
    setActiveElementIdList,
    setActiveGroupElementId,
    editorAreaFocus,
    textFormatPainter,
    setEditorareaFocus,
    setTextFormatPainter,
  } = useMainStore()
  const { currentSlide } = useSlidesStore()
  const { spaceKeyState } = useKeyboardStore()
  const { createCustomShapeElement, createTextElement } = useCreateElement()
  const { updateSlideIndex } = useSlideHandler()

  const containerRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const [linkDialogVisible, setLinkDialogVisible] = useState(false)

  const elementList = currentSlide?.elements || []

  const [alignmentLines, setAlignmentLines] = useState<AlignmentLineProps[]>(
    []
  )

  const setElementList = (
    newListOrUpdater: PPTElement[] | ((prev: PPTElement[]) => PPTElement[])
  ) => {
    const current = useSlidesStore.getState().currentSlide
    if (!current) return
    const next =
      typeof newListOrUpdater === 'function'
        ? newListOrUpdater(current.elements)
        : newListOrUpdater
    useSlidesStore.getState().updateSlide({ elements: next })
  }

  const { dragElement } = useDragElement(
    elementList,
    setElementList,
    setAlignmentLines
  )
  const { scaleElement, scaleMultiElement } = useScaleElement(
    elementList,
    setElementList,
    setAlignmentLines
  )
  const { rotateElement } = useRotateElement(
    elementList,
    setElementList,
    viewportRef
  )
  const { dragLineElement } = useDragLineElement(elementList, setElementList)
  const { moveShapeKeypoint } = useMoveShapeKeypoint(
    elementList,
    setElementList
  )

  const { viewportStyles, dragViewport } = useViewportSize(containerRef)
  const { selectionState, mouseSelectionVisible, updateMouseSelection } =
    useMouseSelection(elementList, viewportRef)

  useDrop(containerRef)
  const { insertElementFromCreateSelection } =
    useInsertFromCreateSelection(viewportRef)
  const { selectElement } = useSelectElement(elementList, dragElement)

  // TODO 暂时不要
  // const menus = useMemo(
  //   () => [
  //     {
  //       text: '粘贴',
  //       subText: 'Ctrl + V',
  //       handler: () => {
  //         // 由全局快捷键处理，此处占位
  //         console.log('Paste not implemented here')
  //       },
  //     },
  //     {
  //       text: '全选',
  //       subText: 'Ctrl + A',
  //       handler: () => {
  //         const ids = elementList.map((el) => el.id)
  //         useMainStore.getState().setActiveElementIdList(ids)
  //       },
  //     },
  //     { divider: true },
  //     {
  //       text: '网格线',
  //       handler: () => {
  //         const { gridLinesState, setGridLinesState } = useMainStore.getState()
  //         setGridLinesState(!gridLinesState)
  //       },
  //     },
  //     {
  //       text: '重置画布',
  //       handler: () => {
  //         useMainStore.getState().setCanvasPercentage(90)
  //       },
  //     },
  //   ],
  //   [elementList]
  // )
  // useContextMenu(containerRef, []);

  /**
   * 移除画布编辑区域焦点
   */
  const removeEditorAreaFocus = () => {
    const state = useMainStore.getState()
    if (state.editorAreaFocus) {
      state.setEditorareaFocus(false)
    }
  }

  /**
   * 监听画布外部点击：移除编辑区域焦点并清除文字选区
   */
  useClickOutside(containerRef, removeEditorAreaFocus)

  /**
   * 监听正在操作元素变化：清空组合元素激活状态
   */
  useEffect(() => {
    setActiveGroupElementId('')
  }, [handleElementId, setActiveGroupElementId])

  /**
   * 选中元素：阻止事件冒泡并转交原生事件给选择逻辑
   */
  const handleSelectElement = (
    e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent,
    element: PPTElement,
    canMove = true
  ) => {
    e.stopPropagation()
    // @ts-ignore
    const event = e.nativeEvent || e
    selectElement(event, element, canMove)
  }

  /**
   * 点击画布空白区域，清空焦点并切换拖拽/框选状态
   */
  const handleClickBlankArea = (e: React.MouseEvent) => {
    if (activeElementIdList.length) setActiveElementIdList([])

    if (spaceKeyState) {
      dragViewport(e.nativeEvent)
    }
    else {
      updateMouseSelection(e)
    }

    if (!editorAreaFocus) setEditorareaFocus(true)
    if (textFormatPainter) setTextFormatPainter(null)
    removeAllRanges()
  }

  /**
   * 双击空白处插入文本元素
   */
  const handleDblClick = (e: React.MouseEvent) => {
    if (activeElementIdList.length || creatingElement || creatingCustomShape) {
      return
    }
    if (!viewportRef.current) return

    const { pageX, pageY } = e
    const { x, y } = viewportRef.current.getBoundingClientRect()
    const left = (pageX - x) / canvasScale
    const top = (pageY - y) / canvasScale
    createTextElement({
      left,
      top,
      width: 200 / canvasScale, // 除以 canvasScale 是为了与点击选区创建的形式保持相同的宽度
      height: 0,
    })
  }

  /**
   * 组件挂载：如存在选中元素则清空（用于退出放映后清理残留状态）
   */
  useEffect(() => {
    if (activeElementIdList.length) setActiveElementIdList([])
  }, [])

  /**
   * 组件卸载：清空文字格式刷状态
   */
  useEffect(() => {
    return () => {
      const { textFormatPainter: painter } = useMainStore.getState()
      if (painter) setTextFormatPainter(null)
    }
  }, [setTextFormatPainter])

  /**
   * 鼠标滚轮仅用于翻页
   */
  const throttleUpdateSlideIndex = useMemo(
    () =>
      throttle((key: string) => updateSlideIndex(key), 300, {
        leading: true,
        trailing: false,
      }),
    [updateSlideIndex]
  )

  const handleMousewheelCanvas = (e: WheelEvent) => {
    e.preventDefault()
    if (e.deltaY > 0) throttleUpdateSlideIndex(KEYS.DOWN)
    else if (e.deltaY < 0) throttleUpdateSlideIndex(KEYS.UP)
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    el.addEventListener('wheel', handleMousewheelCanvas, { passive: false })
    return () => el.removeEventListener('wheel', handleMousewheelCanvas)
  }, [throttleUpdateSlideIndex])

  /**
   * 打开链接配置弹窗
   */
  const openLinkDialog = () => setLinkDialogVisible(true)

  // 操作层处理器封装
  const handleRotateElement = (e: React.MouseEvent, element: any) => {
    rotateElement(e.nativeEvent, element)
  }
  const handleScaleElement = (
    e: React.MouseEvent,
    element: any,
    command: OperateResizeHandlers
  ) => {
    scaleElement(e.nativeEvent, element, command)
  }
  const handleDragLineElement = (
    e: React.MouseEvent,
    element: any,
    command: OperateLineHandlers
  ) => {
    dragLineElement(e.nativeEvent, element, command)
  }
  const handleMoveShapeKeypoint = (
    e: React.MouseEvent,
    element: any,
    index: number
  ) => {
    moveShapeKeypoint(e.nativeEvent, element, index)
  }
  const handleScaleMultiElement = (
    e: React.MouseEvent,
    range: any,
    command: OperateResizeHandlers
  ) => {
    scaleMultiElement(e.nativeEvent, range, command)
  }

  return (
    <div
      className={styles.canvas}
      ref={containerRef}
      onMouseDown={handleClickBlankArea}
      onDoubleClick={handleDblClick}
      onDragOver={(e) => e.preventDefault()}
    >
      {linkDialogVisible && (
        <LinkDialog onClose={() => setLinkDialogVisible(false)} />
      )}

      {creatingElement && (
        <ElementCreateSelection onCreated={insertElementFromCreateSelection} />
      )}

      {creatingCustomShape && (
        <ShapeCreateCanvas
          onClose={() =>
            useMainStore.getState().setCreatingCustomShapeState(false)
          }
          onCreated={createCustomShapeElement}
        />
      )}

      <div
        className={styles.viewportWrapper}
        style={{
          width: viewportStyles.width * canvasScale,
          height: viewportStyles.height * canvasScale,
          left: viewportStyles.left,
          top: viewportStyles.top,
        }}
      >
        <div className="operates">
          {/* 辅助线 (Vue 版本暂未实现，保留) */}
          {alignmentLines.map((line, index) => (
            <AlignmentLine
              key={index}
              type={line.type}
              axis={line.axis}
              length={line.length}
              canvasScale={canvasScale}
            />
          ))}

          {activeElementIdList.length > 1 && (
            <MultiSelectOperate
              elementList={currentSlide?.elements || []}
              scaleMultiElement={handleScaleMultiElement}
            />
          )}

          {currentSlide?.elements
            .filter((el) => !hiddenElementIdList.includes(el.id))
            .map((element) => (
              <Operate
                key={element.id}
                elementInfo={element}
                isSelected={activeElementIdList.includes(element.id)}
                isActive={handleElementId === element.id}
                isActiveGroupElement={activeGroupElementId === element.id}
                isMultiSelect={activeElementIdList.length > 1}
                rotateElement={handleRotateElement}
                scaleElement={handleScaleElement}
                dragLineElement={handleDragLineElement}
                moveShapeKeypoint={handleMoveShapeKeypoint}
                openLinkDialog={openLinkDialog}
              />
            ))}

          <ViewportBackground />
        </div>

        <div
          className={styles.viewport}
          ref={viewportRef}
          style={{ transform: `scale(${canvasScale})` }}
        >
          {mouseSelectionVisible && selectionState && (
            <MouseSelection
              top={selectionState.top}
              left={selectionState.left}
              width={selectionState.width}
              height={selectionState.height}
              quadrant={selectionState.quadrant}
            />
          )}

          {currentSlide?.elements
            .filter((el) => !hiddenElementIdList.includes(el.id))
            .map((element, index) => (
              <EditableElement
                key={element.id}
                elementInfo={element}
                elementIndex={index + 1}
                isMultiSelect={activeElementIdList.length > 1}
                selectElement={handleSelectElement}
                openLinkDialog={openLinkDialog}
              />
            ))}
        </div>
      </div>
    </div>
  )
}

export default Canvas
