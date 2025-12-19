import React from 'react'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import Canvas from './Canvas'
import Thumbnails from './Thumbnails'
import './index.scss'

const Editor: React.FC = () => {
  useGlobalHotkey()

  return (
    <div className="pptist-editor">
      <div className="layout-content">
        <Thumbnails className="layout-content-left" />
        <div className="layout-content-center">
          <Canvas />
        </div>
      </div>
    </div>
  )
}

export default Editor
