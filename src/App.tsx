import React, { useEffect } from 'react'
import { useSlidesStore, useSnapshotStore } from '@/store'
import api from '@/services'
import Editor from '@/views/Editor'

const App: React.FC = () => {
  const { slides, setSlides } = useSlidesStore()
  const { addSnapshot } = useSnapshotStore()

  useEffect(() => {
    const init = async () => {
      const slidesData = await api.getMockData('slides')
      setSlides(slidesData)
      // 创建首个快照，不依赖数据库初始化
      addSnapshot()
    }
    init()
  }, [setSlides, addSnapshot])

  return (
    <div className="app" style={{ height: '100%' }}>
      {slides.length > 0 && <Editor />}
    </div>
  )
}

export default App
