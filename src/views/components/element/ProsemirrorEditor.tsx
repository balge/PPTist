import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
} from 'react'
import { debounce } from 'lodash'
import clsx from 'clsx'
import { useMainStore, useKeyboardStore } from '@/store'
import type { EditorView } from 'prosemirror-view'
import { toggleMark, wrapIn, lift } from 'prosemirror-commands'
import { initProsemirrorEditor, createDocument } from '@/utils/prosemirror'
import {
  isActiveOfParentNodeType,
  findNodesWithSameMark,
  getTextAttrs,
  autoSelectAll,
  addMark,
  markActive,
  getFontsize,
} from '@/utils/prosemirror/utils'
import emitter, {
  EmitterEvents,
  type RichTextAction,
  type RichTextCommand,
} from '@/utils/emitter'
import { alignmentCommand } from '@/utils/prosemirror/commands/setTextAlign'
import {
  indentCommand,
  textIndentCommand,
} from '@/utils/prosemirror/commands/setTextIndent'
import { toggleList } from '@/utils/prosemirror/commands/toggleList'
import { setListStyle } from '@/utils/prosemirror/commands/setListStyle'
import { replaceText } from '@/utils/prosemirror/commands/replaceText'
import type { TextFormatPainterKeys } from '@/types/edit'
import { KEYS } from '@/configs/hotkey'
import './ProsemirrorEditor.scss'

interface ProsemirrorEditorProps {
  elementId: string;
  defaultColor: string;
  defaultFontName: string;
  value: string;
  editable?: boolean;
  autoFocus?: boolean;
  style?: React.CSSProperties;
  onUpdate?: (payload: { value: string; ignore: boolean }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  className?: string;
}

export interface ProsemirrorEditorRef {
  focus: () => void;
}

const ProsemirrorEditor = forwardRef<
  ProsemirrorEditorRef,
  ProsemirrorEditorProps
>(
  (
    {
      elementId,
      defaultColor,
      defaultFontName,
      value,
      editable = false,
      autoFocus = false,
      style,
      onUpdate,
      onFocus,
      onBlur,
      onMouseDown,
      className,
    },
    ref
  ) => {
    const editorViewRef = useRef<HTMLDivElement>(null)
    const editorViewInstance = useRef<EditorView | null>(null)

    const {
      handleElementId,
      textFormatPainter,
      richTextAttrs,
      activeElementIdList,
      setDisableHotkeysState,
      setRichtextAttrs,
      setTextFormatPainter,
    } = useMainStore()

    const { ctrlOrShiftKeyActive } = useKeyboardStore()

    // 暴露 focus 方法
    useImperativeHandle(ref, () => ({
      focus: () => editorViewInstance.current?.focus(),
    }))

    const handleInput = useCallback(
      debounce(
        (isHanldeHistory = false) => {
          if (!editorViewInstance.current) return

          const currentValue = editorViewInstance.current.dom.innerHTML
          if (
            value.replace(/ style=""/g, '') ===
            currentValue.replace(/ style=""/g, '')
          ) {
            return
          }
          onUpdate?.({
            value: currentValue,
            ignore: isHanldeHistory,
          })
        },
        300,
        { trailing: true }
      ),
      [value, onUpdate]
    )

    const handleFocus = useCallback(() => {
      // 多选且按下了ctrl或shift键时，不禁用全局快捷键
      if (!ctrlOrShiftKeyActive || activeElementIdList.length <= 1) {
        setDisableHotkeysState(true)
      }
      onFocus?.()
    }, [
      ctrlOrShiftKeyActive,
      activeElementIdList,
      setDisableHotkeysState,
      onFocus,
    ])

    const handleBlur = useCallback(() => {
      setDisableHotkeysState(false)
      onBlur?.()
    }, [setDisableHotkeysState, onBlur])

    const handleClick = useCallback(
      debounce(
        () => {
          if (!editorViewInstance.current) return
          const attrs = getTextAttrs(editorViewInstance.current, {
            color: defaultColor,
            fontname: defaultFontName,
          })
          setRichtextAttrs(attrs)
        },
        30,
        { trailing: true }
      ),
      [defaultColor, defaultFontName, setRichtextAttrs]
    )

    const handleKeydown = useCallback(
      (view: EditorView, e: KeyboardEvent) => {
        const { ctrlKey, shiftKey, metaKey } = e
        const ctrlActive = ctrlKey || shiftKey || metaKey
        const key = e.key.toUpperCase()

        const isHanldeHistory =
          ctrlActive && (key === KEYS.Z || key === KEYS.Y)

        handleInput(isHanldeHistory)
        handleClick()
      },
      [handleInput, handleClick]
    )

    const handleMouseup = useCallback(() => {
      if (!textFormatPainter) return
      const { keep, ...newProps } = textFormatPainter

      const actions: RichTextAction[] = [{ command: 'clear' }]
      for (const key of Object.keys(newProps) as TextFormatPainterKeys[]) {
        const command = key
        const value = textFormatPainter[key]
        if (value === true) actions.push({ command })
        else if (value) actions.push({ command, value })
      }
      execCommand({ action: actions })
      if (!keep) setTextFormatPainter(null)
    }, [textFormatPainter, setTextFormatPainter])

    // Prosemirror编辑器的初始化
    useEffect(() => {
      if (!editorViewRef.current) return

      const view = initProsemirrorEditor(editorViewRef.current, value, {
        handleDOMEvents: {
          focus: handleFocus,
          blur: handleBlur,
          keydown: handleKeydown,
          click: handleClick,
          mouseup: handleMouseup,
        },
        editable: () => editable,
      })
      editorViewInstance.current = view

      if (autoFocus) view.focus()

      return () => {
        view.destroy()
        editorViewInstance.current = null
      }
    }, []) // 只在挂载时初始化一次，后续 update 通过 props 同步

    // 同步 value 变化
    useEffect(() => {
      if (!editorViewInstance.current) return
      if (editorViewInstance.current.hasFocus()) return

      const { doc, tr } = editorViewInstance.current.state
      editorViewInstance.current.dispatch(
        tr.replaceRangeWith(0, doc.content.size, createDocument(value))
      )
    }, [value])

    // 同步 editable 变化
    useEffect(() => {
      if (!editorViewInstance.current) return
      editorViewInstance.current.setProps({ editable: () => editable })
    }, [editable])

    const execCommand = useCallback(
      ({ target, action }: RichTextCommand) => {
        const editorView = editorViewInstance.current
        if (!editorView) return

        if (!target && handleElementId !== elementId) return
        if (target && target !== elementId) return

        const actions = 'command' in action ? [action] : action

        for (const item of actions) {
          if (item.command === 'fontname' && item.value !== undefined) {
            const mark = editorView.state.schema.marks.fontname.create({
              fontname: item.value,
            })
            autoSelectAll(editorView)
            addMark(editorView, mark)

            if (item.value && !document.fonts.check(`16px ${item.value}`)) {
              console.warn('字体需要等待加载下载后生效，请稍等')
            }
          }
          else if (item.command === 'fontsize' && item.value) {
            const mark = editorView.state.schema.marks.fontsize.create({
              fontsize: item.value,
            })
            autoSelectAll(editorView)
            addMark(editorView, mark)
            setListStyle(editorView, { key: 'fontsize', value: item.value })
          }
          else if (item.command === 'fontsize-add') {
            const step = item.value ? +item.value : 2
            autoSelectAll(editorView)
            const fontsize = getFontsize(editorView) + step + 'px'
            const mark = editorView.state.schema.marks.fontsize.create({
              fontsize,
            })
            addMark(editorView, mark)
            setListStyle(editorView, { key: 'fontsize', value: fontsize })
          }
          else if (item.command === 'fontsize-reduce') {
            const step = item.value ? +item.value : 2
            autoSelectAll(editorView)
            let fontsize = getFontsize(editorView) - step
            if (fontsize < 12) fontsize = 12
            const mark = editorView.state.schema.marks.fontsize.create({
              fontsize: fontsize + 'px',
            })
            addMark(editorView, mark)
            setListStyle(editorView, {
              key: 'fontsize',
              value: fontsize + 'px',
            })
          }
          else if (item.command === 'color' && item.value) {
            const mark = editorView.state.schema.marks.forecolor.create({
              color: item.value,
            })
            autoSelectAll(editorView)
            addMark(editorView, mark)
            setListStyle(editorView, { key: 'color', value: item.value })
          }
          else if (item.command === 'backcolor' && item.value) {
            const mark = editorView.state.schema.marks.backcolor.create({
              backcolor: item.value,
            })
            autoSelectAll(editorView)
            addMark(editorView, mark)
          }
          else if (item.command === 'bold') {
            autoSelectAll(editorView)
            toggleMark(editorView.state.schema.marks.strong)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'em') {
            autoSelectAll(editorView)
            toggleMark(editorView.state.schema.marks.em)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'underline') {
            autoSelectAll(editorView)
            toggleMark(editorView.state.schema.marks.underline)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'strikethrough') {
            autoSelectAll(editorView)
            toggleMark(editorView.state.schema.marks.strikethrough)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'subscript') {
            toggleMark(editorView.state.schema.marks.subscript)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'superscript') {
            toggleMark(editorView.state.schema.marks.superscript)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'blockquote') {
            const isBlockquote = isActiveOfParentNodeType(
              'blockquote',
              editorView.state
            )
            if (isBlockquote) lift(editorView.state, editorView.dispatch)
            else {
              wrapIn(editorView.state.schema.nodes.blockquote)(
                editorView.state,
                editorView.dispatch
              )
            }
          }
          else if (item.command === 'code') {
            toggleMark(editorView.state.schema.marks.code)(
              editorView.state,
              editorView.dispatch
            )
          }
          else if (item.command === 'align' && item.value) {
            alignmentCommand(editorView, item.value)
          }
          else if (item.command === 'indent' && item.value) {
            indentCommand(editorView, +item.value)
          }
          else if (item.command === 'textIndent' && item.value) {
            textIndentCommand(editorView, +item.value)
          }
          else if (item.command === 'bulletList') {
            const listStyleType = item.value || ''
            const { bullet_list: bulletList, list_item: listItem } =
              editorView.state.schema.nodes
            const textStyle = {
              color: richTextAttrs.color,
              fontsize: richTextAttrs.fontsize,
            }
            toggleList(
              bulletList,
              listItem,
              listStyleType,
              textStyle
            )(editorView.state, editorView.dispatch)
          }
          else if (item.command === 'orderedList') {
            const listStyleType = item.value || ''
            const { ordered_list: orderedList, list_item: listItem } =
              editorView.state.schema.nodes
            const textStyle = {
              color: richTextAttrs.color,
              fontsize: richTextAttrs.fontsize,
            }
            toggleList(
              orderedList,
              listItem,
              listStyleType,
              textStyle
            )(editorView.state, editorView.dispatch)
          }
          else if (item.command === 'clear') {
            autoSelectAll(editorView)
            const { $from, $to } = editorView.state.selection
            editorView.dispatch(
              editorView.state.tr.removeMark($from.pos, $to.pos)
            )
            setListStyle(editorView, [
              { key: 'fontsize', value: '' },
              { key: 'color', value: '' },
            ])
          }
          else if (item.command === 'link') {
            const markType = editorView.state.schema.marks.link
            const { from, to } = editorView.state.selection
            const result = findNodesWithSameMark(
              editorView.state.doc,
              from,
              to,
              markType
            )
            if (result) {
              if (item.value) {
                const mark = editorView.state.schema.marks.link.create({
                  href: item.value,
                  title: item.value,
                })
                addMark(editorView, mark, {
                  from: result.from.pos,
                  to: result.to.pos + 1,
                })
              }
              else {
                editorView.dispatch(
                  editorView.state.tr.removeMark(
                    result.from.pos,
                    result.to.pos + 1,
                    markType
                  )
                )
              }
            }
            else if (markActive(editorView.state, markType)) {
              if (item.value) {
                const mark = editorView.state.schema.marks.link.create({
                  href: item.value,
                  title: item.value,
                })
                addMark(editorView, mark)
              }
              else {
                toggleMark(markType)(editorView.state, editorView.dispatch)
              }
            }
            else if (item.value) {
              autoSelectAll(editorView)
              toggleMark(markType, { href: item.value, title: item.value })(
                editorView.state,
                editorView.dispatch
              )
            }
          }
          else if (item.command === 'insert' && item.value) {
            editorView.dispatch(editorView.state.tr.insertText(item.value))
          }
          else if (item.command === 'replace' && item.value) {
            replaceText(editorView, item.value)
          }
        }

        editorView.focus()
        handleInput()
        handleClick()
      },
      [handleElementId, elementId, richTextAttrs, handleInput, handleClick]
    )

    const syncAttrsToStore = useCallback(() => {
      if (handleElementId !== elementId) return
      handleClick()
    }, [handleElementId, elementId, handleClick])

    // 注册事件
    useEffect(() => {
      emitter.on(EmitterEvents.RICH_TEXT_COMMAND, execCommand)
      emitter.on(EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE, syncAttrsToStore)
      return () => {
        emitter.off(EmitterEvents.RICH_TEXT_COMMAND, execCommand)
        emitter.off(
          EmitterEvents.SYNC_RICH_TEXT_ATTRS_TO_STORE,
          syncAttrsToStore
        )
      }
    }, [execCommand, syncAttrsToStore])

    return (
      <div
        className={clsx('prosemirror-editor', {
          'format-painter': textFormatPainter,
          className,
        })}
        ref={editorViewRef}
        onMouseDown={onMouseDown}
        style={style}
      ></div>
    )
  }
)

export default ProsemirrorEditor
