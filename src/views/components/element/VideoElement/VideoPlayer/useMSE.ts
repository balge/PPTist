import { useEffect } from 'react'

export default (
  src: string,
  videoRef: React.RefObject<HTMLVideoElement | null>,
) => {
  useEffect(() => {
    if (!videoRef.current) return

    let type = 'normal'
    if (/m3u8(#|\?|$)/i.exec(src)) type = 'hls'
    else if (/.flv(#|\?|$)/i.exec(src)) type = 'flv'

    if (videoRef.current && type === 'hls' && (videoRef.current.canPlayType('application/x-mpegURL') || videoRef.current.canPlayType('application/vnd.apple.mpegURL'))) {
      type = 'normal'
    }

    if (type === 'hls') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const Hls = (window as any).Hls
      
      if (Hls && Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(src)
        hls.attachMedia(videoRef.current)
        
        return () => {
          hls.destroy()
        }
      }
    }
    else if (type === 'flv') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flvjs = (window as any).flvjs
      if (flvjs && flvjs.isSupported()) {
        const flvPlayer = flvjs.createPlayer({
          type: 'flv',
          url: src,
        })
        flvPlayer.attachMediaElement(videoRef.current)
        flvPlayer.load()
        
        return () => {
          flvPlayer.destroy()
        }
      }
    }
  }, [src, videoRef])
}
