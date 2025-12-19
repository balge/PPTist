import { useEffect, type RefObject } from 'react'

export default function useClickOutside(
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      const el = ref.current
      if (!el) return

      // Use composedPath to handle Shadow DOM if present, fallback to contains
      const path = event.composedPath?.()
      const isClickOutside = path 
        ? !path.includes(el) 
        : !el.contains(event.target as Node)

      if (isClickOutside) {
        handler(event)
      }
    }

    // Use mousedown/touchstart for better responsiveness, or click to match Vue directive
    // Vue directive used 'click', but 'mousedown' is often better for "outside" detection.
    // However, to be safe and consistent with "click-outside", let's use 'click' or 'mousedown'.
    // The Vue code used: document.addEventListener('click', ...)
    // So I will use 'click' to minimize behavior change.
    document.addEventListener('click', listener)

    return () => {
      document.removeEventListener('click', listener)
    }
  }, [ref, handler])
}
