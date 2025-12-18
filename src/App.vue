<template>
  <template v-if="slides.length">
    <Editor />
  </template>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useSnapshotStore, useSlidesStore } from '@/store'
import api from '@/services'

import Editor from './views/Editor/index.vue'

const slidesStore = useSlidesStore()
const snapshotStore = useSnapshotStore()
const { slides } = storeToRefs(slidesStore)

onMounted(async () => {
  const slides = await api.getMockData('slides')
  slidesStore.setSlides(slides)
  // 创建首个快照，不依赖数据库初始化
  snapshotStore.addSnapshot()
})
</script>

<style lang="scss">
#app {
  height: 100%;
}
</style>
