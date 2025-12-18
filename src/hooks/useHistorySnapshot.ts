import { useMemo } from 'react'
import { debounce, throttle } from 'lodash'
import { useSnapshotStore } from '@/store'

export default () => {
  const { addSnapshot, reDo, unDo } = useSnapshotStore()

  // 添加历史快照(历史记录)
  const addHistorySnapshot = useMemo(
    () => debounce(addSnapshot, 300, { trailing: true }),
    [addSnapshot]
  )

  // 重做
  const redo = useMemo(
    () => throttle(reDo, 100, { leading: true, trailing: false }),
    [reDo]
  )

  // 撤销
  const undo = useMemo(
    () => throttle(unDo, 100, { leading: true, trailing: false }),
    [unDo]
  )

  return {
    addHistorySnapshot,
    redo,
    undo,
  }
}
