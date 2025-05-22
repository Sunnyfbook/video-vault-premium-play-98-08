
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';
import LoadingOverlay from './video/LoadingOverlay';
import ErrorOverlay from './video/ErrorOverlay';

interface VideoPlayerProps {
  src: string;
  title: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, title }) => {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);

  // Initialize and handle events
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Event handlers
    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100 || 0);
    };

    const onError = () => {
      console.error("Video error occurred");
      setError("Failed to load video. Please try again.");
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
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('error', onError);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      // Remove event listeners on cleanup
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('error', onError);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, []);

  // Auto-hide controls
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
    togglePlay();
  };

  const handleMouseMove = () => {
    setShowControls(true);
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full aspect-video bg-black overflow-hidden"
      onMouseMove={handleMouseMove}
      onDoubleClick={toggleFullscreen}
    >
      {loading && !error && <LoadingOverlay />}
      {error && <ErrorOverlay errorMessage={error} onRetry={handleRetry} />}
      
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        title={title}
        playsInline
        onClick={handleVideoClick}
      />
      
      {showControls && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
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
              <button onClick={togglePlay} className="text-white hover:text-primary">
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button onClick={skipBackward} className="text-white hover:text-primary">
                <SkipBack size={20} />
              </button>
              
              <button onClick={skipForward} className="text-white hover:text-primary">
                <SkipForward size={20} />
              </button>
              
              <div className="text-white text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={toggleMute} className="text-white hover:text-primary">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <button onClick={toggleFullscreen} className="text-white hover:text-primary">
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
