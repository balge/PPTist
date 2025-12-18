import React, { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import type { PPTElementOutline, TableCell, TableTheme } from '@/types/slides'
import { getTextStyle, formatText } from './utils'
import useHideCells from './useHideCells'
import useSubThemeColor from './useSubThemeColor'
import './StaticTable.scss'

interface StaticTableProps {
  data: TableCell[][]
  width: number
  cellMinHeight: number
  colWidths: number[]
  outline: PPTElementOutline
  theme?: TableTheme
  editable?: boolean
}

const StaticTable: React.FC<StaticTableProps> = ({
  data,
  width,
  cellMinHeight,
  colWidths,
  outline,
  theme,
  editable = true,
}) => {
  const [colSizeList, setColSizeList] = useState<number[]>([])

  useEffect(() => {
    setColSizeList(colWidths.map(item => item * width))
  }, [colWidths, width])

  const totalWidth = useMemo(() => colSizeList.reduce((a, b) => a + b, 0), [colSizeList])

  const { hideCells } = useHideCells(data)
  const { subThemeColor } = useSubThemeColor(theme)

  const themeStyle = useMemo(() => {
    if (!theme) return {}
    return {
      '--themeColor': theme.color,
      '--subThemeColor1': subThemeColor[0],
      '--subThemeColor2': subThemeColor[1],
    } as React.CSSProperties
  }, [theme, subThemeColor])

  return (
    <div 
      className="static-table"
      style={{ width: totalWidth + 'px' }}
    >
      <table
        className={clsx({
          'theme': theme,
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
          {data.map((rowCells, rowIndex) => (
            <tr key={rowIndex} style={{ height: cellMinHeight + 'px' }}>
              {rowCells.map((cell, colIndex) => {
                if (hideCells.includes(`${rowIndex}_${colIndex}`)) return null
                
                return (
                  <td 
                    key={cell.id}
                    className="cell"
                    style={{
                      borderStyle: outline.style,
                      borderColor: outline.color,
                      borderWidth: outline.width + 'px',
                      ...getTextStyle(cell.style),
                    }}
                    rowSpan={cell.rowspan}
                    colSpan={cell.colspan}
                  >
                    <div 
                      className="cell-text" 
                      style={{ minHeight: (cellMinHeight - 4) + 'px' }} 
                      dangerouslySetInnerHTML={{ __html: formatText(cell.text) }} 
                    />
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

export default StaticTable
