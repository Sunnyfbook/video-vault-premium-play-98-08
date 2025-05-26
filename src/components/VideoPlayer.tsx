import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import LoadingOverlay from './video/LoadingOverlay';
import ErrorOverlay from './video/ErrorOverlay';
import Hls from 'hls.js';

interface VideoPlayerProps {
  src: string;
  title: string;
  disableClickToToggle?: boolean;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title, disableClickToToggle = false }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [volume, setVolume] = useState(1);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Setup HLS player if needed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !src) return;
    
    // Clean up any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    // Check if it's an HLS stream (.m3u8)
    if (src.includes('.m3u8') && Hls.isSupported()) {
      try {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          // Performance optimizations
          maxBufferLength: 30,
          maxMaxBufferLength: 600,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5,
        });
        hls.loadSource(src);
        hls.attachMedia(video);
        
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          // Ready to play
          if (isPlaying) video.play().catch(console.error);
        });
        
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            console.error('HLS error:', data);
            setError(`Failed to load video: ${data.type} error`);
            hls.destroy();
          }
        });
        
        hlsRef.current = hls;
      } catch (e) {
        console.error("Error setting up HLS:", e);
        setError("Failed to initialize HLS player. Please try again.");
      }
    } else {
      // Regular video handling with preload optimization
      video.preload = 'metadata'; // Only preload metadata, not the entire video
      video.src = src;
    }
    
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  // Initialize and handle events with performance optimizations
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Throttled event handlers for better performance
    let timeUpdateTimeout: NodeJS.Timeout;
    const throttledTimeUpdate = () => {
      clearTimeout(timeUpdateTimeout);
      timeUpdateTimeout = setTimeout(() => {
        setCurrentTime(video.currentTime);
        setProgress((video.currentTime / video.duration) * 100 || 0);
      }, 100); // Throttle to 10fps instead of 60fps
    };

    // Event handlers
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const onError = () => {
      console.error("Video error occurred", video.error);
      let errorMessage = "Failed to load video. Please try again.";
      
      if (video.error) {
        switch(video.error.code) {
          case 1:
            errorMessage = "Video loading aborted.";
            break;
          case 2:
            errorMessage = "Network error occurred while loading video.";
            break;
          case 3:
            errorMessage = "Error decoding video. The format may not be supported.";
            break;
          case 4:
            errorMessage = "Video is not supported or unavailable.";
            break;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    };

    const onWaiting = () => setLoading(true);
    const onPlaying = () => {
      setLoading(false);
      setIsPlaying(true);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    // Add event listeners
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', throttledTimeUpdate);
    video.addEventListener('error', onError);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    // Check fullscreen changes
    const handleFullscreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      // Remove event listeners on cleanup
      clearTimeout(timeUpdateTimeout);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', throttledTimeUpdate);
      video.removeEventListener('error', onError);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Auto-hide controls with debouncing
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    
    if (isPlaying) {
      timeoutId = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isPlaying, showControls]);

  // Player control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch(err => {
        console.error("Error playing video:", err);
        setError("Could not play video. Please try again.");
      });
    } else {
      video.pause();
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    
    // Update mute state based on volume
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const skipForward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.min(video.currentTime + 10, video.duration);
  };

  const skipBackward = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(video.currentTime - 10, 0);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleVideoClick = () => {
    setShowControls(true);
    if (!disableClickToToggle) {
      togglePlay();
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    const video = videoRef.current;
    if (video) {
      // For HLS streams
      if (hlsRef.current) {
        hlsRef.current.destroy();
        
        // Recreate HLS instance
        if (src.includes('.m3u8') && Hls.isSupported()) {
          const hls = new Hls();
          hls.loadSource(src);
          hls.attachMedia(video);
          hlsRef.current = hls;
        }
      } else {
        // For regular videos
        video.load();
      }
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden gpu-accelerated"
      onMouseMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
      style={{ contain: 'layout style' }}
    >
      {loading && !error && <LoadingOverlay />}
      {error && <ErrorOverlay errorMessage={error} onRetry={handleRetry} />}
      
      <video
        ref={videoRef}
        className="w-full h-full object-contain gpu-accelerated"
        title={title}
        playsInline
        onClick={handleVideoClick}
        style={{ contain: 'layout style' }}
      />
      
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 gpu-accelerated">
          {/* Progress bar */}
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={handleProgressChange}
              className="w-full h-2 bg-gray-600 rounded-full"
              style={{
                background: `linear-gradient(to right, #3b82f6 ${progress}%, rgba(255,255,255,0.3) ${progress}%)`
              }}
            />
          </div>
          
          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={togglePlay} className="text-white hover:text-primary gpu-accelerated">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button onClick={skipBackward} className="text-white hover:text-primary gpu-accelerated">
                <SkipBack size={20} />
              </button>
              
              <button onClick={skipForward} className="text-white hover:text-primary gpu-accelerated">
                <SkipForward size={20} />
              </button>
              
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2">
                <button onClick={toggleMute} className="text-white hover:text-primary gpu-accelerated">
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-full"
                />
              </div>
              
              <button onClick={toggleMute} className="md:hidden text-white hover:text-primary gpu-accelerated">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button onClick={toggleFullscreen} className="text-white hover:text-primary gpu-accelerated">
                <Maximize size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
