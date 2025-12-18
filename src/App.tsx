import React, { useEffect } from 'react'
import { useSlidesStore } from '@/store/slides'
import api from '@/services'
import Editor from '@/views/Editor'

const App: React.FC = () => {
  const { slides, setSlides } = useSlidesStore()

  useEffect(() => {
    const init = async () => {
      const slidesData = await api.getMockData('slides')
      setSlides(slidesData)
    }
    init()
  }, [setSlides])

  return (
    <div className="app" style={{ height: '100%' }}>
      {slides.length > 0 && <Editor />}
    </div>
  )
}

export default App
