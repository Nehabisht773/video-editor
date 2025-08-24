import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { useDraggable } from '@dnd-kit/core';
import { Upload, Film, Music, Plus } from 'lucide-react';
import { MediaFile } from '../types';
import axios from 'axios';

const LibraryContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const LibraryHeader = styled.div`
  padding: 15px;
  border-bottom: 1px solid #444;
  font-weight: bold;
  font-size: 14px;
  color: #fff;
`;

const DropzoneArea = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? '#007acc' : '#555'};
  border-radius: 8px;
  padding: 20px;
  margin: 15px;
  text-align: center;
  cursor: pointer;
  background-color: ${props => props.isDragActive ? '#003366' : '#333'};
  color: #ccc;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #007acc;
    background-color: #003366;
  }
`;

const MediaList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
`;

const MediaItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px;
  margin-bottom: 8px;
  background-color: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: #444;
  }
`;

const MediaIcon = styled.div`
  margin-right: 10px;
  color: #007acc;
`;

const MediaInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const MediaName = styled.div`
  font-size: 13px;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MediaMeta = styled.div`
  font-size: 11px;
  color: #999;
  margin-top: 2px;
`;

const AddButton = styled.button`
  background: none;
  border: none;
  color: #007acc;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #0099ff;
  }
`;

interface DraggableMediaItemProps {
  mediaFile: MediaFile;
  onAddToTimeline: (file: MediaFile) => void;
}

const DraggableMediaItem: React.FC<DraggableMediaItemProps> = ({ mediaFile, onAddToTimeline }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `media-${mediaFile.id}`,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isVideo = mediaFile.mimetype?.startsWith('video');

  return (
    <MediaItem
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      <MediaIcon>
        {isVideo ? <Film size={20} /> : <Music size={20} />}
      </MediaIcon>
      <MediaInfo>
        <MediaName title={mediaFile.originalName}>
          {mediaFile.originalName}
        </MediaName>
        <MediaMeta>
          {formatFileSize(mediaFile.size)}
          {mediaFile.duration && ` • ${formatDuration(mediaFile.duration)}`}
        </MediaMeta>
      </MediaInfo>
      <AddButton onClick={() => onAddToTimeline(mediaFile)}>
        <Plus size={16} />
      </AddButton>
    </MediaItem>
  );
};

interface MediaLibraryProps {
  mediaFiles: MediaFile[];
  onFileUpload: (files: MediaFile[]) => void;
  onAddToTimeline: (file: MediaFile) => void;
}

const MediaLibrary: React.FC<MediaLibraryProps> = ({ 
  mediaFiles, 
  onFileUpload, 
  onAddToTimeline 
}) => {
  const uploadFiles = useCallback(async (files: File[]) => {
    const uploadedFiles: MediaFile[] = [];
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('media', file);
      
      try {
        const response = await axios.post('http://localhost:5000/api/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        
        uploadedFiles.push(response.data);
      } catch (error) {
        console.error('Upload failed:', error);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    if (uploadedFiles.length > 0) {
      onFileUpload(uploadedFiles);
    }
  }, [onFileUpload]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    uploadFiles(acceptedFiles);
  }, [uploadFiles]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv'],
      'audio/*': ['.mp3', '.wav', '.aac', '.ogg']
    },
    multiple: true
  });

  return (
    <LibraryContainer>
      <LibraryHeader>Media Library</LibraryHeader>
      
      <DropzoneArea {...getRootProps()} isDragActive={isDragActive}>
        <input {...getInputProps()} />
        <Upload size={24} style={{ marginBottom: '10px' }} />
        <div>
          {isDragActive ? (
            'Drop files here...'
          ) : (
            'Drop video/audio files here or click to browse'
          )}
        </div>
      </DropzoneArea>
      
      <MediaList>
        {mediaFiles.map((file) => (
          <DraggableMediaItem
            key={file.id}
            mediaFile={file}
            onAddToTimeline={onAddToTimeline}
          />
        ))}
      </MediaList>
    </LibraryContainer>
  );
};

export default MediaLibrary;