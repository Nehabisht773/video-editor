import React from 'react';
import styled from 'styled-components';
import { Save, Download, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const HeaderContainer = styled.header`
  height: 60px;
  background-color: #222;
  border-bottom: 1px solid #444;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

const Logo = styled.div`
  font-size: 20px;
  font-weight: bold;
  color: #fff;
`;

const ProjectName = styled.div`
  font-size: 16px;
  color: #ccc;
  margin-left: 20px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ControlButton = styled.button`
  background-color: #333;
  border: 1px solid #555;
  color: #fff;
  padding: 8px 12px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  
  &:hover {
    background-color: #444;
  }
  
  &:active {
    background-color: #555;
  }
`;

const PrimaryButton = styled(ControlButton)`
  background-color: #007acc;
  border-color: #007acc;
  
  &:hover {
    background-color: #0066aa;
  }
`;

interface HeaderProps {
  projectName: string;
  onSave: () => void;
  onExport: () => void;
}

const Header: React.FC<HeaderProps> = ({ projectName, onSave, onExport }) => {
  return (
    <HeaderContainer>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Logo>Video Editor</Logo>
        <ProjectName>{projectName}</ProjectName>
      </div>
      
      <Controls>
        <ControlButton onClick={onSave}>
          <Save size={16} />
          Save
        </ControlButton>
        <PrimaryButton onClick={onExport}>
          <Download size={16} />
          Export
        </PrimaryButton>
      </Controls>
    </HeaderContainer>
  );
};

export default Header;