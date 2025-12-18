import { useEffect } from 'react'
import { useMainStore } from '@/store'
import usePasteTextClipboardData from './usePasteTextClipboardData'
import usePasteDataTransfer from './usePasteDataTransfer'

export default () => {
  const { editorAreaFocus, thumbnailsFocus, disableHotkeys } = useMainStore()

  const { pasteTextClipboardData } = usePasteTextClipboardData()
  const { pasteDataTransfer } = usePasteDataTransfer()

  useEffect(() => {
    const pasteListener = (e: ClipboardEvent) => {
      // Need access to latest state
      const state = useMainStore.getState()
      if (!state.editorAreaFocus && !state.thumbnailsFocus) return
      if (state.disableHotkeys) return

      if (!e.clipboardData) return

      const { isFile, dataTransferFirstItem } = pasteDataTransfer(e.clipboardData)
      if (isFile) return
      
      // 如果剪贴板内不存在有效文件，但有文字内容，尝试解析文字内容
      if (dataTransferFirstItem && dataTransferFirstItem.kind === 'string' && dataTransferFirstItem.type === 'text/plain') {
        dataTransferFirstItem.getAsString(text => pasteTextClipboardData(text))
      }
    }

    document.addEventListener('paste', pasteListener)
    return () => {
      document.removeEventListener('paste', pasteListener)
    }
  }, [pasteTextClipboardData, pasteDataTransfer])
}
