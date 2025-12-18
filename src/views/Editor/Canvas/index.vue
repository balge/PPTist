<template>
  <div
    class="canvas"
    ref="canvasRef"
    @wheel="($event) => handleMousewheelCanvas($event)"
    @mousedown="($event) => handleClickBlankArea($event)"
    @dblclick="($event) => handleDblClick($event)"
    v-click-outside="removeEditorAreaFocus"
  >
    <div
      class="viewport-wrapper"
      :style="{
        width: viewportStyles.width * canvasScale + 'px',
        height: viewportStyles.height * canvasScale + 'px',
        left: viewportStyles.left + 'px',
        top: viewportStyles.top + 'px',
      }"
    >
      <div class="operates">
        <Operate
          v-for="element in elementList"
          :key="element.id"
          :elementInfo="element"
          :isSelected="activeElementIdList.includes(element.id)"
          :isActive="handleElementId === element.id"
          :isActiveGroupElement="activeGroupElementId === element.id"
          :isMultiSelect="activeElementIdList.length > 1"
          :rotateElement="rotateElement"
          :scaleElement="scaleElement"
          :openLinkDialog="openLinkDialog"
          :dragLineElement="dragLineElement"
          :moveShapeKeypoint="moveShapeKeypoint"
          v-show="!hiddenElementIdList.includes(element.id)"
        />
        <ViewportBackground />
      </div>
      <div
        class="viewport"
        ref="viewportRef"
        :style="{ transform: `scale(${canvasScale})` }"
      >
        <MouseSelection
          v-if="mouseSelectionVisible"
          :top="mouseSelection.top"
          :left="mouseSelection.left"
          :width="mouseSelection.width"
          :height="mouseSelection.height"
          :quadrant="mouseSelectionQuadrant"
        />
        <EditableElement
          v-for="(element, index) in elementList"
          :key="element.id"
          :elementInfo="element"
          :elementIndex="index + 1"
          :isMultiSelect="activeElementIdList.length > 1"
          :selectElement="selectElement"
          :openLinkDialog="openLinkDialog"
          v-show="!hiddenElementIdList.includes(element.id)"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {
  nextTick,
  onMounted,
  onUnmounted,
  provide,
  ref,
  watch,
  watchEffect,
  useTemplateRef,
} from 'vue'
import { throttle } from 'lodash'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore, useKeyboardStore } from '@/store'
import type { PPTElement } from '@/types/slides'
import type { AlignmentLineProps } from '@/types/edit'
import { injectKeySlideScale } from '@/types/injectKey'
import { removeAllRanges } from '@/utils/selection'
import { KEYS } from '@/configs/hotkey'

import useViewportSize from './hooks/useViewportSize'
import useMouseSelection from './hooks/useMouseSelection'
import useDrop from './hooks/useDrop'
import useRotateElement from './hooks/useRotateElement'
import useScaleElement from './hooks/useScaleElement'
import useSelectAndMoveElement from './hooks/useSelectElement'
import useDragElement from './hooks/useDragElement'
import useDragLineElement from './hooks/useDragLineElement'
import useMoveShapeKeypoint from './hooks/useMoveShapeKeypoint'

import useSlideHandler from '@/hooks/useSlideHandler'
import useCreateElement from '@/hooks/useCreateElement'
import ViewportBackground from './ViewportBackground.vue'

import EditableElement from './EditableElement.vue'
import MouseSelection from './MouseSelection.vue'
import Operate from './Operate/index.vue'

const mainStore = useMainStore()
const {
  activeElementIdList,
  activeGroupElementId,
  handleElementId,
  hiddenElementIdList,
  editorAreaFocus,
  creatingElement,
  creatingCustomShape,
  canvasScale,
  textFormatPainter,
} = storeToRefs(mainStore)
const { currentSlide } = storeToRefs(useSlidesStore())
const { spaceKeyState } = storeToRefs(useKeyboardStore())

const viewportRef = useTemplateRef<HTMLElement>('viewportRef')
const alignmentLines = ref<AlignmentLineProps[]>([])

const linkDialogVisible = ref(false)
const openLinkDialog = () => (linkDialogVisible.value = true)

watch(handleElementId, () => {
  mainStore.setActiveGroupElementId('')
})

const elementList = ref<PPTElement[]>([])
const setLocalElementList = () => {
  elementList.value = currentSlide.value
    ? JSON.parse(JSON.stringify(currentSlide.value.elements))
    : []
}
watchEffect(setLocalElementList)

const canvasRef = useTemplateRef<HTMLElement>('canvasRef')
const { dragViewport, viewportStyles } = useViewportSize(canvasRef)

useDrop(canvasRef)

const {
  mouseSelection,
  mouseSelectionVisible,
  mouseSelectionQuadrant,
  updateMouseSelection,
} = useMouseSelection(elementList, viewportRef)

const { dragElement } = useDragElement(
  elementList,
  alignmentLines,
  canvasScale
)
const { dragLineElement } = useDragLineElement(elementList)
const { selectElement } = useSelectAndMoveElement(elementList, dragElement)
const { scaleElement } = useScaleElement(
  elementList,
  alignmentLines,
  canvasScale
)
const { rotateElement } = useRotateElement(
  elementList,
  viewportRef,
  canvasScale
)
const { moveShapeKeypoint } = useMoveShapeKeypoint(elementList, canvasScale)

const { updateSlideIndex } = useSlideHandler()
const { createTextElement } = useCreateElement()

// 组件渲染时，如果存在元素焦点，需要清除
// 这种情况存在于：有焦点元素的情况下进入了放映模式，再退出时，需要清除原先的焦点（因为可能已经切换了页面）
onMounted(() => {
  if (activeElementIdList.value.length) {
    nextTick(() => mainStore.setActiveElementIdList([]))
  }
})

/** 点击画布空白区域，清空焦点并切换拖拽/框选状态 */
const handleClickBlankArea = (e: MouseEvent) => {
  if (activeElementIdList.value.length) mainStore.setActiveElementIdList([])

  if (!spaceKeyState.value) updateMouseSelection(e)
  else dragViewport(e)

  if (!editorAreaFocus.value) mainStore.setEditorareaFocus(true)
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
  removeAllRanges()
}

/** 双击空白处插入文本元素 */
const handleDblClick = (e: MouseEvent) => {
  if (
    activeElementIdList.value.length ||
    creatingElement.value ||
    creatingCustomShape.value
  ) {
    return
  }
  if (!viewportRef.value) return

  const viewportRect = viewportRef.value.getBoundingClientRect()
  const left = (e.pageX - viewportRect.x) / canvasScale.value
  const top = (e.pageY - viewportRect.y) / canvasScale.value

  createTextElement({
    left,
    top,
    width: 200 / canvasScale.value, // 除以 canvasScale 是为了与点击选区创建的形式保持相同的宽度
    height: 0,
  })
}

/** 组件卸载时清空格式刷状态 */
onUnmounted(() => {
  if (textFormatPainter.value) mainStore.setTextFormatPainter(null)
})

/** 移除画布编辑区域焦点 */
const removeEditorAreaFocus = () => {
  if (editorAreaFocus.value) mainStore.setEditorareaFocus(false)
}

/** 鼠标滚轮仅用于翻页 */
const throttleUpdateSlideIndex = throttle(updateSlideIndex, 300, {
  leading: true,
  trailing: false,
})

const handleMousewheelCanvas = (e: WheelEvent) => {
  e.preventDefault()

  if (e.deltaY > 0) throttleUpdateSlideIndex(KEYS.DOWN)
  else if (e.deltaY < 0) throttleUpdateSlideIndex(KEYS.UP)
}

provide(injectKeySlideScale, canvasScale)
</script>

<style lang="scss" scoped>
.canvas {
  height: 100%;
  user-select: none;
  overflow: hidden;
  background-color: $lightGray;
  position: relative;
}
.drag-mask {
  cursor: grab;
  @include absolute-0();
}
.viewport-wrapper {
  position: absolute;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.01), 0 0 12px 0 rgba(0, 0, 0, 0.1);
}
.viewport {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
}
</style>
