import React, { useState } from 'react';
import styled from 'styled-components';
import { X, Download } from 'lucide-react';
import { TimelineClip, ExportOptions } from '../types';
import axios from 'axios';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: #2a2a2a;
  border-radius: 8px;
  padding: 30px;
  width: 500px;
  max-width: 90vw;
  color: #fff;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: #fff;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #ccc;
  cursor: pointer;
  padding: 5px;
  
  &:hover {
    color: #fff;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #ccc;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  background-color: #333;
  border: 1px solid #555;
  border-radius: 4px;
  color: #fff;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007acc;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease;
`;

const PrimaryButton = styled(Button)`
  background-color: #007acc;
  color: #fff;
  
  &:hover {
    background-color: #0066aa;
  }
  
  &:disabled {
    background-color: #555;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: #444;
  color: #ccc;
  margin-right: 10px;
  
  &:hover {
    background-color: #555;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 30px;
`;

const ProgressContainer = styled.div`
  margin-top: 20px;
  padding: 15px;
  background-color: #333;
  border-radius: 4px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #555;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
`;

const ProgressFill = styled.div<{ progress: number }>`
  height: 100%;
  background-color: #007acc;
  width: ${props => props.progress}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #ccc;
  text-align: center;
`;

const ExportSummary = styled.div`
  background-color: #333;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 14px;
`;

const SummaryLabel = styled.span`
  color: #ccc;
`;

const SummaryValue = styled.span`
  color: #fff;
`;

interface ExportModalProps {
  clips: TimelineClip[];
  onClose: () => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ clips, onClose }) => {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'mp4',
    quality: 'medium',
    resolution: '1080p'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStatus, setExportStatus] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(0);
    setExportStatus('Preparing export...');

    try {
      const response = await axios.post('http://localhost:5000/api/export', {
        clips: clips.map(clip => ({
          filename: clip.mediaFile.filename,
          startTime: clip.startTime,
          endTime: clip.endTime,
          timelinePosition: clip.timelinePosition
        })),
        format: exportOptions.format,
        quality: exportOptions.quality
      });

      if (response.data.url) {
        setDownloadUrl(response.data.url);
        setExportProgress(100);
        setExportStatus('Export completed successfully!');
      }
    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  const getTotalDuration = () => {
    if (clips.length === 0) return 0;
    return Math.max(...clips.map(clip => clip.timelinePosition + clip.duration));
  };

  const getEstimatedFileSize = () => {
    const duration = getTotalDuration();
    const qualityMultipliers = {
      low: 0.5,
      medium: 1,
      high: 2
    };
    const baseSizeMB = duration * 2; // Rough estimate: 2MB per minute
    return Math.round(baseSizeMB * qualityMultipliers[exportOptions.quality]);
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Export Video</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ExportSummary>
          <SummaryItem>
            <SummaryLabel>Clips:</SummaryLabel>
            <SummaryValue>{clips.length}</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Duration:</SummaryLabel>
            <SummaryValue>{Math.round(getTotalDuration())}s</SummaryValue>
          </SummaryItem>
          <SummaryItem>
            <SummaryLabel>Estimated Size:</SummaryLabel>
            <SummaryValue>{getEstimatedFileSize()}MB</SummaryValue>
          </SummaryItem>
        </ExportSummary>

        <FormGroup>
          <Label>Format</Label>
          <Select
            value={exportOptions.format}
            onChange={(e) => setExportOptions(prev => ({ 
              ...prev, 
              format: e.target.value as ExportOptions['format']
            }))}
            disabled={isExporting}
          >
            <option value="mp4">MP4 (H.264)</option>
            <option value="webm">WebM</option>
            <option value="avi">AVI</option>
            <option value="mov">MOV</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Quality</Label>
          <Select
            value={exportOptions.quality}
            onChange={(e) => setExportOptions(prev => ({ 
              ...prev, 
              quality: e.target.value as ExportOptions['quality']
            }))}
            disabled={isExporting}
          >
            <option value="low">Low (500kbps)</option>
            <option value="medium">Medium (1000kbps)</option>
            <option value="high">High (2000kbps)</option>
          </Select>
        </FormGroup>

        <FormGroup>
          <Label>Resolution</Label>
          <Select
            value={exportOptions.resolution}
            onChange={(e) => setExportOptions(prev => ({ 
              ...prev, 
              resolution: e.target.value as ExportOptions['resolution']
            }))}
            disabled={isExporting}
          >
            <option value="720p">720p (1280x720)</option>
            <option value="1080p">1080p (1920x1080)</option>
            <option value="4k">4K (3840x2160)</option>
          </Select>
        </FormGroup>

        {isExporting && (
          <ProgressContainer>
            <ProgressBar>
              <ProgressFill progress={exportProgress} />
            </ProgressBar>
            <ProgressText>{exportStatus}</ProgressText>
          </ProgressContainer>
        )}

        {downloadUrl && !isExporting && (
          <ProgressContainer>
            <ProgressText style={{ color: '#4CAF50' }}>
              {exportStatus}
            </ProgressText>
          </ProgressContainer>
        )}

        <ButtonGroup>
          <SecondaryButton onClick={onClose} disabled={isExporting}>
            Cancel
          </SecondaryButton>
          
          {downloadUrl ? (
            <PrimaryButton onClick={handleDownload}>
              <Download size={16} />
              Download
            </PrimaryButton>
          ) : (
            <PrimaryButton 
              onClick={handleExport} 
              disabled={isExporting || clips.length === 0}
            >
              <Download size={16} />
              {isExporting ? 'Exporting...' : 'Export'}
            </PrimaryButton>
          )}
        </ButtonGroup>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ExportModal;