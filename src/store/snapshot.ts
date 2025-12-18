import { defineStore } from 'pinia'
import type { Slide } from '@/types/slides'

import { useSlidesStore } from './slides'
import { useMainStore } from './main'

export interface ScreenState {
  snapshotCursor: number;
  snapshotLength: number;
  snapshots: Snapshot[];
}

/** 内存快照结构 */
interface Snapshot {
  index: number;
  slides: Slide[];
}

export const useSnapshotStore = defineStore('snapshot', {
  state: (): ScreenState => ({
    snapshotCursor: -1, // 历史快照指针
    snapshotLength: 0, // 历史快照长度
    snapshots: [], // 历史快照列表（内存）
  }),

  getters: {
    /** 判断是否可撤销 */
    canUndo(state) {
      return state.snapshotCursor > 0
    },
    /** 判断是否可重做 */
    canRedo(state) {
      return state.snapshotCursor < state.snapshotLength - 1
    },
  },

  actions: {
    /**
     * 设置快照指针位置
     * @param cursor 新的指针位置
     */
    setSnapshotCursor(cursor: number) {
      this.snapshotCursor = cursor
    },
    /**
     * 设置快照总长度
     * @param length 快照总长度
     */
    setSnapshotLength(length: number) {
      this.snapshotLength = length
    },

    /**
     * 添加当前状态的快照（内存管理），并维护快照指针与长度
     * - 若当前指针不在末尾，截断指针之后的快照
     * - 限制快照数量为 20，超过则移除头部
     * - 保持撤回后页面焦点不变：更新倒数第二个快照的 index
     */
    addSnapshot() {
      const slidesStore = useSlidesStore()

      // 若当前指针不在末尾，截断后续快照
      if (
        this.snapshotCursor >= 0 &&
        this.snapshotCursor < this.snapshots.length - 1
      ) {
        this.snapshots = this.snapshots.slice(0, this.snapshotCursor + 1)
      }

      // 添加新快照
      const snapshot: Snapshot = {
        index: slidesStore.slideIndex,
        slides: JSON.parse(JSON.stringify(slidesStore.slides)),
      }

      // 快照数大于1时，保证撤回后维持页面焦点不变：更新倒数第二个快照 index
      if (this.snapshots.length >= 1) {
        const prevIndex = this.snapshots.length - 1
        this.snapshots[prevIndex].index = slidesStore.slideIndex
      }

      this.snapshots.push(snapshot)

      // 快照数量限制
      const snapshotLengthLimit = 20
      if (this.snapshots.length > snapshotLengthLimit) {
        // 头部移除一个
        this.snapshots.shift()
        // 指针位置移至尾部（固定为最新）
      }

      this.setSnapshotCursor(this.snapshots.length - 1)
      this.setSnapshotLength(this.snapshots.length)
    },

    /**
     * 撤销到上一个快照并恢复状态（内存）
     */
    unDo() {
      if (this.snapshotCursor <= 0) return

      const slidesStore = useSlidesStore()
      const mainStore = useMainStore()

      const snapshotCursor = this.snapshotCursor - 1
      const snapshot = this.snapshots[snapshotCursor]
      const { index, slides } = snapshot

      const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

      slidesStore.setSlides(slides)
      slidesStore.updateSlideIndex(slideIndex)
      this.setSnapshotCursor(snapshotCursor)
      mainStore.setActiveElementIdList([])
    },

    /**
     * 重做到下一个快照并恢复状态（内存）
     */
    reDo() {
      if (this.snapshotCursor >= this.snapshotLength - 1) return

      const slidesStore = useSlidesStore()
      const mainStore = useMainStore()

      const snapshotCursor = this.snapshotCursor + 1
      const snapshot = this.snapshots[snapshotCursor]
      const { index, slides } = snapshot

      const slideIndex = index > slides.length - 1 ? slides.length - 1 : index

      slidesStore.setSlides(slides)
      slidesStore.updateSlideIndex(slideIndex)
      this.setSnapshotCursor(snapshotCursor)
      mainStore.setActiveElementIdList([])
    },
  },
})
