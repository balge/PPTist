import { useSlidesStore } from '@/store'
import type { PPTElement, PPTElementLink } from '@/types/slides'
import useHistorySnapshot from '@/hooks/useHistorySnapshot'

export default () => {
  const { updateElement, removeElementProps } = useSlidesStore()

  const { addHistorySnapshot } = useHistorySnapshot()

  const setLink = (handleElement: PPTElement, link: PPTElementLink) => {
    const linkRegExp =
      /^(https?):\/\/[\w\-]+(\.[\w\-]+)+([\w\-.,@?^=%&:\/~+#]*[\w\-@?^=%&\/~+#])?$/
    if (link.type === 'web' && !linkRegExp.test(link.target)) {
      console.error('不是正确的网页链接地址')
      return false
    }
    if (link.type === 'slide' && !link.target) {
      console.error('请先选择链接目标')
      return false
    }
    const props = { link }
    updateElement({ id: handleElement.id, props })
    addHistorySnapshot()

    return true
  }

  const removeLink = (handleElement: PPTElement) => {
    removeElementProps({ id: handleElement.id, propName: 'link' })
    addHistorySnapshot()
  }

  return {
    setLink,
    removeLink,
  }
}
