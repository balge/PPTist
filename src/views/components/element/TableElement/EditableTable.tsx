import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import { debounce } from 'lodash'
import { nanoid } from 'nanoid'
import clsx from 'clsx'
import { useMainStore } from '@/store'
import type { PPTElementOutline, TableCell, TableTheme } from '@/types/slides'
import type { ContextmenuItem } from '@/components/Contextmenu/types'
import { KEYS } from '@/configs/hotkey'
import { getTextStyle, formatText } from './utils'
import useHideCells from './useHideCells'
import useSubThemeColor from './useSubThemeColor'
import { createRoot } from 'react-dom/client'
import Contextmenu from '@/components/Contextmenu'

import CustomTextarea from './CustomTextarea'
import './EditableTable.scss'

interface EditableTableProps {
  data: TableCell[][];
  width: number;
  cellMinHeight: number;
  colWidths: number[];
  outline: PPTElementOutline;
  theme?: TableTheme;
  editable?: boolean;
  onChange: (data: TableCell[][]) => void;
  onChangeColWidths: (widths: number[]) => void;
  onChangeSelectedCells: (cells: string[]) => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  contextmenus?: (el: HTMLElement) => ContextmenuItem[];
}

const EditableTable: React.FC<EditableTableProps> = ({
  data: tableCells, // Rename for clarity, though it's controlled by parent
  width,
  cellMinHeight,
  colWidths,
  outline,
  theme,
  editable = true,
  onChange,
  onChangeColWidths,
  onChangeSelectedCells,
  onMouseDown,
  contextmenus,
}) => {
  const { canvasScale, setSelectedTableCells } = useMainStore()

  const [isStartSelect, setIsStartSelect] = useState(false)
  const [startCell, setStartCell] = useState<number[]>([])
  const [endCell, setEndCell] = useState<number[]>([])
  const [colSizeList, setColSizeList] = useState<number[]>([])

  // Calculate colSizeList from props
  useEffect(() => {
    setColSizeList(colWidths.map((item) => item * width))
  }, [colWidths, width])

  const totalWidth = useMemo(
    () => colSizeList.reduce((a, b) => a + b, 0),
    [colSizeList]
  )
  const { hideCells } = useHideCells(tableCells)
  const { subThemeColor } = useSubThemeColor(theme)

  const themeStyle = useMemo(() => {
    if (!theme) return {}
    return {
      '--themeColor': theme.color,
      '--subThemeColor1': subThemeColor[0],
      '--subThemeColor2': subThemeColor[1],
    } as React.CSSProperties
  }, [theme, subThemeColor])

  // Clear selection when editable becomes false
  useEffect(() => {
    if (!editable) {
      setStartCell([])
      setEndCell([])
    }
  }, [editable])

  const dragLinePosition = useMemo(() => {
    const positions: number[] = []
    for (let i = 1; i < colSizeList.length + 1; i++) {
      const pos = colSizeList.slice(0, i).reduce((a, b) => a + b, 0)
      positions.push(pos)
    }
    return positions
  }, [colSizeList])

  const selectedCells = useMemo(() => {
    if (!startCell.length) return []
    const [startX, startY] = startCell

    if (!endCell.length) return [`${startX}_${startY}`]
    const [endX, endY] = endCell

    if (startX === endX && startY === endY) return [`${startX}_${startY}`]

    const selected = []

    const minX = Math.min(startX, endX)
    const minY = Math.min(startY, endY)
    const maxX = Math.max(startX, endX)
    const maxY = Math.max(startY, endY)

    for (let i = 0; i < tableCells.length; i++) {
      const rowCells = tableCells[i]
      for (let j = 0; j < rowCells.length; j++) {
        if (i >= minX && i <= maxX && j >= minY && j <= maxY) {
          selected.push(`${i}_${j}`)
        }
      }
    }
    return selected
  }, [startCell, endCell, tableCells])

  // Notify parent of selection change
  useEffect(() => {
    onChangeSelectedCells(selectedCells)
    setSelectedTableCells(selectedCells) // Sync to store for toolbar usage?
  }, [selectedCells, onChangeSelectedCells, setSelectedTableCells])

  const activedCell = useMemo(() => {
    if (selectedCells.length > 1) return null
    return selectedCells[0] || null
  }, [selectedCells])

  const handleMouseup = useCallback(() => setIsStartSelect(false), [])

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseup)
    return () => {
      document.removeEventListener('mouseup', handleMouseup)
    }
  }, [handleMouseup])

  const handleCellMousedown = (
    e: React.MouseEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    if (e.button === 0) {
      setEndCell([])
      setIsStartSelect(true)
      setStartCell([rowIndex, colIndex])
    }
  }

  const handleCellMouseenter = (rowIndex: number, colIndex: number) => {
    if (!isStartSelect) return
    setEndCell([rowIndex, colIndex])
  }

  const isHideCell = (rowIndex: number, colIndex: number) =>
    hideCells.includes(`${rowIndex}_${colIndex}`)

  // Table operations (insert, delete, merge, split) - implemented similarly to Vue version
  // but since state is lifted up (data prop), we need to compute new data and call onChange

  const insertRow = (rowIndex: number) => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const rowCells: TableCell[] = []
    for (let i = 0; i < _tableCells[0].length; i++) {
      rowCells.push({
        colspan: 1,
        rowspan: 1,
        text: '',
        id: nanoid(10),
      })
    }
    _tableCells.splice(rowIndex, 0, rowCells)
    onChange(_tableCells)
  }

  const insertCol = (colIndex: number) => {
    const _tableCells = tableCells.map((item) => {
      const cell = {
        colspan: 1,
        rowspan: 1,
        text: '',
        id: nanoid(10),
      }
      const newItem = [...item]
      newItem.splice(colIndex, 0, cell)
      return newItem
    })
    const newColSizeList = [...colSizeList]
    newColSizeList.splice(colIndex, 0, 100)

    onChange(_tableCells)
    onChangeColWidths(newColSizeList)
  }

  const deleteRow = (rowIndex: number) => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const targetCells = tableCells[rowIndex]
    const hideCellsPos = []
    for (let i = 0; i < targetCells.length; i++) {
      if (isHideCell(rowIndex, i)) hideCellsPos.push(i)
    }

    for (const pos of hideCellsPos) {
      for (let i = rowIndex; i >= 0; i--) {
        if (!isHideCell(i, pos)) {
          _tableCells[i][pos].rowspan = _tableCells[i][pos].rowspan - 1
          break
        }
      }
    }

    _tableCells.splice(rowIndex, 1)
    onChange(_tableCells)
  }

  const deleteCol = (colIndex: number) => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    const hideCellsPos = []
    for (let i = 0; i < tableCells.length; i++) {
      if (isHideCell(i, colIndex)) hideCellsPos.push(i)
    }

    for (const pos of hideCellsPos) {
      for (let i = colIndex; i >= 0; i--) {
        if (!isHideCell(pos, i)) {
          _tableCells[pos][i].colspan = _tableCells[pos][i].colspan - 1
          break
        }
      }
    }

    const newTableCells = _tableCells.map((item) => {
      item.splice(colIndex, 1)
      return item
    })
    const newColSizeList = [...colSizeList]
    newColSizeList.splice(colIndex, 1)

    onChange(newTableCells)
    onChangeColWidths(newColSizeList)
  }

  const mergeCells = () => {
    const [startX, startY] = startCell
    const [endX, endY] = endCell

    const minX = Math.min(startX, endX)
    const minY = Math.min(startY, endY)
    const maxX = Math.max(startX, endX)
    const maxY = Math.max(startY, endY)

    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))

    _tableCells[minX][minY].rowspan = maxX - minX + 1
    _tableCells[minX][minY].colspan = maxY - minY + 1

    onChange(_tableCells)
    setStartCell([])
    setEndCell([])
  }

  const splitCells = (rowIndex: number, colIndex: number) => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    _tableCells[rowIndex][colIndex].rowspan = 1
    _tableCells[rowIndex][colIndex].colspan = 1

    onChange(_tableCells)
    setStartCell([])
    setEndCell([])
  }

  const selectCol = (index: number) => {
    const maxRow = tableCells.length - 1
    setStartCell([0, index])
    setEndCell([maxRow, index])
  }

  const selectRow = (index: number) => {
    const maxCol = tableCells[index].length - 1
    setStartCell([index, 0])
    setEndCell([index, maxCol])
  }

  const selectAll = () => {
    const maxRow = tableCells.length - 1
    const maxCol = tableCells[maxRow].length - 1
    setStartCell([0, 0])
    setEndCell([maxRow, maxCol])
  }

  /**
   * 清空选中单元格文字
   */
  const clearSelectedCellText = () => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    for (let i = 0; i < _tableCells.length; i++) {
      for (let j = 0; j < _tableCells[i].length; j++) {
        if (selectedCells.includes(`${i}_${j}`)) {
          _tableCells[i][j].text = ''
        }
      }
    }
    onChange(_tableCells)
  }

  /**
   * 聚焦激活单元格文本框
   */
  const focusActiveCell = () => {
    requestAnimationFrame(() => {
      const textRef = document.querySelector(
        '.cell-text.active'
      ) as HTMLDivElement | null
      if (textRef) textRef.focus()
    })
  }

  /**
   * Tab 移动焦点，如末尾自动新增一行
   */
  const tabActiveCell = () => {
    const getNextCell = (i: number, j: number): [number, number] | null => {
      if (!tableCells[i]) return null
      if (!tableCells[i][j]) return getNextCell(i + 1, 0)
      if (isHideCell(i, j)) return getNextCell(i, j + 1)
      return [i, j]
    }

    setEndCell([])

    const nextRow = startCell[0]
    const nextCol = startCell[1] + 1

    const nextCell = getNextCell(nextRow, nextCol)
    if (!nextCell) {
      insertRow(nextRow + 1)
      setStartCell([nextRow + 1, 0])
    }
    else setStartCell(nextCell)

    focusActiveCell()
  }

  /**
   * 计算光标位置
   */
  const getCaretPosition = (element: HTMLDivElement) => {
    const selection = window.getSelection()
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0)

      const preCaretRange = range.cloneRange()
      preCaretRange.selectNodeContents(element)

      preCaretRange.setEnd(range.startContainer, range.startOffset)
      const start = preCaretRange.toString().length
      preCaretRange.setEnd(range.endContainer, range.endOffset)
      const end = preCaretRange.toString().length

      const len = element.textContent?.length || 0

      return { start, end, len }
    }
    return null
  }

  /**
   * 移动激活单元格（上下左右）
   */
  const moveActiveCell = (dir: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const rowIndex = +selectedCells[0].split('_')[0]
    const colIndex = +selectedCells[0].split('_')[1]

    const rowLen = tableCells.length
    const colLen = tableCells[0].length

    const getEffectivePos = (pos: [number, number]): [number, number] => {
      if (
        pos[0] < 0 ||
        pos[1] < 0 ||
        pos[0] > rowLen - 1 ||
        pos[1] > colLen - 1
      ) {
        return [0, 0]
      }

      const p = `${pos[0]}_${pos[1]}`
      if (!hideCells.includes(p)) return pos

      if (dir === 'UP') {
        return getEffectivePos([pos[0], pos[1] - 1])
      }
      if (dir === 'DOWN') {
        return getEffectivePos([pos[0], pos[1] - 1])
      }
      if (dir === 'LEFT') {
        return getEffectivePos([pos[0] - 1, pos[1]])
      }
      if (dir === 'RIGHT') {
        return getEffectivePos([pos[0] - 1, pos[1]])
      }

      return [0, 0]
    }

    if (dir === 'UP') {
      const _rowIndex = rowIndex - 1
      if (_rowIndex < 0) return
      setEndCell([])
      setStartCell(getEffectivePos([_rowIndex, colIndex]))
    }
    else if (dir === 'DOWN') {
      const _rowIndex = rowIndex + 1
      if (_rowIndex > rowLen - 1) return
      setEndCell([])
      setStartCell(getEffectivePos([_rowIndex, colIndex]))
    }
    else if (dir === 'LEFT') {
      const _colIndex = colIndex - 1
      if (_colIndex < 0) return
      setEndCell([])
      setStartCell(getEffectivePos([rowIndex, _colIndex]))
    }
    else if (dir === 'RIGHT') {
      const _colIndex = colIndex + 1
      if (_colIndex > colLen - 1) return
      setEndCell([])
      setStartCell(getEffectivePos([rowIndex, _colIndex]))
    }

    focusActiveCell()
  }

  /**
   * 获取有效单元格（去除被合并位置）
   */
  const getEffectiveTableCells = () => {
    const effectiveTableCells: TableCell[][] = []
    for (let i = 0; i < tableCells.length; i++) {
      const rowCells = tableCells[i]
      const _rowCells: TableCell[] = []
      for (let j = 0; j < rowCells.length; j++) {
        if (!isHideCell(i, j)) _rowCells.push(rowCells[j])
      }
      if (_rowCells.length) effectiveTableCells.push(_rowCells)
    }
    return effectiveTableCells
  }

  /**
   * 检查是否可删除行列
   */
  const checkCanDeleteRowOrCol = () => {
    const effectiveTableCells = getEffectiveTableCells()
    const canDeleteRow = effectiveTableCells.length > 1
    const canDeleteCol = effectiveTableCells[0].length > 1
    return { canDeleteRow, canDeleteCol }
  }

  /**
   * 检查是否可合并或拆分
   */
  const checkCanMergeOrSplit = (rowIndex: number, colIndex: number) => {
    const isMultiSelected = selectedCells.length > 1
    const targetCell = tableCells[rowIndex][colIndex]
    const canMerge = isMultiSelected
    const canSplit =
      !isMultiSelected && (targetCell.rowspan > 1 || targetCell.colspan > 1)
    return { canMerge, canSplit }
  }

  /**
   * 打开右键菜单
   */
  const openContextMenu = (
    event: React.MouseEvent,
    el: HTMLElement,
    menus: ContextmenuItem[]
  ) => {
    event.preventDefault()
    event.stopPropagation()

    const existingContainer = document.getElementById(
      'global-contextmenu-container'
    )
    if (existingContainer) {
      document.body.removeChild(existingContainer)
    }

    const container = document.createElement('div')
    container.id = 'global-contextmenu-container'
    document.body.appendChild(container)

    const root = createRoot(container)
    const removeContextmenu = () => {
      setTimeout(() => {
        root.unmount()
        if (document.body.contains(container)) {
          document.body.removeChild(container)
        }
        el.classList.remove('contextmenu-active')
        document.body.removeEventListener('scroll', removeContextmenu)
        window.removeEventListener('resize', removeContextmenu)
      }, 0)
    }

    root.render(
      <Contextmenu
        axis={{ x: event.clientX, y: event.clientY }}
        el={el}
        menus={menus}
        removeContextmenu={removeContextmenu}
      />
    )

    el.classList.add('contextmenu-active')
    document.body.addEventListener('scroll', removeContextmenu)
    window.addEventListener('resize', removeContextmenu)
  }

  // Handle keyboard events (move, delete, tab, insert)
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      if (!editable || !selectedCells.length) return

      const key = e.key.toUpperCase()
      if (selectedCells.length < 2) {
        if (key === KEYS.TAB) {
          e.preventDefault()
          tabActiveCell()
        }
        else if (e.ctrlKey && key === KEYS.UP) {
          e.preventDefault()
          const rowIndex = +selectedCells[0].split('_')[0]
          insertRow(rowIndex)
        }
        else if (e.ctrlKey && key === KEYS.DOWN) {
          e.preventDefault()
          const rowIndex = +selectedCells[0].split('_')[0]
          insertRow(rowIndex + 1)
        }
        else if (e.ctrlKey && key === KEYS.LEFT) {
          e.preventDefault()
          const colIndex = +selectedCells[0].split('_')[1]
          insertCol(colIndex)
        }
        else if (e.ctrlKey && key === KEYS.RIGHT) {
          e.preventDefault()
          const colIndex = +selectedCells[0].split('_')[1]
          insertCol(colIndex + 1)
        }
        else if (key === KEYS.UP) {
          const range = getCaretPosition(e.target as HTMLDivElement)
          if (range && range.start === range.end && range.start === 0) {
            moveActiveCell('UP')
          }
        }
        else if (key === KEYS.DOWN) {
          const range = getCaretPosition(e.target as HTMLDivElement)
          if (range && range.start === range.end && range.start === range.len) {
            moveActiveCell('DOWN')
          }
        }
        else if (key === KEYS.LEFT) {
          const range = getCaretPosition(e.target as HTMLDivElement)
          if (range && range.start === range.end && range.start === 0) {
            moveActiveCell('LEFT')
          }
        }
        else if (key === KEYS.RIGHT) {
          const range = getCaretPosition(e.target as HTMLDivElement)
          if (range && range.start === range.end && range.start === range.len) {
            moveActiveCell('RIGHT')
          }
        }
      }
      else if (key === KEYS.DELETE) {
        clearSelectedCellText()
      }
    }
    document.addEventListener('keydown', keydownListener)
    return () => {
      document.removeEventListener('keydown', keydownListener)
    }
  }, [editable, selectedCells, tableCells, onChange])

  const handleMousedownColHandler = (e: React.MouseEvent, colIndex: number) => {
    e.stopPropagation()
    setStartCell([])
    setEndCell([])

    let isMouseDown = true
    const originWidth = colSizeList[colIndex]
    const startPageX = e.pageX
    const minWidth = 50

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return

      const moveX = (e.pageX - startPageX) / canvasScale
      const width =
        originWidth + moveX < minWidth
          ? minWidth
          : Math.round(originWidth + moveX)

      const newColSizeList = [...colSizeList]
      newColSizeList[colIndex] = width
      setColSizeList(newColSizeList)
    }

    const onMouseUp = () => {
      isMouseDown = false
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      onChangeColWidths(colSizeListRef.current)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  // Ref to track latest colSizeList for drag end
  const colSizeListRef = useRef(colSizeList)
  useEffect(() => {
    colSizeListRef.current = colSizeList
  }, [colSizeList])

  // Re-bind mouseup to use ref
  // (Actually, the above implementation of onMouseUp is inside the closure of handleMousedownColHandler,
  // so it captures the initial colSizeList. We need to use the ref inside onMouseMove/onMouseUp)

  /**
   * 文本输入（防抖更新）
   */
  const handleInput = (value: string, rowIndex: number, colIndex: number) => {
    const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
    _tableCells[rowIndex][colIndex].text = value
    onChange(_tableCells)
  }
  const handleInputDebounced = useMemo(
    () => debounce(handleInput, 300, { trailing: true }),
    [tableCells, onChange]
  )

  /**
   * 自动填充表格尺寸并插入 Excel 数据
   */
  const insertExcelData = (
    data: string[][],
    rowIndex: number,
    colIndex: number
  ) => {
    const maxRow = data.length
    const maxCol = data[0].length

    let fillRowCount = 0
    let fillColCount = 0
    if (rowIndex + maxRow > tableCells.length) {
      fillRowCount = rowIndex + maxRow - tableCells.length
    }
    if (colIndex + maxCol > tableCells[0].length) {
      fillColCount = colIndex + maxCol - tableCells[0].length
    }
    if (fillRowCount || fillColCount) {
      let _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
      const defaultCell = { colspan: 1, rowspan: 1, text: '' }

      if (fillRowCount) {
        const newRows: TableCell[][] = []
        for (let i = 0; i < fillRowCount; i++) {
          const rowCells: TableCell[] = []
          for (let j = 0; j < _tableCells[0].length; j++) {
            rowCells.push({
              ...defaultCell,
              id: nanoid(10),
            } as TableCell)
          }
          newRows.push(rowCells)
        }
        _tableCells = [..._tableCells, ...newRows]
      }
      if (fillColCount) {
        _tableCells = _tableCells.map((item) => {
          const cells: TableCell[] = []
          for (let i = 0; i < fillColCount; i++) {
            const cell = {
              ...defaultCell,
              id: nanoid(10),
            } as TableCell
            cells.push(cell)
          }
          return [...item, ...cells]
        })
        const newColSizeList = [
          ...colSizeList,
          ...new Array(fillColCount).fill(100),
        ]
        setColSizeList(newColSizeList)
        onChangeColWidths(newColSizeList)
      }
      onChange(_tableCells)
    }

    requestAnimationFrame(() => {
      const _tableCells: TableCell[][] = JSON.parse(JSON.stringify(tableCells))
      for (let i = 0; i < maxRow; i++) {
        for (let j = 0; j < maxCol; j++) {
          if (
            _tableCells[rowIndex + i] &&
            _tableCells[rowIndex + i][colIndex + j]
          ) {
            _tableCells[rowIndex + i][colIndex + j].text = data[i][j]
          }
        }
      }
      onChange(_tableCells)
    })
  }

  const handleCellContextMenu = (
    e: React.MouseEvent,
    rowIndex: number,
    colIndex: number
  ) => {
    const el = e.currentTarget as HTMLElement
    if (!selectedCells.includes(`${rowIndex}_${colIndex}`)) {
      setStartCell([rowIndex, colIndex])
      setEndCell([])
    }

    const { canMerge, canSplit } = checkCanMergeOrSplit(rowIndex, colIndex)
    const { canDeleteRow, canDeleteCol } = checkCanDeleteRowOrCol()
    const localMenus: ContextmenuItem[] = [
      {
        text: '插入列',
        children: [
          { text: '到左侧', handler: () => insertCol(colIndex) },
          { text: '到右侧', handler: () => insertCol(colIndex + 1) },
        ],
      },
      {
        text: '插入行',
        children: [
          { text: '到上方', handler: () => insertRow(rowIndex) },
          { text: '到下方', handler: () => insertRow(rowIndex + 1) },
        ],
      },
      {
        text: '删除列',
        disable: !canDeleteCol,
        handler: () => deleteCol(colIndex),
      },
      {
        text: '删除行',
        disable: !canDeleteRow,
        handler: () => deleteRow(rowIndex),
      },
      { divider: true },
      {
        text: '合并单元格',
        disable: !canMerge,
        handler: mergeCells,
      },
      {
        text: '取消合并单元格',
        disable: !canSplit,
        handler: () => splitCells(rowIndex, colIndex),
      },
      { divider: true },
      {
        text: '选中当前列',
        handler: () => selectCol(colIndex),
      },
      {
        text: '选中当前行',
        handler: () => selectRow(rowIndex),
      },
      {
        text: '选中全部单元格',
        handler: selectAll,
      },
    ]
    const externalMenus = contextmenus ? contextmenus(el) || [] : []
    const menus = [...localMenus, ...(externalMenus || [])]
    if (menus.length) openContextMenu(e, el, menus)
  }

  return (
    <div
      className="editable-table"
      style={{ width: totalWidth + 'px' }}
      onMouseDown={onMouseDown}
    >
      {editable && (
        <div className="handler">
          {dragLinePosition.map((pos, index) => (
            <div
              key={index}
              className="drag-line"
              style={{ left: pos + 'px' }}
              onMouseDown={(e) => handleMousedownColHandler(e, index)}
            />
          ))}
        </div>
      )}
      <table
        className={clsx({
          theme: theme,
          'row-header': theme?.rowHeader,
          'row-footer': theme?.rowFooter,
          'col-header': theme?.colHeader,
          'col-footer': theme?.colFooter,
        })}
        style={themeStyle}
      >
        <colgroup>
          {colSizeList.map((width, index) => (
            <col key={index} span={1} width={width} />
          ))}
        </colgroup>
        <tbody>
          {tableCells.map((rowCells, rowIndex) => (
            <tr key={rowIndex} style={{ height: cellMinHeight + 'px' }}>
              {rowCells.map((cell, colIndex) => {
                if (hideCells.includes(`${rowIndex}_${colIndex}`)) return null

                const isSelected =
                  selectedCells.includes(`${rowIndex}_${colIndex}`) &&
                  selectedCells.length > 1
                const isActive = activedCell === `${rowIndex}_${colIndex}`

                return (
                  <td
                    key={cell.id}
                    className={clsx('cell', {
                      selected: isSelected,
                      active: isActive,
                    })}
                    style={{
                      borderStyle: outline.style,
                      borderColor: outline.color,
                      borderWidth: outline.width + 'px',
                      ...getTextStyle(cell.style),
                    }}
                    rowSpan={cell.rowspan}
                    colSpan={cell.colspan}
                    data-cell-index={`${rowIndex}_${colIndex}`}
                    onMouseDown={(e) =>
                      handleCellMousedown(e, rowIndex, colIndex)
                    }
                    onMouseEnter={() =>
                      handleCellMouseenter(rowIndex, colIndex)
                    }
                    onContextMenu={(e) =>
                      handleCellContextMenu(e, rowIndex, colIndex)
                    }
                  >
                    {isActive ? (
                      <CustomTextarea
                        className={clsx('cell-text', { active: true })}
                        style={{ minHeight: cellMinHeight - 4 + 'px' }}
                        value={cell.text}
                        onUpdateValue={(value) =>
                          handleInputDebounced(value, rowIndex, colIndex)
                        }
                        onInsertExcelData={(data) =>
                          insertExcelData(data, rowIndex, colIndex)
                        }
                      />
                    ) : (
                      <div
                        className="cell-text"
                        style={{ minHeight: cellMinHeight - 4 + 'px' }}
                        dangerouslySetInnerHTML={{
                          __html: formatText(cell.text),
                        }}
                      />
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EditableTable
