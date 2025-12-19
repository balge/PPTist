import { nanoid } from 'nanoid'
import { useMainStore, useSlidesStore } from '@/store'
import { getImageSize } from '@/utils/image'
import type {
  PPTLineElement,
  PPTElement,
  TableCell,
  TableCellStyle,
  PPTShapeElement,
  ChartType,
  PPTVideoElement,
  PPTAudioElement,
} from '@/types/slides'
import type { CreateCustomShapeData } from '@/types/edit'
import { type ShapePoolItem, SHAPE_PATH_FORMULAS } from '@/configs/shapes'
import type { LinePoolItem } from '@/configs/lines'
import { CHART_DEFAULT_DATA } from '@/configs/chart'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

interface CommonElementPosition {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface LineElementPosition {
  top: number;
  left: number;
  start: [number, number];
  end: [number, number];
}

interface CreateTextData {
  content?: string;
  vertical?: boolean;
}

export default () => {
  const {
    creatingElement,
    setCreatingElement,
    setActiveElementIdList,
    setEditorareaFocus,
  } = useMainStore()
  const { theme, viewportRatio, viewportSize, addElement } = useSlidesStore()

  const { addHistorySnapshot } = useHistorySnapshot()

  // 创建（插入）一个元素并将其设置为被选中元素
  const createElement = (element: PPTElement, callback?: () => void) => {
    addElement(element)
    setActiveElementIdList([element.id])

    if (creatingElement) setCreatingElement(null)

    setTimeout(() => {
      setEditorareaFocus(true)
    }, 0)

    if (callback) callback()

    addHistorySnapshot()
  }

  /**
   * 创建图片元素
   * @param src 图片地址
   */
  const createImageElement = (src: string) => {
    getImageSize(src).then(({ width, height }) => {
      const scale = height / width

      if (scale < viewportRatio && width > viewportSize) {
        width = viewportSize
        height = width * scale
      }
      else if (height > viewportSize * viewportRatio) {
        height = viewportSize * viewportRatio
        width = height / scale
      }

      createElement({
        type: 'image',
        id: nanoid(10),
        src,
        width,
        height,
        left: (viewportSize - width) / 2,
        top: (viewportSize * viewportRatio - height) / 2,
        fixedRatio: true,
        rotate: 0,
      })
    })
  }

  /**
   * 创建图表元素
   * @param chartType 图表类型
   */
  const createChartElement = (type: ChartType) => {
    createElement({
      type: 'chart',
      id: nanoid(10),
      chartType: type,
      left: 300,
      top: 81.25,
      width: 400,
      height: 400,
      rotate: 0,
      themeColors: theme.themeColors,
      textColor: theme.fontColor,
      data: CHART_DEFAULT_DATA[type],
    })
  }

  /**
   * 创建表格元素
   * @param row 行数
   * @param col 列数
   */
  const createTableElement = (row: number, col: number) => {
    const style: TableCellStyle = {
      fontname: theme.fontName,
      color: theme.fontColor,
    }
    const data: TableCell[][] = []
    for (let i = 0; i < row; i++) {
      const rowCells: TableCell[] = []
      for (let j = 0; j < col; j++) {
        rowCells.push({
          id: nanoid(10),
          colspan: 1,
          rowspan: 1,
          text: '',
          style,
        })
      }
      data.push(rowCells)
    }

    const DEFAULT_CELL_WIDTH = 100
    const DEFAULT_CELL_HEIGHT = 36

    const colWidths: number[] = new Array(col).fill(1 / col)

    const width = col * DEFAULT_CELL_WIDTH
    const height = row * DEFAULT_CELL_HEIGHT

    createElement({
      type: 'table',
      id: nanoid(10),
      width,
      height,
      colWidths,
      rotate: 0,
      data,
      left: (viewportSize - width) / 2,
      top: (viewportSize * viewportRatio - height) / 2,
      outline: {
        width: 2,
        style: 'solid',
        color: '#eeece1',
      },
      theme: {
        color: theme.themeColors[0],
        rowHeader: true,
        rowFooter: false,
        colHeader: false,
        colFooter: false,
      },
      cellMinHeight: 36,
    })
  }

  /**
   * 创建文本元素
   * @param position 位置大小信息
   * @param content 文本内容
   */
  const createTextElement = (
    position: CommonElementPosition,
    data?: CreateTextData
  ) => {
    const { left, top, width, height } = position
    const content = data?.content || ''
    const vertical = data?.vertical || false

    const id = nanoid(10)
    createElement(
      {
        type: 'text',
        id,
        left,
        top,
        width,
        height,
        content,
        rotate: 0,
        defaultFontName: theme.fontName,
        defaultColor: theme.fontColor,
        vertical,
      },
      () => {
        setTimeout(() => {
          const editorRef: HTMLElement | null = document.querySelector(
            `#editable-element-${id} .ProseMirror`
          )
          if (editorRef) editorRef.focus()
        }, 0)
      }
    )
  }

  /**
   * 创建形状元素
   * @param position 位置大小信息
   * @param data 形状路径信息
   */
  const createShapeElement = (
    position: CommonElementPosition,
    data: ShapePoolItem,
    supplement: Partial<PPTShapeElement> = {}
  ) => {
    const { left, top, width, height } = position
    const newElement: PPTShapeElement = {
      type: 'shape',
      id: nanoid(10),
      left,
      top,
      width,
      height,
      viewBox: data.viewBox,
      path: data.path,
      fill: theme.themeColors[0],
      fixedRatio: false,
      rotate: 0,
      ...supplement,
    }
    if (data.withborder) newElement.outline = theme.outline
    if (data.special) newElement.special = true
    if (data.pathFormula) {
      newElement.pathFormula = data.pathFormula
      newElement.viewBox = [width, height]

      const pathFormula = SHAPE_PATH_FORMULAS[data.pathFormula]
      if ('editable' in pathFormula && pathFormula.editable) {
        newElement.path = pathFormula.formula(
          width,
          height,
          pathFormula.defaultValue!
        )
        newElement.keypoints = pathFormula.defaultValue
      }
      else newElement.path = pathFormula.formula(width, height)
    }
    createElement(newElement)
  }

  /**
   * 创建自定义形状元素
   * @param data 自定义形状信息
   */
  const createCustomShapeElement = (data: CreateCustomShapeData) => {
    const { start, viewBox, path, fill, outline } = data
    createElement({
      type: 'shape',
      id: nanoid(10),
      left: start[0],
      top: start[1],
      width: viewBox[0],
      height: viewBox[1],
      viewBox,
      path,
      fill: fill || theme.themeColors[0],
      rotate: 0,
      outline,
      fixedRatio: false,
    })
  }

  /**
   * 创建线条元素
   * @param position 位置大小信息
   * @param data 线条的路径和样式
   */
  const createLineElement = (
    position: LineElementPosition,
    data: LinePoolItem
  ) => {
    const { left, top, start, end } = position

    const newElement: PPTLineElement = {
      type: 'line',
      id: nanoid(10),
      left,
      top,
      start,
      end,
      points: data.points,
      color: theme.themeColors[0],
      style: data.style,
      width: 2,
    }
    if (data.isBroken) {
      newElement.broken = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
    }
    if (data.isBroken2) {
      newElement.broken2 = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
    }
    if (data.isCurve) {
      newElement.curve = [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2]
    }
    if (data.isCubic) {
      newElement.cubic = [
        [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
        [(start[0] + end[0]) / 2, (start[1] + end[1]) / 2],
      ]
    }
    createElement(newElement)
  }

  /**
   * 创建LaTeX元素
   * @param svg SVG代码
   */
  const createLatexElement = (data: {
    path: string;
    latex: string;
    w: number;
    h: number;
  }) => {
    createElement({
      type: 'latex',
      id: nanoid(10),
      width: data.w,
      height: data.h,
      rotate: 0,
      left: (viewportSize - data.w) / 2,
      top: (viewportSize * viewportRatio - data.h) / 2,
      path: data.path,
      latex: data.latex,
      color: theme.fontColor,
      strokeWidth: 2,
      viewBox: [data.w, data.h],
      fixedRatio: true,
    })
  }

  /**
   * 创建视频元素
   * @param src 视频地址
   */
  const createVideoElement = (src: string, ext?: string) => {
    const newElement: PPTVideoElement = {
      type: 'video',
      id: nanoid(10),
      width: 500,
      height: 300,
      rotate: 0,
      left: (viewportSize - 500) / 2,
      top: (viewportSize * viewportRatio - 300) / 2,
      src,
      autoplay: false,
    }
    if (ext) newElement.ext = ext
    createElement(newElement)
  }

  /**
   * 创建音频元素
   * @param src 音频地址
   */
  const createAudioElement = (src: string, ext?: string) => {
    const newElement: PPTAudioElement = {
      type: 'audio',
      id: nanoid(10),
      width: 50,
      height: 50,
      rotate: 0,
      left: (viewportSize - 50) / 2,
      top: (viewportSize * viewportRatio - 50) / 2,
      loop: false,
      autoplay: false,
      fixedRatio: true,
      color: theme.themeColors[0],
      src,
    }
    if (ext) newElement.ext = ext
    createElement(newElement)
  }

  return {
    createElement,
    createImageElement,
    createChartElement,
    createTableElement,
    createTextElement,
    createShapeElement,
    createCustomShapeElement,
    createLineElement,
    createLatexElement,
    createVideoElement,
    createAudioElement,
  }
}
