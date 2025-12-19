import React from 'react'
import type { PPTElement } from '@/types/slides'
import { LinkOne } from '@icon-park/react'
import styles from './LinkHandler.module.scss'

interface LinkHandlerProps {
  elementInfo: PPTElement
  openLinkDialog: () => void
}

const LinkHandler: React.FC<LinkHandlerProps> = ({
  elementInfo,
  openLinkDialog,
}) => {
  return (
    <div
      className={styles.linkHandler}
      style={{
        left: elementInfo.width / 2 + 'px',
      }}
      onClick={openLinkDialog}
    >
      <LinkOne size={14} fill="#666" />
    </div>
  )
}

export default LinkHandler
