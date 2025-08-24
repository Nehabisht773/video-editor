import React from 'react';
import styled from 'styled-components';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Scissors, Trash2 } from 'lucide-react';
import { TimelineClip } from '../types';

const TimelineContainer = styled.div`
  height: 100%;
  background-color: #333;
  display: flex;
  flex-direction: column;
`;

const TimelineHeader = styled.div`
  height: 40px;
  background-color: #222;
  border-bottom: 1px solid #444;
  display: flex;
  align-items: center;
  padding: 0 15px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
`;

const TimelineContent = styled.div`
  flex: 1;
  position: relative;
  overflow-x: auto;
  overflow-y: hidden;
`;

const TimeRuler = styled.div`
  height: 30px;
  background-color: #2a2a2a;
  border-bottom: 1px solid #444;
  position: relative;
`;

const TimeMarker = styled.div<{ position: number }>`
  position: absolute;
  left: ${props => props.position}px;
  top: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  color: #ccc;
  font-size: 11px;
`;

const TimeMarkerLine = styled.div`
  width: 1px;
  height: 15px;
  background-color: #555;
`;

const TimeMarkerText = styled.div`
  margin-left: 3px;
  margin-top: 2px;
`;

const TracksContainer = styled.div`
  flex: 1;
  position: relative;
  min-height: 120px;
`;

const Track = styled.div`
  height: 60px;
  border-bottom: 1px solid #444;
  position: relative;
  background-color: #333;
`;

const DroppableTrack = styled.div<{ isOver: boolean }>`
  width: 100%;
  height: 100%;
  background-color: ${props => props.isOver ? '#003366' : 'transparent'};
  transition: background-color 0.2s ease;
`;

const ClipContainer = styled.div<{ 
  position: number; 
  width: number; 
  isSelected: boolean 
}>`
  position: absolute;
  left: ${props => props.position}px;
  width: ${props => props.width}px;
  height: 50px;
  top: 5px;
  background: linear-gradient(135deg, #007acc, #005fa3);
  border: 2px solid ${props => props.isSelected ? '#ff6b00' : '#007acc'};
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0 8px;
  user-select: none;
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  }
`;

const ClipContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ClipName = styled.div`
  color: #fff;
  font-size: 12px;
  font-weight: bold;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ClipDuration = styled.div`
  color: #ccc;
  font-size: 10px;
  margin-top: 2px;
`;

const ClipActions = styled.div`
  display: flex;
  gap: 4px;
  opacity: 0;
  transition: opacity 0.2s ease;
  
  ${ClipContainer}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button`
  background: rgba(0, 0, 0, 0.7);
  border: none;
  color: #fff;
  width: 20px;
  height: 20px;
  border-radius: 2px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const PlayheadContainer = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 10;
`;

const Playhead = styled.div<{ position: number }>`
  position: absolute;
  left: ${props => props.position}px;
  top: 0;
  width: 2px;
  height: 100%;
  background-color: #ff0000;
  pointer-events: none;
  
  &::before {
    content: '';
    position: absolute;
    top: -5px;
    left: -4px;
    width: 0;
    height: 0;
    border-left: 5px solid transparent;
    border-right: 5px solid transparent;
    border-top: 8px solid #ff0000;
  }
`;

interface SortableClipProps {
  clip: TimelineClip;
  isSelected: boolean;
  onSelect: (clip: TimelineClip) => void;
  onDelete: (clipId: string) => void;
  scale: number;
}

const SortableClip: React.FC<SortableClipProps> = ({
  clip,
  isSelected,
  onSelect,
  onDelete,
  scale
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: clip.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ClipContainer
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      position={clip.timelinePosition * scale}
      width={clip.duration * scale}
      isSelected={isSelected}
      onClick={() => onSelect(clip)}
    >
      <ClipContent>
        <ClipName>{clip.mediaFile.originalName}</ClipName>
        <ClipDuration>{formatTime(clip.duration)}</ClipDuration>
      </ClipContent>
      
      <ClipActions>
        <ActionButton title="Split Clip">
          <Scissors size={12} />
        </ActionButton>
        <ActionButton 
          title="Delete Clip"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(clip.id);
          }}
        >
          <Trash2 size={12} />
        </ActionButton>
      </ClipActions>
    </ClipContainer>
  );
};

interface TimelineProps {
  clips: TimelineClip[];
  selectedClip: TimelineClip | null;
  onClipSelect: (clip: TimelineClip) => void;
  onClipUpdate: (clipId: string, updates: Partial<TimelineClip>) => void;
  onClipDelete: (clipId: string) => void;
  currentTime: number;
  onTimeChange: (time: number) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  clips,
  selectedClip,
  onClipSelect,
  onClipUpdate,
  onClipDelete,
  currentTime,
  onTimeChange
}) => {
  const scale = 20; // pixels per second
  const maxTime = Math.max(120, ...clips.map(clip => clip.timelinePosition + clip.duration));

  const { setNodeRef, isOver } = useDroppable({
    id: 'timeline',
  });

  // Generate time markers
  const timeMarkers = [];
  for (let i = 0; i <= maxTime; i += 5) {
    timeMarkers.push(
      <TimeMarker key={i} position={i * scale}>
        <TimeMarkerLine />
        <TimeMarkerText>{i}s</TimeMarkerText>
      </TimeMarker>
    );
  }

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const time = clickX / scale;
    onTimeChange(time);
  };

  return (
    <TimelineContainer>
      <TimelineHeader>Timeline</TimelineHeader>
      
      <TimelineContent>
        <TimeRuler>
          {timeMarkers}
        </TimeRuler>
        
        <TracksContainer ref={setNodeRef} onClick={handleTimelineClick}>
          <Track>
            <DroppableTrack isOver={isOver}>
              {clips.map((clip) => (
                <SortableClip
                  key={clip.id}
                  clip={clip}
                  isSelected={selectedClip?.id === clip.id}
                  onSelect={onClipSelect}
                  onDelete={onClipDelete}
                  scale={scale}
                />
              ))}
            </DroppableTrack>
          </Track>
          
          <PlayheadContainer>
            <Playhead position={currentTime * scale} />
          </PlayheadContainer>
        </TracksContainer>
      </TimelineContent>
    </TimelineContainer>
  );
};

export default Timeline;