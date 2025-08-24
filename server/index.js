const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const { v4: uuidv4 } = require('uuid');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');

// Set FFmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('uploads'));

// Ensure uploads directory exists
fs.ensureDirSync('uploads');
fs.ensureDirSync('uploads/projects');
fs.ensureDirSync('uploads/exports');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /\.(mp4|avi|mov|wmv|flv|webm|mkv|mp3|wav|aac|ogg)$/i;
    if (allowedTypes.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only video and audio files are allowed.'));
    }
  },
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  }
});

// Routes

// Upload media files
app.post('/api/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileInfo = {
      id: uuidv4(),
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
      path: req.file.path,
      url: `http://localhost:${PORT}/${req.file.filename}`
    };

    // Get video metadata using ffmpeg
    ffmpeg.ffprobe(req.file.path, (err, metadata) => {
      if (err) {
        console.error('Error getting metadata:', err);
        return res.json(fileInfo);
      }

      const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
      const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');

      fileInfo.duration = metadata.format.duration;
      if (videoStream) {
        fileInfo.width = videoStream.width;
        fileInfo.height = videoStream.height;
        fileInfo.fps = eval(videoStream.r_frame_rate);
      }
      if (audioStream) {
        fileInfo.hasAudio = true;
        fileInfo.audioCodec = audioStream.codec_name;
      }

      res.json(fileInfo);
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Get video thumbnail
app.post('/api/thumbnail', (req, res) => {
  const { filename, timestamp = 1 } = req.body;
  const inputPath = path.join('uploads', filename);
  const outputFilename = `thumb-${uuidv4()}.jpg`;
  const outputPath = path.join('uploads', outputFilename);

  ffmpeg(inputPath)
    .seekInput(timestamp)
    .frames(1)
    .output(outputPath)
    .on('end', () => {
      res.json({ 
        thumbnail: `http://localhost:${PORT}/${outputFilename}`,
        filename: outputFilename
      });
    })
    .on('error', (err) => {
      console.error('Thumbnail error:', err);
      res.status(500).json({ error: 'Failed to generate thumbnail' });
    })
    .run();
});

// Trim video
app.post('/api/trim', (req, res) => {
  const { filename, startTime, endTime } = req.body;
  const inputPath = path.join('uploads', filename);
  const outputFilename = `trimmed-${uuidv4()}.mp4`;
  const outputPath = path.join('uploads', outputFilename);

  ffmpeg(inputPath)
    .seekInput(startTime)
    .duration(endTime - startTime)
    .output(outputPath)
    .on('end', () => {
      res.json({ 
        filename: outputFilename,
        url: `http://localhost:${PORT}/${outputFilename}`
      });
    })
    .on('error', (err) => {
      console.error('Trim error:', err);
      res.status(500).json({ error: 'Failed to trim video' });
    })
    .run();
});

// Export video with different formats
app.post('/api/export', (req, res) => {
  const { clips, format = 'mp4', quality = 'medium' } = req.body;
  const outputFilename = `export-${uuidv4()}.${format}`;
  const outputPath = path.join('uploads/exports', outputFilename);

  // For now, we'll handle simple concatenation
  // In a real app, you'd want more sophisticated timeline processing
  if (!clips || clips.length === 0) {
    return res.status(400).json({ error: 'No clips provided' });
  }

  const firstClip = clips[0];
  const inputPath = path.join('uploads', firstClip.filename);

  let command = ffmpeg(inputPath);

  // Set quality settings
  const qualitySettings = {
    low: { videoBitrate: '500k', audioBitrate: '64k' },
    medium: { videoBitrate: '1000k', audioBitrate: '128k' },
    high: { videoBitrate: '2000k', audioBitrate: '192k' }
  };

  const settings = qualitySettings[quality] || qualitySettings.medium;

  command
    .videoBitrate(settings.videoBitrate)
    .audioBitrate(settings.audioBitrate)
    .output(outputPath)
    .on('start', () => {
      console.log('Export started...');
    })
    .on('progress', (progress) => {
      console.log('Processing: ' + progress.percent + '% done');
    })
    .on('end', () => {
      res.json({
        filename: outputFilename,
        url: `http://localhost:${PORT}/exports/${outputFilename}`,
        format,
        quality
      });
    })
    .on('error', (err) => {
      console.error('Export error:', err);
      res.status(500).json({ error: 'Export failed' });
    })
    .run();
});

// Save project
app.post('/api/projects', (req, res) => {
  const { name, timeline, clips } = req.body;
  const projectId = uuidv4();
  const projectData = {
    id: projectId,
    name,
    timeline,
    clips,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const projectPath = path.join('uploads/projects', `${projectId}.json`);
  
  fs.writeJson(projectPath, projectData)
    .then(() => {
      res.json(projectData);
    })
    .catch(err => {
      console.error('Save project error:', err);
      res.status(500).json({ error: 'Failed to save project' });
    });
});

// Load project
app.get('/api/projects/:id', (req, res) => {
  const projectPath = path.join('uploads/projects', `${req.params.id}.json`);
  
  fs.readJson(projectPath)
    .then(projectData => {
      res.json(projectData);
    })
    .catch(err => {
      console.error('Load project error:', err);
      res.status(404).json({ error: 'Project not found' });
    });
});

// List projects
app.get('/api/projects', (req, res) => {
  const projectsDir = 'uploads/projects';
  
  fs.readdir(projectsDir)
    .then(files => {
      const projectPromises = files
        .filter(file => file.endsWith('.json'))
        .map(file => fs.readJson(path.join(projectsDir, file)));
      
      return Promise.all(projectPromises);
    })
    .then(projects => {
      res.json(projects);
    })
    .catch(err => {
      console.error('List projects error:', err);
      res.status(500).json({ error: 'Failed to list projects' });
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File size too large' });
    }
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Video Editor Server running on port ${PORT}`);
});