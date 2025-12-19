import React, { useEffect, useRef, useMemo, useCallback } from 'react'
import tinycolor from 'tinycolor2'
import * as echarts from 'echarts/core'
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
} from 'echarts/charts'
import { LegendComponent } from 'echarts/components'
import { SVGRenderer } from 'echarts/renderers'
import type { ChartData, ChartOptions, ChartType } from '@/types/slides'
import { getChartOption } from './chartOption'
import styles from './Chart.module.scss'

echarts.use([
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  RadarChart,
  LegendComponent,
  SVGRenderer,
])

interface ChartProps {
  width: number;
  height: number;
  type: ChartType;
  data: ChartData;
  themeColors: string[];
  textColor?: string;
  lineColor?: string;
  options?: ChartOptions;
}

const Chart: React.FC<ChartProps> = ({
  width,
  height,
  type,
  data,
  themeColors: propsThemeColors,
  textColor,
  lineColor,
  options,
}) => {
  const chartRef = useRef<HTMLDivElement>(null)
  const chartInstance = useRef<echarts.ECharts | null>(null)

  const themeColors = useMemo(() => {
    let colors: string[] = []
    if (propsThemeColors.length >= 10) colors = propsThemeColors
    else if (propsThemeColors.length === 1) {
      colors = tinycolor(propsThemeColors[0])
        .analogous(10)
        .map((color) => color.toRgbString())
    }
    else {
      const len = propsThemeColors.length
      const supplement = tinycolor(propsThemeColors[len - 1])
        .analogous(10 + 1 - len)
        .map((color) => color.toRgbString())
      colors = [...propsThemeColors.slice(0, len - 1), ...supplement]
    }
    return colors
  }, [propsThemeColors])

  const updateOption = useCallback(() => {
    if (!chartInstance.current) return
    const option = getChartOption({
      type,
      data,
      themeColors,
      textColor,
      lineColor,
      lineSmooth: options?.lineSmooth || false,
      stack: options?.stack || false,
    })
    if (option) chartInstance.current.setOption(option, true)
  }, [type, data, themeColors, textColor, lineColor, options])

  useEffect(() => {
    if (!chartRef.current) return

    chartInstance.current = echarts.init(chartRef.current, null, {
      renderer: 'svg',
    })
    updateOption()

    const resizeListener = () => chartInstance.current?.resize()
    const resizeObserver = new ResizeObserver(resizeListener)
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chartInstance.current?.dispose()
      chartInstance.current = null
    }
  }, []) // Init once

  useEffect(() => {
    updateOption()
  }, [updateOption])

  return <div className={styles.chart} ref={chartRef}></div>
}

export default Chart
