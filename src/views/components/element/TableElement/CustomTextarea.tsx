import React, { useRef, useEffect } from 'react'
import {
  pasteCustomClipboardString,
  pasteExcelClipboardString,
  pasteHTMLTableClipboardString,
} from '@/utils/clipboard'
import styles from './CustomTextarea.module.scss'
import clsx from 'clsx'

interface CustomTextareaProps {
  value: string;
  className?: string;
  style?: React.CSSProperties;
  onUpdateValue: (value: string) => void;
  onInsertExcelData: (data: string[][]) => void;
}

const CustomTextarea: React.FC<CustomTextareaProps> = ({
  value,
  className,
  style,
  onUpdateValue,
  onInsertExcelData,
}) => {
  const textareaRef = useRef<HTMLDivElement>(null)
  const isFocus = useRef(false)

  // 同步数据：当文本框聚焦时，不执行数据同步
  useEffect(() => {
    if (isFocus.current || !textareaRef.current) return
    if (textareaRef.current.innerHTML !== value) {
      textareaRef.current.innerHTML = value
    }
  }, [value])

  const handleInput = () => {
    if (!textareaRef.current) return
    const text = textareaRef.current.innerHTML
    onUpdateValue(text)
  }

  // 聚焦时更新焦点标记，并监听粘贴事件
  const handleFocus = () => {
    isFocus.current = true

  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    if (!e.clipboardData) return

    const clipboardDataFirstItem = e.clipboardData.items[0]

    if (clipboardDataFirstItem && clipboardDataFirstItem.kind === 'string') {
      if (clipboardDataFirstItem.type === 'text/plain') {
        clipboardDataFirstItem.getAsString((text) => {
          const clipboardData = pasteCustomClipboardString(text)
          if (typeof clipboardData === 'object') return

          const excelData = pasteExcelClipboardString(text)
          if (excelData) {
            onInsertExcelData(excelData)
            if (textareaRef.current) {
              textareaRef.current.innerHTML = excelData[0][0]
            }
            return
          }

          document.execCommand('insertText', false, text)
        })
      }
      else if (clipboardDataFirstItem.type === 'text/html') {
        clipboardDataFirstItem.getAsString((html) => {
          const htmlData = pasteHTMLTableClipboardString(html)
          if (htmlData) {
            onInsertExcelData(htmlData)
            if (textareaRef.current) {
              textareaRef.current.innerHTML = htmlData[0][0]
            }
          }
        })
      }
    }
  }

  const handleBlur = () => {
    isFocus.current = false
  }

  return (
    <div
      className={clsx(styles.customTextarea, className)}
      style={style}
      ref={textareaRef}
      contentEditable={true}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleInput}
      onPaste={handlePaste}
      dangerouslySetInnerHTML={{ __html: value }}
    ></div>
  )
}

export default CustomTextarea
