import { create } from 'zustand'
import type { Slide } from '@/types/slides'
import { useSlidesStore } from './slides'
import { useMainStore } from './main'

interface Snapshot {
  index: number
  slides: Slide[]
}

export interface SnapshotState {
  snapshotCursor: number
  snapshotLength: number
  snapshots: Snapshot[]

  // Getters (computed properties in React can be derived from state)
  // Actions
  setSnapshotCursor: (cursor: number) => void
  setSnapshotLength: (length: number) => void
  addSnapshot: () => void
  unDo: () => void
  reDo: () => void
}

export const useSnapshotStore = create<SnapshotState>((set, get) => ({
  snapshotCursor: -1,
  snapshotLength: 0,
  snapshots: [],

  setSnapshotCursor: (cursor: number) => set({ snapshotCursor: cursor }),

  setSnapshotLength: (length: number) => set({ snapshotLength: length }),

  addSnapshot: () => {
    const { slides, slideIndex } = useSlidesStore.getState()
    const { snapshotCursor, snapshots } = get()
    
    let newSnapshots = [...snapshots]

    // 若当前指针不在末尾，截断后续快照
    if (snapshotCursor >= 0 && snapshotCursor < snapshots.length - 1) {
      newSnapshots = newSnapshots.slice(0, snapshotCursor + 1)
    }

    // 添加新快照
    const snapshot: Snapshot = {
      index: slideIndex,
      slides: JSON.parse(JSON.stringify(slides)),
    }

    // 快照数大于1时，保证撤回后维持页面焦点不变：更新倒数第二个快照 index
    if (newSnapshots.length >= 1) {
      const prevIndex = newSnapshots.length - 1
      newSnapshots[prevIndex] = {
        ...newSnapshots[prevIndex],
        index: slideIndex
      }
    }

    newSnapshots.push(snapshot)

    // 快照数量限制
    const snapshotLengthLimit = 20
    if (newSnapshots.length > snapshotLengthLimit) {
      newSnapshots.shift()
    }

    const newLength = newSnapshots.length
    const newCursor = newLength - 1

    set({
      snapshots: newSnapshots,
      snapshotCursor: newCursor,
      snapshotLength: newLength
    })
  },

  unDo: () => {
    const { snapshotCursor, snapshots } = get()
    if (snapshotCursor <= 0) return

    const newCursor = snapshotCursor - 1
    const snapshot = snapshots[newCursor]
    const { index, slides } = snapshot

    const { setSlides, updateSlideIndex } = useSlidesStore.getState()
    const { setActiveElementIdList } = useMainStore.getState()

    const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

    setSlides(slides)
    updateSlideIndex(slideIndex)
    set({ snapshotCursor: newCursor })
    setActiveElementIdList([])
  },

  reDo: () => {
    const { snapshotCursor, snapshotLength, snapshots } = get()
    if (snapshotCursor >= snapshotLength - 1) return

    const newCursor = snapshotCursor + 1
    const snapshot = snapshots[newCursor]
    const { index, slides } = snapshot

    const { setSlides, updateSlideIndex } = useSlidesStore.getState()
    const { setActiveElementIdList } = useMainStore.getState()

    const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

    setSlides(slides)
    updateSlideIndex(slideIndex)
    set({ snapshotCursor: newCursor })
    setActiveElementIdList([])
  },
}))

// Helper hooks for getters
export const useCanUndo = () => useSnapshotStore(state => state.snapshotCursor > 0)
export const useCanRedo = () => useSnapshotStore(state => state.snapshotCursor < state.snapshotLength - 1)
