# Video Editor - React & Node.js

A modern, web-based video editor built with React frontend and Node.js backend, featuring drag-and-drop timeline editing, video preview, and export capabilities.

## Features

### Core Features
- **Media Import**: Drag and drop video/audio files or browse to upload
- **Timeline Editing**: Visual timeline with drag-and-drop clip arrangement
- **Video Preview**: Real-time video player with playback controls
- **Export Options**: Multiple format and quality options (MP4, WebM, AVI, MOV)
- **Project Management**: Save and load editing projects

### Editing Features
- Clip trimming and splitting
- Timeline positioning and reordering
- Clip selection and properties panel
- Visual timeline with time markers
- Playhead scrubbing

### Supported Formats
- **Video**: MP4, AVI, MOV, WMV, FLV, WebM, MKV
- **Audio**: MP3, WAV, AAC, OGG
- **Export**: MP4, WebM, AVI, MOV with quality options

## Technology Stack

### Frontend
- React 19 with TypeScript
- Styled Components for styling
- React Player for video playback
- DND Kit for drag-and-drop functionality
- React Dropzone for file uploads
- Axios for API communication
- Lucide React for icons

### Backend
- Node.js with Express
- FFmpeg for video processing
- Multer for file uploads
- UUID for unique identifiers
- CORS for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- FFmpeg (automatically installed via ffmpeg-static)

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd video-editor
npm run install-all
```

This will install dependencies for the root project, backend server, and React client.

2. **Start the development servers:**
```bash
npm run dev
```

This starts both the backend server (port 5000) and React development server (port 3000) concurrently.

### Alternative: Manual Setup

1. **Install root dependencies:**
```bash
npm install
```

2. **Setup backend:**
```bash
cd server
npm install
npm run dev
```

3. **Setup frontend (in new terminal):**
```bash
cd client
npm install
npm start
```

## Usage

### Getting Started

1. **Open the application** at `http://localhost:3000`
2. **Import media files** by dragging them into the Media Library or clicking to browse
3. **Add clips to timeline** by dragging from the Media Library or clicking the + button
4. **Edit your video** using the timeline controls:
   - Drag clips to reorder
   - Click clips to select and view properties
   - Use the scissors icon to split clips
   - Use the trash icon to delete clips
5. **Preview your video** in the video player
6. **Export your project** using the Export button with your desired format and quality

### Keyboard Shortcuts
- **Spacebar**: Play/Pause
- **Left/Right arrows**: Skip backward/forward (10 seconds)
- **Delete**: Remove selected clip

### Project Management
- **Save Project**: Click the Save button and enter a project name
- **Load Project**: Projects are automatically saved and can be loaded via the API

## API Endpoints

### Media Management
- `POST /api/upload` - Upload media files
- `POST /api/thumbnail` - Generate video thumbnails

### Video Processing
- `POST /api/trim` - Trim video clips
- `POST /api/export` - Export final video

### Project Management
- `POST /api/projects` - Save project
- `GET /api/projects/:id` - Load specific project
- `GET /api/projects` - List all projects

## File Structure

```
video-editor/
├── package.json              # Root package configuration
├── server/                   # Backend Node.js application
│   ├── package.json         # Server dependencies
│   ├── index.js            # Main server file
│   └── uploads/            # File storage directory
├── client/                  # React frontend application
│   ├── package.json        # Client dependencies
│   ├── public/             # Static assets
│   └── src/                # React source code
│       ├── components/     # React components
│       ├── types.ts       # TypeScript interfaces
│       ├── App.tsx        # Main app component
│       └── App.css        # Global styles
└── README.md               # This file
```

## Development

### Adding New Features

1. **Backend API endpoints**: Add to `server/index.js`
2. **Frontend components**: Create in `client/src/components/`
3. **Type definitions**: Update `client/src/types.ts`

### Styling
The application uses Styled Components with a dark theme. Main colors:
- Background: `#1a1a1a`
- Secondary: `#2a2a2a`
- Accent: `#007acc`
- Text: `#ffffff`

## Production Deployment

### Backend Deployment
1. Install dependencies: `cd server && npm install --production`
2. Set environment variables (PORT, etc.)
3. Start server: `npm start`

### Frontend Deployment
1. Build React app: `cd client && npm run build`
2. Serve the `build` directory with a web server

### Docker (Optional)
You can containerize both applications using Docker for easier deployment.

## Troubleshooting

### Common Issues

1. **FFmpeg not found**: The `ffmpeg-static` package should automatically provide FFmpeg. If issues persist, install FFmpeg manually.

2. **File upload fails**: Check that the `uploads` directory exists and has write permissions.

3. **Video processing errors**: Ensure uploaded files are valid video/audio formats.

4. **CORS issues**: The backend is configured to allow all origins in development. Adjust CORS settings for production.

### Performance Tips

- Use smaller video files for better performance
- Close unused browser tabs when working with large videos
- Consider using proxy videos for editing and high-quality for export

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Future Enhancements

- [ ] Multiple video tracks
- [ ] Audio waveform visualization
- [ ] Video effects and filters
- [ ] Transitions between clips
- [ ] Collaborative editing
- [ ] Real-time collaboration
- [ ] Cloud storage integration
- [ ] Advanced export options
- [ ] Keyboard shortcuts customization
- [ ] Undo/Redo functionality