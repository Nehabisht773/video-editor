import React, { useRef, useEffect, useState } from 'react';
import styled from 'styled-components';
import ReactPlayer from 'react-player';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize } from 'lucide-react';
import { TimelineClip } from '../types';

const PreviewContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: #000;
  position: relative;
`;

const PlayerWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #111;
  position: relative;
`;

const NoVideoMessage = styled.div`
  color: #666;
  font-size: 18px;
  text-align: center;
`;

const ControlsBar = styled.div`
  height: 60px;
  background-color: #222;
  border-top: 1px solid #444;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 15px;
`;

const PlayButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #333;
  }
`;

const TimeDisplay = styled.div`
  color: #ccc;
  font-family: monospace;
  font-size: 14px;
  min-width: 120px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background-color: #444;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background-color: #007acc;
  border-radius: 3px;
  width: ${props => props.progress}%;
  transition: width 0.1s ease;
`;

const VolumeButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #333;
  }
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  background: #444;
  outline: none;
  border-radius: 2px;
  
  &::-webkit-slider-thumb {
    appearance: none;
    width: 12px;
    height: 12px;
    background: #007acc;
    border-radius: 50%;
    cursor: pointer;
  }
`;

interface VideoPreviewProps {
  selectedClip: TimelineClip | null;
  timelineClips: TimelineClip[];
  currentTime: number;
  onTimeUpdate: (time: number) => void;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({
  selectedClip,
  timelineClips,
  currentTime,
  onTimeUpdate
}) => {
  const playerRef = useRef<ReactPlayer>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playedSeconds, setPlayedSeconds] = useState(0);

  // Find the clip that should be playing at the current time
  const getCurrentClip = () => {
    if (selectedClip) return selectedClip;
    
    // Find clip based on timeline position
    for (const clip of timelineClips) {
      const clipEnd = clip.timelinePosition + clip.duration;
      if (currentTime >= clip.timelinePosition && currentTime < clipEnd) {
        return clip;
      }
    }
    return null;
  };

  const currentClip = getCurrentClip();

  useEffect(() => {
    if (playerRef.current && currentClip) {
      const clipTime = currentTime - currentClip.timelinePosition + currentClip.startTime;
      playerRef.current.seekTo(clipTime, 'seconds');
    }
  }, [currentTime, currentClip]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleProgress = (state: { playedSeconds: number; played: number }) => {
    setPlayedSeconds(state.playedSeconds);
    
    if (currentClip) {
      const timelineTime = currentClip.timelinePosition + (state.playedSeconds - currentClip.startTime);
      onTimeUpdate(Math.max(0, timelineTime));
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!currentClip) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progress = clickX / rect.width;
    const newTime = progress * duration;
    
    if (playerRef.current) {
      playerRef.current.seekTo(newTime, 'seconds');
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    onTimeUpdate(newTime);
  };

  const skipForward = () => {
    const newTime = currentTime + 10;
    onTimeUpdate(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  return (
    <PreviewContainer>
      <PlayerWrapper>
        {currentClip ? (
          <ReactPlayer
            ref={playerRef}
            url={currentClip.mediaFile.url}
            playing={isPlaying}
            volume={isMuted ? 0 : volume}
            width="100%"
            height="100%"
            onProgress={handleProgress}
            onDuration={setDuration}
            onEnded={() => setIsPlaying(false)}
            style={{ backgroundColor: '#000' }}
          />
        ) : (
          <NoVideoMessage>
            No video selected. Add clips to timeline or select a clip to preview.
          </NoVideoMessage>
        )}
      </PlayerWrapper>
      
      <ControlsBar>
        <PlayButton onClick={skipBackward}>
          <SkipBack size={20} />
        </PlayButton>
        
        <PlayButton onClick={handlePlayPause}>
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </PlayButton>
        
        <PlayButton onClick={skipForward}>
          <SkipForward size={20} />
        </PlayButton>
        
        <TimeDisplay>
          {formatTime(playedSeconds)} / {formatTime(duration)}
        </TimeDisplay>
        
        <ProgressBar onClick={handleSeek}>
          <ProgressFill progress={progressPercentage} />
        </ProgressBar>
        
        <VolumeButton onClick={toggleMute}>
          {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </VolumeButton>
        
        <VolumeSlider
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
        />
        
        <PlayButton>
          <Maximize size={20} />
        </PlayButton>
      </ControlsBar>
    </PreviewContainer>
  );
};

export default VideoPreview;