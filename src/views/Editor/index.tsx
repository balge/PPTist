import React from 'react'
import useGlobalHotkey from '@/hooks/useGlobalHotkey'
import { useMainStore } from '@/store'
import Canvas from './Canvas'
import Thumbnails from './Thumbnails'

const Editor: React.FC = () => {
  // Enable global hotkeys
  useGlobalHotkey()

  const { canvasScale } = useMainStore()

  return (
    <div className="pptist-editor" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ddd', background: '#f5f5f5', flexShrink: 0 }}>
        <h1>PPTist Editor (React Version)</h1>
        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>Canvas Scale: {Math.round(canvasScale * 100)}% (Ctrl +/- to zoom)</p>
      </div>
      
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden', display: 'flex' }}>
        <Thumbnails />
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <Canvas />
        </div>
      </div>
    </div>
  )
}

export default Editor
