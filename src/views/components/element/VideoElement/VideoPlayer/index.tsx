import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react'
import clsx from 'clsx'
import useMSE from './useMSE'
import styles from './index.module.scss'
import {
  Pause,
  PlayOne,
  VolumeMute,
  VolumeNotice,
  VolumeSmall,
} from '@icon-park/react'

interface VideoPlayerProps {
  width: number;
  height: number;
  src: string;
  poster?: string;
  autoplay?: boolean;
  scale?: number;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  width,
  height,
  src,
  poster = '',
  autoplay = false,
  scale = 1,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const playBarWrapRef = useRef<HTMLDivElement>(null)
  const volumeBarRef = useRef<HTMLDivElement>(null)
  const bgCanvasRef = useRef<HTMLCanvasElement>(null)

  const [volume, setVolume] = useState(0.5)
  const [paused, setPaused] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [loop, setLoop] = useState(false)
  const [bezelTransition, setBezelTransition] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [loadError, setLoadError] = useState(false)

  const [playBarTimeVisible, setPlayBarTimeVisible] = useState(false)
  const [playBarTime, setPlayBarTime] = useState('00:00')
  const [playBarTimeLeft, setPlayBarTimeLeft] = useState('0')
  const [speedMenuVisible, setSpeedMenuVisible] = useState(false)
  const [hideController, setHideController] = useState(false)

  useMSE(src, videoRef)

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
  const playedBarWidth = useMemo(
    () => (duration ? (currentTime / duration) * 100 : 0) + '%',
    [currentTime, duration]
  )
  const loadedBarWidth = useMemo(
    () => (duration ? (loaded / duration) * 100 : 0) + '%',
    [loaded, duration]
  )
  const volumeBarWidth = useMemo(() => volume * 100 + '%', [volume])

  const speedOptions = [
    { label: '2x', value: 2 },
    { label: '1.5x', value: 1.5 },
    { label: '1.25x', value: 1.25 },
    { label: '1x', value: 1 },
    { label: '0.75x', value: 0.75 },
    { label: '0.5x', value: 0.5 },
  ]

  const autoHideControllerTimer = useRef<NodeJS.Timeout | null>(null)

  const autoHideController = useCallback(() => {
    setHideController(false)
    if (autoHideControllerTimer.current) {
      clearTimeout(autoHideControllerTimer.current)
    }
    autoHideControllerTimer.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setHideController(true)
    }, 3000)
  }, [])

  const play = () => {
    if (!videoRef.current) return
    setPaused(false)
    videoRef.current.play()
    setBezelTransition(true)
    autoHideController()
  }

  const pause = () => {
    if (!videoRef.current) return
    setPaused(true)
    videoRef.current.pause()
    setBezelTransition(true)
    autoHideController()
  }

  const toggle = () => {
    if (paused) play()
    else pause()
  }

  const seek = (time: number) => {
    if (!videoRef.current) return
    time = Math.max(time, 0)
    time = Math.min(time, duration)
    videoRef.current.currentTime = time
    setCurrentTime(time)
  }

  const changeVolume = (percentage: number) => {
    if (!videoRef.current) return
    percentage = Math.max(percentage, 0)
    percentage = Math.min(percentage, 1)
    videoRef.current.volume = percentage
    setVolume(percentage)
    if (videoRef.current.muted && percentage !== 0) {
      videoRef.current.muted = false
    }
  }

  const speed = (rate: number) => {
    if (videoRef.current) videoRef.current.playbackRate = rate
    setPlaybackRate(rate)
  }

  const toggleVolume = () => {
    if (!videoRef.current) return
    if (videoRef.current.muted) {
      videoRef.current.muted = false
      changeVolume(0.5)
    }
    else {
      videoRef.current.muted = true
      changeVolume(0)
    }
  }

  const toggleLoop = () => {
    setLoop(!loop)
  }

  // Event Handlers for Video Element
  const handleDurationchange = () =>
    setDuration(videoRef.current?.duration || 0)
  const handleTimeupdate = () =>
    setCurrentTime(videoRef.current?.currentTime || 0)
  const handleEnded = () => {
    if (!loop) pause()
    else {
      seek(0)
      play()
    }
  }
  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length) {
      setLoaded(
        videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      )
    }
  }
  const handleError = () => setLoadError(true)

  // Drag handlers for Play Bar
  const getBoundingClientRectViewLeft = (element: HTMLElement) =>
    element.getBoundingClientRect().left

  const thumbMove = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!videoRef.current || !playBarWrapRef.current) return
      const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
      let percentage =
        (clientX - getBoundingClientRectViewLeft(playBarWrapRef.current)) /
        playBarWrapRef.current.clientWidth
      percentage = Math.max(percentage, 0)
      percentage = Math.min(percentage, 1)
      const time = percentage * duration
      videoRef.current.currentTime = time
      setCurrentTime(time)
    },
    [duration]
  )

  const thumbUp = useCallback(
    (e: MouseEvent | TouchEvent) => {
      thumbMove(e)
      document.removeEventListener('mousemove', thumbMove)
      document.removeEventListener('touchmove', thumbMove)
      document.removeEventListener('mouseup', thumbUp)
      document.removeEventListener('touchend', thumbUp)
    },
    [thumbMove]
  )

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

  // Drag handlers for Volume Bar
  const volumeMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (!volumeBarRef.current) return
    const clientX = 'clientX' in e ? e.clientX : e.changedTouches[0].clientX
    const percentage =
      (clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
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
    const percentage =
      (e.clientX - getBoundingClientRectViewLeft(volumeBarRef.current)) / 45
    changeVolume(percentage)
  }

  // Draw background canvas
  useEffect(() => {
    if (!bgCanvasRef.current || !videoRef.current) return
    const ctx = bgCanvasRef.current.getContext('2d')
    if (!ctx) return

    const handleLoadedMetadata = () => {
      videoRef.current!.requestVideoFrameCallback(() => {
        if (videoRef.current && bgCanvasRef.current) {
          ctx.drawImage(
            videoRef.current,
            0,
            0,
            bgCanvasRef.current.width,
            bgCanvasRef.current.height
          )
        }
      })
    }

    videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata, {
      once: true,
    })
  }, [])

  return (
    <div
      className={clsx(styles.videoPlayer, { [styles.hideController]: hideController })}
      style={{
        width: width * scale + 'px',
        height: height * scale + 'px',
        transform: `scale(${1 / scale})`,
      }}
      onMouseMove={autoHideController}
      onClick={autoHideController}
    >
      <div className={styles.videoWrap} onClick={toggle}>
        {loadError && <div className={styles.loadError}>视频加载失败</div>}

        <canvas ref={bgCanvasRef} className={styles.bgCanvas}></canvas>
        <video
          className={styles.video}
          ref={videoRef}
          src={src}
          autoPlay={autoplay}
          poster={poster}
          playsInline
          crossOrigin="anonymous"
          onDurationChange={handleDurationchange}
          onTimeUpdate={handleTimeupdate}
          onEnded={handleEnded}
          onProgress={handleProgress}
          onPlay={() => {
            autoHideController()
            setPaused(false)
          }}
          onPause={() => autoHideController()}
          onError={handleError}
        ></video>
        <div className={styles.bezel}>
          <span
            className={clsx(styles.bezelIcon, {
              [styles.bezelTransition]: bezelTransition,
            })}
            onAnimationEnd={() => setBezelTransition(false)}
          >
            {paused ? <Pause /> : <PlayOne />}
          </span>
        </div>
      </div>

      <div className={styles.controllerMask}></div>
      <div className={styles.controller}>
        <div className={styles.icons}>
          <div
            className={clsx(styles.icon, styles.playIcon)}
            onClick={(e) => {
              e.stopPropagation()
              toggle()
            }}
          >
            <span className={styles.iconContent}>
              {paused ? <PlayOne /> : <Pause />}
            </span>
          </div>
          <div className={styles.volume}>
            <div
              className={clsx(styles.icon, styles.volumeIcon)}
              onClick={(e) => {
                e.stopPropagation()
                toggleVolume()
              }}
            >
              <span className={styles.iconContent}>
                {volume === 0 ? (
                  <VolumeMute />
                ) : volume === 1 ? (
                  <VolumeNotice />
                ) : (
                  <VolumeSmall />
                )}
              </span>
            </div>
            <div
              className={styles.volumeBarWrap}
              onMouseDown={(e) => {
                e.stopPropagation()
                handleMousedownVolumeBar()
              }}
              onTouchStart={(e) => {
                e.stopPropagation()
                handleMousedownVolumeBar()
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleClickVolumeBar(e)
              }}
            >
              <div className={styles.volumeBar} ref={volumeBarRef}>
                <div
                  className={styles.volumeBarInner}
                  style={{ width: volumeBarWidth }}
                >
                  <span className={styles.thumb}></span>
                </div>
              </div>
            </div>
          </div>
          <span className={styles.time}>
            <span className={styles.ptime}>{ptime}</span> /{' '}
            <span className={styles.dtime}>{dtime}</span>
          </span>
        </div>

        <div className={clsx(styles.icons, styles.iconsRight)}>
          <div className={styles.speed}>
            <div
              className={clsx(styles.icon, styles.speedIcon)}
              onMouseLeave={() => setSpeedMenuVisible(false)}
            >
              <span
                className={styles.iconContent}
                onClick={(e) => {
                  e.stopPropagation()
                  setSpeedMenuVisible(!speedMenuVisible)
                }}
              >
                {playbackRate === 1 ? '倍速' : playbackRate + 'x'}
              </span>
              {speedMenuVisible && (
                <div className={styles.speedMenu}>
                  {speedOptions.map((item) => (
                    <div
                      key={item.label}
                      className={clsx(styles.speedMenuItem, {
                        [styles.speedMenuItemActive]: item.value === playbackRate,
                      })}
                      onClick={(e) => {
                        e.stopPropagation()
                        speed(item.value)
                        setSpeedMenuVisible(false)
                      }}
                    >
                      {item.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={styles.loop}
            onClick={(e) => {
              e.stopPropagation()
              toggleLoop()
            }}
          >
            <div className={clsx(styles.icon, styles.loopIcon, { [styles.iconActive]: loop })}>
              <span className={styles.iconContent}>循环{loop ? '开' : '关'}</span>
            </div>
          </div>
        </div>

        <div
          className={styles.barWrap}
          ref={playBarWrapRef}
          onMouseDown={(e) => {
            e.stopPropagation()
            handleMousedownPlayBar()
          }}
          onTouchStart={(e) => {
            e.stopPropagation()
            handleMousedownPlayBar()
          }}
          onMouseMove={handleMousemovePlayBar}
          onMouseEnter={() => setPlayBarTimeVisible(true)}
          onMouseLeave={() => setPlayBarTimeVisible(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className={clsx(styles.barTime, { [styles.barTimeHidden]: !playBarTimeVisible })}
            style={{ left: playBarTimeLeft }}
          >
            {playBarTime}
          </div>
          <div className={styles.bar}>
            <div className={styles.loaded} style={{ width: loadedBarWidth }}></div>
            <div className={styles.played} style={{ width: playedBarWidth }}>
              <span className={styles.thumb}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
