import React from 'react'

interface PatternDefsProps {
  id: string
  src: string
}

const PatternDefs: React.FC<PatternDefsProps> = ({ id, src }) => {
  return (
    <pattern id={id} patternContentUnits="objectBoundingBox" patternUnits="objectBoundingBox" width="1" height="1">
      <image href={src} width="1" height="1" preserveAspectRatio="xMidYMid slice" />
    </pattern>
  )
}

export default PatternDefs
