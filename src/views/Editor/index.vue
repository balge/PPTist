<template>
  <div class="pptist-editor">
    <div class="layout-content">
      <Thumbnails class="layout-content-left" />
      <div class="layout-content-center">
        <Canvas />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import useGlobalHotkey from '@/hooks/useGlobalHotkey'

import Canvas from './Canvas/index.vue'
import Thumbnails from './Thumbnails/index.vue'

useGlobalHotkey()
</script>

<style lang="scss" scoped>
.pptist-editor {
  height: 100%;
}
.layout-content {
  height: 100%;
  display: flex;
}
.layout-content-left {
  width: 160px;
  height: 100%;
  flex-shrink: 0;
}
.layout-content-center {
  width: calc(100% - 160px);
}
</style>
