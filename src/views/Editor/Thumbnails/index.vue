<template>
  <div class="thumbnails">
    <div class="thumbnail-list">
      <div
        v-for="(element, index) in slides"
        :key="element.id"
        class="thumbnail-container"
      >
        <div
          class="thumbnail-item"
          :class="{
            active: slideIndex === index,
            selected: selectedSlidesIndex.includes(index),
          }"
          @click="($event) => handleClickSlideThumbnail($event, index)"
        >
          <div class="label" :class="{ 'offset-left': index >= 99 }">
            {{ fillDigit(index + 1, 2) }}
          </div>
          <ThumbnailSlide class="thumbnail" :slide="element" :size="120" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useMainStore, useSlidesStore } from '@/store'
import { fillDigit } from '@/utils/common'

import ThumbnailSlide from '@/views/components/ThumbnailSlide/index.vue'

const mainStore = useMainStore()
const slidesStore = useSlidesStore()
const { selectedSlidesIndex: _selectedSlidesIndex } = storeToRefs(mainStore)
const { slides, slideIndex } = storeToRefs(slidesStore)

const selectedSlidesIndex = computed(() => [
  ..._selectedSlidesIndex.value,
  slideIndex.value,
])

const editingSectionId = ref('')

// 切换页面
const changeSlideIndex = (index: number) => {
  mainStore.setActiveElementIdList([])

  if (slideIndex.value === index) return
  slidesStore.updateSlideIndex(index)
}

// 点击缩略图
const handleClickSlideThumbnail = (e: MouseEvent, index: number) => {
  if (editingSectionId.value) return
  mainStore.updateSelectedSlidesIndex([])
  changeSlideIndex(index)
}
</script>

<style lang="scss" scoped>
.thumbnails {
  border-right: solid 1px $borderColor;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  user-select: none;
}
.thumbnail-list {
  padding: 5px 0;
  flex: 1;
  overflow: auto;
}
.thumbnail-item {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 0;
  position: relative;

  .thumbnail {
    border-radius: $borderRadius;
    outline: 2px solid rgba($color: $themeColor, $alpha: 0.15);
  }

  &.active {
    .label {
      color: $themeColor;
    }
    .thumbnail {
      outline-color: $themeColor;
    }
  }
  &.selected {
    .thumbnail {
      outline-color: $themeColor;
    }
    .note-flag {
      background-color: $themeColor;

      &::after {
        border-top-color: $themeColor;
      }
    }
  }
}
.label {
  font-size: 12px;
  color: #999;
  width: 20px;
  cursor: grab;

  &.offset-left {
    position: relative;
    left: -4px;
  }

  &:active {
    cursor: grabbing;
  }
}
</style>
