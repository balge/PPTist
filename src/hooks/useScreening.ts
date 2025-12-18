import { useSlidesStore } from '@/store'

export default () => {
  const slidesStore = useSlidesStore()

  /**
   * 禁用：进入放映（当前页）
   */
  const enterScreening = () => {
    // noop
  }

  /**
   * 禁用：进入放映（从第一页开始）
   */
  const enterScreeningFromStart = () => {
    // noop
  }

  /**
   * 禁用：退出放映
   */
  const exitScreening = () => {
    // noop
  }

  return {
    enterScreening,
    enterScreeningFromStart,
    exitScreening,
  }
}
