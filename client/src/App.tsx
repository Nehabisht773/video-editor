import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { DndContext, DragEndEvent, DragOverlay } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import Header from './components/Header';
import MediaLibrary from './components/MediaLibrary';
import Timeline from './components/Timeline';
import VideoPreview from './components/VideoPreview';
import ExportModal from './components/ExportModal';
import { MediaFile, TimelineClip, Project } from './types';
import './App.css';

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
`;

const MainContent = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 300px;
  background-color: #2a2a2a;
  border-right: 1px solid #444;
  display: flex;
  flex-direction: column;
`;

const CenterPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled.div`
  width: 400px;
  background-color: #2a2a2a;
  border-left: 1px solid #444;
`;

const TimelineContainer = styled.div`
  height: 200px;
  background-color: #333;
  border-top: 1px solid #444;
`;

function App() {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [timelineClips, setTimelineClips] = useState<TimelineClip[]>([]);
  const [selectedClip, setSelectedClip] = useState<TimelineClip | null>(null);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [previewTime, setPreviewTime] = useState(0);

  const handleFileUpload = useCallback((files: MediaFile[]) => {
    setMediaFiles(prev => [...prev, ...files]);
  }, []);

  const handleAddToTimeline = useCallback((mediaFile: MediaFile) => {
    const newClip: TimelineClip = {
      id: `clip-${Date.now()}`,
      mediaFile,
      startTime: 0,
      endTime: mediaFile.duration || 10,
      timelinePosition: timelineClips.length * 10, // Simple positioning
      duration: mediaFile.duration || 10,
    };
    setTimelineClips(prev => [...prev, newClip]);
  }, [timelineClips.length]);

  const handleClipSelect = useCallback((clip: TimelineClip) => {
    setSelectedClip(clip);
  }, []);

  const handleClipUpdate = useCallback((clipId: string, updates: Partial<TimelineClip>) => {
    setTimelineClips(prev => 
      prev.map(clip => 
        clip.id === clipId ? { ...clip, ...updates } : clip
      )
    );
  }, []);

  const handleClipDelete = useCallback((clipId: string) => {
    setTimelineClips(prev => prev.filter(clip => clip.id !== clipId));
    if (selectedClip?.id === clipId) {
      setSelectedClip(null);
    }
  }, [selectedClip]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) return;

    // Handle dragging from media library to timeline
    if (active.id.toString().startsWith('media-') && over.id === 'timeline') {
      const mediaId = active.id.toString().replace('media-', '');
      const mediaFile = mediaFiles.find(file => file.id === mediaId);
      if (mediaFile) {
        handleAddToTimeline(mediaFile);
      }
    }
  };

  const handleSaveProject = useCallback(async () => {
    if (!currentProject?.name) {
      const name = prompt('Enter project name:');
      if (!name) return;
      
      const newProject: Project = {
        id: '',
        name,
        timeline: timelineClips,
        clips: timelineClips,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setCurrentProject(newProject);
    }
    
    // Save project to backend
    try {
      const response = await fetch('http://localhost:5000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: currentProject?.name,
          timeline: timelineClips,
          clips: timelineClips
        }),
      });
      
      if (response.ok) {
        const savedProject = await response.json();
        setCurrentProject(savedProject);
        alert('Project saved successfully!');
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project');
    }
  }, [currentProject, timelineClips]);

  const handleExport = useCallback(() => {
    if (timelineClips.length === 0) {
      alert('No clips to export');
      return;
    }
    setIsExportModalOpen(true);
  }, [timelineClips]);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <AppContainer>
        <Header 
          onSave={handleSaveProject}
          onExport={handleExport}
          projectName={currentProject?.name || 'Untitled Project'}
        />
        
        <MainContent>
          <LeftPanel>
            <MediaLibrary 
              mediaFiles={mediaFiles}
              onFileUpload={handleFileUpload}
              onAddToTimeline={handleAddToTimeline}
            />
          </LeftPanel>
          
          <CenterPanel>
            <VideoPreview 
              selectedClip={selectedClip}
              timelineClips={timelineClips}
              currentTime={previewTime}
              onTimeUpdate={setPreviewTime}
            />
            
            <TimelineContainer>
              <Timeline 
                clips={timelineClips}
                selectedClip={selectedClip}
                onClipSelect={handleClipSelect}
                onClipUpdate={handleClipUpdate}
                onClipDelete={handleClipDelete}
                currentTime={previewTime}
                onTimeChange={setPreviewTime}
              />
            </TimelineContainer>
          </CenterPanel>
          
          <RightPanel>
            {/* Properties panel for selected clip */}
            {selectedClip && (
              <div style={{ padding: '20px' }}>
                <h3>Clip Properties</h3>
                <p>File: {selectedClip.mediaFile.originalName}</p>
                <p>Duration: {selectedClip.duration.toFixed(2)}s</p>
                <p>Start: {selectedClip.startTime.toFixed(2)}s</p>
                <p>End: {selectedClip.endTime.toFixed(2)}s</p>
              </div>
            )}
          </RightPanel>
        </MainContent>
        
        {isExportModalOpen && (
          <ExportModal 
            clips={timelineClips}
            onClose={() => setIsExportModalOpen(false)}
          />
        )}
      </AppContainer>
    </DndContext>
  );
}

export default App;
