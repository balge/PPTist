import React, { useState, useRef, useMemo, useCallback, useImperativeHandle, forwardRef } from 'react'
import clsx from 'clsx'
import './AudioPlayer.scss'

// Icons
const IconPlayOne = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M15 24V11.8756L25.5 17.9378L36 24L25.5 30.0622L15 36.1244V24Z" fill="currentColor" stroke="none"/></svg>
const IconPause = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M16 12V36" strokeLinecap="round"/><path d="M32 12V36" strokeLinecap="round"/></svg>
const IconVolumeMute = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 15L44 33" strokeLinecap="round"/><path d="M44 15L32 33" strokeLinecap="round"/></svg>
const IconVolumeNotice = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 24C32 18.4772 36.4772 14 42 14" strokeLinecap="round"/><path d="M32 24C32 29.5228 36.4772 34 42 34" strokeLinecap="round"/></svg>
const IconVolumeSmall = () => <svg width="1em" height="1em" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"><path d="M24 6V42C17 42 11.7985 32.8391 11.7985 32.8391H6C4.89543 32.8391 4 31.9437 4 30.8391V17.1609C4 16.0563 4.89543 15.1609 6 15.1609H11.7985C11.7985 15.1609 17 6 24 6Z" fill="currentColor" stroke="none"/><path d="M32 24C32 19.5817 34.5817 17 39 17" strokeLinecap="round"/><path d="M32 24C32 28.4183 34.5817 31 39 31" strokeLinecap="round"/></svg>

export interface AudioPlayerRef {
  toggle: () => void
}

interface AudioPlayerProps {
  src: string
  loop?: boolean
  autoplay?: boolean
  scale?: number
  className?: string
  style?: React.CSSProperties
  onMouseDown?: (e: React.MouseEvent) => void
}

const AudioPlayer = forwardRef<AudioPlayerRef, AudioPlayerProps>(({
  src,
  loop = false,
  autoplay = false,
  scale = 1,
  className,
  style,
  onMouseDown,
}, ref) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const playBarWrapRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)

  const [volume, setVolume] = useState(0.5)
  const [paused, setPaused] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(0)

  const [playBarTimeVisible, setPlayBarTimeVisible] = useState(false)
  const [playBarTime, setPlayBarTime] = useState('00:00')
  const [playBarTimeLeft, setPlayBarTimeLeft] = useState('0')

  const secondToTime = (second = 0) => {
    if (second === 0 || isNaN(second)) return '00:00'
    const add0 = (num: number) => (num < 10 ? '0' + num : '' + num)
    const hour = Math.floor(second / 3600)
    const min = Math.floor((second - hour * 3600) / 60)
    const sec = Math.floor(second - hour * 3600 - min * 60)
    return (hour > 0 ? [hour, min, sec] : [min, sec]).map(add0).join(':')
  }

  const ptime = useMemo(() => secondToTime(currentTime), [currentTime])
  const dtime = useMemo(() => secondToTime(duration), [duration])
  const playedBarWidth = useMemo(() => (duration ? currentTime / duration * 100 : 0) + '%', [currentTime, duration])
  const loadedBarWidth = useMemo(() => (duration ? loaded / duration * 100 : 0) + '%', [loaded, duration])
  const volumeBarWidth = useMemo(() => volume * 100 + '%', [volume])

  const play = () => {
    if (!audioRef.current) return
    setPaused(false)
    audioRef.current.play()
  }

  const pause = () => {
    if (!audioRef.current) return
    setPaused(true)
    audioRef.current.pause()
  }

  const toggle = () => {
    if (paused) play() 
    else pause()
  }

  useImperativeHandle(ref, () => ({
    toggle,
  }))

  const seek = (time: number) => {
    if (!audioRef.current) return
    time = Math.max(time, 0)
    time = Math.min(time, duration)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }

  const changeVolume = (percentage: number) => {
    if (!audioRef.current) return
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    audioRef.current.volume = percentage
    setVolume(percentage)
    if (audioRef.current.muted && percentage !== 0) audioRef.current.muted = false
  }

  const toggleVolume = () => {
    if (!audioRef.current) return
    if (audioRef.current.muted) {
      audioRef.current.muted = false
      changeVolume(0.5)
    } else {
      audioRef.current.muted = true
      changeVolume(0)
    }
  }

  // Event Handlers
  const handleDurationchange = () => setDuration(audioRef.current?.duration || 0)
  const handleTimeupdate = () => setCurrentTime(audioRef.current?.currentTime || 0)
  const handleEnded = () => {
    if (!loop) pause()
    else {
      seek(0)
      play()
    }
  }
  const handleProgress = () => {
    if (audioRef.current && audioRef.current.buffered.length) {
      setLoaded(audioRef.current.buffered.end(audioRef.current.buffered.length - 1))
    }
  }
  const handleError = () => console.error('音频加载失败')

  // Drag handlers
  const getBoundingClientRectViewLeft = (element: HTMLElement) => element.getBoundingClientRect().left

  const thumbMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!audioRef.current || !playBarWrapRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    let percentage = (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) / playBarWrapRef.current.clientWidth
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    const time = percentage * duration
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [duration])

  const thumbUp = useCallback((e: MouseEvent | TouchEvent) => {
    thumbMove(e)
    document.removeEventListener('mousemove', thumbMove)
    document.removeEventListener('touchmove', thumbMove)
    document.removeEventListener('mouseup', thumbUp)
    document.removeEventListener('touchend', thumbUp)
  }, [thumbMove])

  const handleMousedownPlayBar = () => {
    document.addEventListener('mousemove', thumbMove)
    document.addEventListener('touchmove', thumbMove)
    document.addEventListener('mouseup', thumbUp)
    document.addEventListener('touchend', thumbUp)
  }

  const handleMousemovePlayBar = (e: React.MouseEvent) => {
    if (duration && playBarWrapRef.current) {
      const px = playBarWrapRef.current.getBoundingClientRect().left
      const tx = e.clientX - px
      if (tx < 0 || tx > playBarWrapRef.current.offsetWidth) return

      const time = duration * (tx / playBarWrapRef.current.offsetWidth)
      setPlayBarTimeLeft(`${tx - (time >= 3600 ? 25 : 20)}px`)
      setPlayBarTime(secondToTime(time))
      setPlayBarTimeVisible(true)
    }
  }

  const volumeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!volumeBarRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    const percentage = (clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    changeVolume(percentage)
  }, [])

  const volumeUp = useCallback(() => {
    document.removeEventListener('mousemove', volumeMove)
    document.removeEventListener('touchmove', volumeMove)
    document.removeEventListener('mouseup', volumeUp)
    document.removeEventListener('touchend', volumeUp)
  }, [volumeMove])

  const handleMousedownVolumeBar = () => {
    document.addEventListener('mousemove', volumeMove)
    document.addEventListener('touchmove', volumeMove)
    document.addEventListener('mouseup', volumeUp)
    document.addEventListener('touchend', volumeUp)
  }

  const handleClickVolumeBar = (e: React.MouseEvent) => {
    if (!volumeBarRef.current) return
    const percentage = (e.clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    changeVolume(percentage)
  }

  return (
    <div 
      className={clsx('audio-player', className)}
      style={{
        transform: `scale(${1 / scale})`,
        ...style,
      }}
      onMouseDown={onMouseDown}
    >
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoplay}
        onDurationChange={handleDurationchange}
        onTimeUpdate={handleTimeupdate}
        onPlay={() => setPaused(false)}
        onEnded={handleEnded}
        onProgress={handleProgress}
        onError={handleError}
      ></audio>

      <div className="controller">
        <div className="icons">
          <div className="icon play-icon" onClick={toggle}>
            <span className="icon-content">
              {paused ? <IconPlayOne /> : <IconPause />}
            </span>
          </div>
          <div className="volume">
            <div className="icon volume-icon" onClick={toggleVolume}>
              <span className="icon-content">
                {volume === 0 ? <IconVolumeMute /> : volume === 1 ? <IconVolumeNotice /> : <IconVolumeSmall />}
              </span>
            </div>
            <div
              className="volume-bar-wrap"
              onMouseDown={handleMousedownVolumeBar}
              onTouchStart={handleMousedownVolumeBar}
              onClick={handleClickVolumeBar}
            >
              <div className="volume-bar" ref={volumeBarRef}>
                <div className="volume-bar-inner" style={{ width: volumeBarWidth }}>
                  <span className="thumb"></span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <span className="time">
          <span className="ptime">{ptime}</span> / <span className="dtime">{dtime}</span>
        </span>

        <div
          className="bar-wrap"
          ref={playBarWrapRef}
          onMouseDown={handleMousedownPlayBar}
          onTouchStart={handleMousedownPlayBar}
          onMouseMove={handleMousemovePlayBar}
          onMouseEnter={() => setPlayBarTimeVisible(true)}
          onMouseLeave={() => setPlayBarTimeVisible(false)}
        >
          <div 
            className={clsx('bar-time', { 'hidden': !playBarTimeVisible })} 
            style={{ left: playBarTimeLeft }}
          >
            {playBarTime}
          </div>
          <div className="bar">
            <div className="loaded" style={{ width: loadedBarWidth }}></div>
            <div className="played" style={{ width: playedBarWidth }}>
              <span className="thumb"></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default AudioPlayer
