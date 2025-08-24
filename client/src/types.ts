export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
  path: string;
  url: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
  hasAudio?: boolean;
  audioCodec?: string;
  thumbnail?: string;
}

export interface TimelineClip {
  id: string;
  mediaFile: MediaFile;
  startTime: number;
  endTime: number;
  timelinePosition: number;
  duration: number;
  trimStart?: number;
  trimEnd?: number;
}

export interface Project {
  id: string;
  name: string;
  timeline: TimelineClip[];
  clips: TimelineClip[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ExportOptions {
  format: 'mp4' | 'avi' | 'webm' | 'mov';
  quality: 'low' | 'medium' | 'high';
  resolution?: '720p' | '1080p' | '4k';
}