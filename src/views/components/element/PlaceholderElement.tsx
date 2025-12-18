import React from 'react'
import { ElementProps } from './types'

const PlaceholderElement: React.FC<ElementProps> = ({ elementInfo }) => {
  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      border: '1px dashed #999', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      fontSize: '12px',
      color: '#999',
      background: 'rgba(0,0,0,0.05)'
    }}>
      {elementInfo.type}
    </div>
  )
}

export default PlaceholderElement
