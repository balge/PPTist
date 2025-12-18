import React from 'react'
import { PPTElement } from '@/types/slides'

export interface ElementProps {
  elementInfo: PPTElement
  selectElement?: (e: React.MouseEvent | React.TouchEvent, element: PPTElement, canMove?: boolean) => void
  contextmenus?: () => any[]
}
