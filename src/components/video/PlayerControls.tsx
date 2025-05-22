
import React from 'react';
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, Maximize } from 'lucide-react';

interface PlayerControlsProps {
  playing: boolean;
  muted: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isFullscreen: boolean;
  onPlayPause: () => void;
  onProgressClick: (e: React.MouseEvent<HTMLDivElement>) => void;
  onMuteToggle: () => void;
  onVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onToggleFullscreen: () => void;
  seekBarRef: React.RefObject<HTMLDivElement>;
}

const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const PlayerControls: React.FC<PlayerControlsProps> = ({
  playing,
  muted,
  progress,
  currentTime,
  duration,
  volume,
  isFullscreen,
  onPlayPause,
  onProgressClick,
  onMuteToggle,
  onVolumeChange,
  onSkipForward,
  onSkipBackward,
  onToggleFullscreen,
  seekBarRef
}) => {
  return (
    <div className="video-controls absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity duration-300">
      <div 
        className="progress-container w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer relative"
        ref={seekBarRef}
        onClick={onProgressClick}
      >
        <div 
          className="progress-fill h-full bg-primary rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-3">
          <button 
            onClick={onPlayPause} 
            className="text-white hover:text-primary transition"
          >
            {playing ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={onSkipBackward} 
            className="text-white hover:text-primary transition"
          >
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={onSkipForward} 
            className="text-white hover:text-primary transition"
          >
            <SkipForward size={20} />
          </button>
          
          <div className="text-white text-sm font-medium">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 group relative">
            <button 
              onClick={onMuteToggle} 
              className="text-white hover:text-primary transition"
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={onVolumeChange}
              onClick={(e) => e.stopPropagation()}
              className="w-0 group-hover:w-20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            />
          </div>
          
          <button 
            className="text-white hover:text-primary transition"
            onClick={onToggleFullscreen}
          >
            <Maximize size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
