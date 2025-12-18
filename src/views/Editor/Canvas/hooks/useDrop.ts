import { useEffect, type RefObject } from 'react'
import { useMainStore } from '@/store'
import { parseText2Paragraphs } from '@/utils/textParser'
import useCreateElement from '@/hooks/useCreateElement'
import usePasteDataTransfer from '@/hooks/usePasteDataTransfer'

export default (elementRef: RefObject<HTMLElement>) => {
  const { createTextElement } = useCreateElement()
  const { pasteDataTransfer } = usePasteDataTransfer()

  useEffect(() => {
    const handleDrop = (e: DragEvent) => {
      if (!e.dataTransfer || e.dataTransfer.items.length === 0) return

      const { isFile, dataTransferFirstItem } = pasteDataTransfer(e.dataTransfer)
      if (isFile) return
      
      if (dataTransferFirstItem && dataTransferFirstItem.kind === 'string' && dataTransferFirstItem.type === 'text/plain') {
        dataTransferFirstItem.getAsString(text => {
          if (useMainStore.getState().disableHotkeys) return
          const string = parseText2Paragraphs(text)
          createTextElement({
            left: 0,
            top: 0,
            width: 600,
            height: 50,
          }, { content: string })
        })
      }
    }

    const preventDefault = (e: DragEvent) => e.preventDefault()

    const el = elementRef.current
    if (el) {
      el.addEventListener('drop', handleDrop)
    }

    document.addEventListener('dragleave', preventDefault)
    document.addEventListener('drop', preventDefault)
    document.addEventListener('dragenter', preventDefault)
    document.addEventListener('dragover', preventDefault)

    return () => {
      if (el) {
        el.removeEventListener('drop', handleDrop)
      }
      document.removeEventListener('dragleave', preventDefault)
      document.removeEventListener('drop', preventDefault)
      document.removeEventListener('dragenter', preventDefault)
      document.removeEventListener('dragover', preventDefault)
    }
  }, [elementRef.current]) // Re-bind if ref element changes
}
