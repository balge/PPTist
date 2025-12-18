import React, { useEffect, useRef, useState, useMemo } from 'react'
import { useMainStore, useSlidesStore } from '@/store'
import type { ElementLinkType, PPTElementLink } from '@/types/slides'
import useLink from '@/hooks/useLink'
import ThumbnailSlide from '@/views/components/ThumbnailSlide'

interface LinkDialogProps {
  onClose: () => void
}

const LinkDialog: React.FC<LinkDialogProps> = ({ onClose }) => {
  const { handleElement, setDisableHotkeysState } = useMainStore()
  const { slides, currentSlide } = useSlidesStore()
  
  const [type, setType] = useState<ElementLinkType>('web')
  const [address, setAddress] = useState('')
  const [slideId, setSlideId] = useState('')
  
  const { setLink } = useLink()
  const inputRef = useRef<HTMLInputElement>(null)

  const slideOptions = useMemo(() => {
    return slides.map((item, index) => ({
      label: `幻灯片 ${index + 1}`,
      value: item.id,
      disabled: currentSlide?.id === item.id,
    }))
  }, [slides, currentSlide])

  const selectedSlide = useMemo(() => {
    if (!slideId) return null
    return slides.find(item => item.id === slideId) || null
  }, [slideId, slides])

  useEffect(() => {
    setDisableHotkeysState(true)
    
    // Set initial slideId to first valid slide if empty
    const firstValidSlide = slides.find(item => item.id !== currentSlide?.id)
    if (firstValidSlide) setSlideId(firstValidSlide.id)

    if (handleElement?.link) {
      setType(handleElement.link.type)
      if (handleElement.link.type === 'web') setAddress(handleElement.link.target)
      else if (handleElement.link.type === 'slide') setSlideId(handleElement.link.target)
    }

    if (type === 'web') {
      setTimeout(() => inputRef.current?.focus(), 0)
    }

    return () => {
      setDisableHotkeysState(false)
    }
  }, [])

  const save = () => {
    const link: PPTElementLink = {
      type: type,
      target: type === 'web' ? address : slideId,
    }
    if (handleElement) {
      const success = setLink(handleElement, link)
      if (success) onClose()
      else setAddress('')
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000,
    }} onClick={onClose}>
      <div style={{
        width: '540px',
        backgroundColor: '#fff',
        borderRadius: '4px',
        boxShadow: '0 2px 12px 0 rgba(0, 0, 0, 0.1)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
      }} onClick={e => e.stopPropagation()}>
        
        {/* Header/Tabs */}
        <div style={{ display: 'flex', marginBottom: '20px', borderBottom: '1px solid #eee' }}>
          <div 
            style={{ 
              padding: '10px 20px', 
              cursor: 'pointer', 
              color: type === 'web' ? '#d14424' : '#333',
              borderBottom: type === 'web' ? '2px solid #d14424' : 'none',
              fontWeight: type === 'web' ? 'bold' : 'normal'
            }}
            onClick={() => setType('web')}
          >
            网页链接
          </div>
          <div 
            style={{ 
              padding: '10px 20px', 
              cursor: 'pointer', 
              color: type === 'slide' ? '#d14424' : '#333',
              borderBottom: type === 'slide' ? '2px solid #d14424' : 'none',
              fontWeight: type === 'slide' ? 'bold' : 'normal'
            }}
            onClick={() => setType('slide')}
          >
            幻灯片页面
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {type === 'web' ? (
            <input
              ref={inputRef}
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && save()}
              placeholder="请输入网页链接地址"
              style={{
                width: '100%',
                height: '32px',
                padding: '0 10px',
                border: '1px solid #dcdfe6',
                borderRadius: '4px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <select
                value={slideId}
                onChange={e => setSlideId(e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 10px',
                  border: '1px solid #dcdfe6',
                  borderRadius: '4px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              >
                {slideOptions.map(option => (
                  <option key={option.value} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              {selectedSlide && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ marginBottom: '5px', fontSize: '12px', color: '#666' }}>预览：</div>
                  <div style={{ 
                    border: '1px solid rgba(209, 68, 36, 0.15)', 
                    borderRadius: '4px', 
                    overflow: 'hidden',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5'
                  }}>
                    <ThumbnailSlide slide={selectedSlide} size={500} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              padding: '8px 15px',
              backgroundColor: '#fff',
              border: '1px solid #dcdfe6',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#606266'
            }}
          >
            取消
          </button>
          <button 
            onClick={save}
            style={{
              padding: '8px 15px',
              backgroundColor: '#d14424',
              border: '1px solid #d14424',
              borderRadius: '4px',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

export default LinkDialog
