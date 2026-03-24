# Codebase Discovery Report

Complete analysis of the Nuxt 4 AI Video Analyzer project.

---

## Executive Summary

**Project Type**: AI-powered video analysis platform
**Framework**: Nuxt 4.1.0 (Vue 3 architecture)
**Primary Function**: Upload videos, generate transcripts, summaries, agendas, and quizzes using AI

**Key Technologies**:
- Frontend: Vue 3.5.20 with Composition API
- Styling: Tailwind CSS 3.4.17
- AI Services: OpenAI Whisper (transcription) + GPT (content generation)
- Media Processing: FFmpeg (audio/frame extraction)
- File Handling: Chunked upload (10MB chunks, 5GB max)

---

## 1. Project Architecture

### Framework Configuration

**nuxt.config.ts**:
```typescript
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  components: [{ path: '~/components', pathPrefix: false }],
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxt/image'],
  pages: true,
  runtimeConfig: {
    openAiKey: process.env.OPENAI_API_KEY  // Server-only
  }
})
```

**Key Settings**:
- File-based routing enabled
- Components auto-imported without path prefix
- ESLint and Image modules loaded
- OpenAI key as server-side runtime config

### Dependencies (package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| nuxt | ^4.1.0 | Framework |
| vue | ^3.5.20 | UI framework |
| vue-router | ^4.5.1 | Routing |
| openai | ^5.19.1 | AI API client |
| @heroicons/vue | ^2.2.0 | Icons |
| @nuxt/image | ^1.11.0 | Image optimization |
| tailwindcss | ^3.4.17 | CSS framework |
| multer | ^2.0.2 | File upload middleware |
| vitest | ^3.2.4 | Testing framework |

---

## 2. Page Structure & Routing

### Page Routes

| Route | File | Purpose |
|-------|------|---------|
| `/` | `app/pages/index.vue` | Video upload interface |
| `/step2` | `app/pages/step2.vue` | Processing status dashboard |
| `/results` | `app/pages/results.vue` | Results display with cards |
| `/test` | `app/pages/test.vue` | Test/placeholder page |

### Navigation Flow

```
index.vue (Upload)
    │
    │ Upload successful → UUID generated
    ▼
step2.vue?file={uuid} (Processing)
    │
    │ Processing stages:
    │ 1. Audio extraction (FFmpeg)
    │ 2. Frame extraction (FFmpeg) [parallel]
    │ 3. Transcript (OpenAI Whisper) [after audio]
    │ 4. Details (OpenAI GPT) [after transcript]
    │
    │ All complete → 3s countdown
    ▼
results.vue?file={uuid} (Results)
    │
    │ Displays:
    │ - Video player
    │ - Summary, descriptions, agenda
    │ - Transcript, quiz
    ▼
    Done
```

### Page Details

**index.vue** (`/`):
- Contains VideoUpload component
- Drag-and-drop file upload
- Shows loading states during upload
- Displays success with UUID
- Routes to step2 on success

**step2.vue** (`/step2?file={uuid}`):
- Video preview player
- 4 processing status cards with visual indicators
- Auto-starts processing on mount
- Sequential/parallel processing orchestration
- Auto-redirects to results after 3s countdown
- Retry capability for failed steps

**results.vue** (`/results?file={uuid}`):
- Video preview player
- Grid layout (1/2/3 columns responsive)
- 6 card components: Summary, ShortDescription, LongDescription, Agenda, Transcript, Quiz
- Each card fetches its own data independently

---

## 3. Component Analysis

### VideoUpload.vue (`components/VideoUpload.vue`)

**Purpose**: Main upload component with chunked file upload support

**Features**:
- Drag-and-drop interface
- File type validation (video/* only)
- File size validation (max 5GB)
- Chunked upload (10MB chunks)
- Progress tracking
- Video preview after upload
- States: idle, processing, success, error

**Upload Flow**:
1. `POST /api/upload/init` → Get upload session
2. Loop: `POST /api/upload/chunk` → Upload each 10MB chunk
3. `POST /api/upload/finalize` → Combine chunks, return UUID

### Card Components (`components/cards/`)

All cards follow a consistent pattern:

| Component | Color | Data Source | Features |
|-----------|-------|-------------|----------|
| SummaryCard | Orange | `/api/result/{id}/details` | Read time calculation |
| ShortDescriptionCard | Orange | `/api/result/{id}/details` | Expand/collapse (3 paragraphs max) |
| LongDescriptionCard | Orange | `/api/result/{id}/details` | Expand/collapse, word count |
| AgendaCard | Blue | `/api/result/{id}/details` | Thumbnails, modal gallery |
| TranscriptCard | Green | `/api/result/{id}/transcript` | Timestamps, word count, duration |
| QuizCard | Indigo | `/api/result/{id}/details` | Interactive quiz, scoring |
| ScreenshotCard | Purple | Direct frames | Image gallery |

**Common Card Structure**:
```vue
<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <!-- Header: Icon + Title -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-{color}-50 rounded-lg ...">
        <svg>...</svg>
      </div>
      <h3 class="font-semibold text-gray-900">Title</h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading">Skeleton...</div>

    <!-- Error State -->
    <div v-else-if="error">Error + Retry button</div>

    <!-- Success State -->
    <div v-else>Content...</div>
  </div>
</template>
```

---

## 4. Server API Endpoints

### Upload Endpoints (`server/api/upload/`)

**POST `/api/upload/init`** (`init.post.ts`):
- Creates upload session with UUID
- Stores session in memory Map
- Creates temp directory for chunks
- Returns: `{ uploadId, uuid, chunkSize }`

**POST `/api/upload/chunk`** (`chunk.post.ts`):
- Receives individual file chunks
- Validates chunk index and session
- Saves chunk to temp directory
- Returns: `{ received: true, chunkIndex }`

**POST `/api/upload/finalize`** (`finalize.post.ts`):
- Combines all chunks into final file
- Moves to permanent location
- Cleans up temp files and session
- Returns: `{ uuid, path, fileName, fileSize }`

### Processing Endpoints (`server/api/process/[id]/`)

**POST `/api/process/{id}/audio`** (`audio.ts`):
- Extracts audio using FFmpeg
- Command: `ffmpeg -i video.mp4 -vn -acodec aac -b:a 48k audio.m4a`
- Checks if already processed (caching)
- Returns: `{ success, audioPath, duration, size }`

**POST `/api/process/{id}/frames`** (`frames.ts`):
- Extracts frames using FFmpeg
- Command: `ffmpeg -i video.mp4 -vf fps=2 -q:v 2 frame_%05d.jpg`
- Extracts at 2 frames per second
- Returns: `{ success, framesPath, frameCount }`

**POST `/api/process/{id}/transcript`** (`transcript.ts`):
- Calls OpenAI Whisper API
- Model: `whisper-1`
- Response format: `verbose_json`
- Caches result to `whisper.json`
- Returns: `{ success, transcript, cached }`

**POST `/api/process/{id}/details`** (`details.ts`):
- Calls OpenAI GPT API
- Generates: summary, shortDescription, longDescription, agenda, quiz
- Caches result to `details.json`
- Returns: `{ success, details, cached }`

### Result Endpoints (`server/api/result/[id]/`)

**GET `/api/result/{id}/details`** (`details.ts`):
- Returns cached details.json
- Contains: summary, shortDescription[], longDescription[], agenda, quiz[]

**GET `/api/result/{id}/transcript`** (`transcript.ts`):
- Returns formatted transcript
- Segments with: startTime, endTime, startSeconds, endSeconds, text

**GET `/api/result/{id}/quiz`** (`quiz.ts`):
- Returns quiz questions
- Each question: question, options[], correct_answer_index

### Other Endpoints

- `GET /api/agenda/{id}` - Demo agenda data
- `GET /api/info/{id}` - Demo info data
- `GET /api/hello` - Test endpoint

---

## 5. Server Utilities

### uploadSessions.js (`server/utils/uploadSessions.js`)

**Purpose**: In-memory storage for upload sessions

```javascript
// Session structure
{
  uuid: string,
  fileName: string,
  fileSize: number,
  fileType: string,
  totalChunks: number,
  uploadedChunks: Set<number>,
  uploadDir: string,
  tempDir: string,
  createdAt: Date
}
```

**Features**:
- Map-based session storage
- Auto-cleanup of expired sessions (24-hour TTL)
- Cleanup runs every hour

**Note**: Sessions are lost on server restart (in-memory only)

---

## 6. Data Storage Structure

### File Organization

Each upload creates:
```
public/data/uploads/{uuid}/
├── video.mp4               # Original uploaded video
├── audio/
│   └── audio.m4a          # Extracted audio (AAC, 48kbps)
├── frames/
│   ├── frame_00000.jpg    # First frame
│   ├── frame_00001.jpg
│   └── ...                # ~2 frames per second
├── transcript/
│   └── whisper.json       # OpenAI Whisper response
└── details.json           # Generated content
```

### Data Formats

**whisper.json** (Whisper API response):
```json
{
  "text": "Full transcript...",
  "segments": [
    {
      "id": 0,
      "start": 0.0,
      "end": 5.2,
      "text": "Segment text..."
    }
  ],
  "language": "en"
}
```

**details.json** (Generated content):
```json
{
  "summary": "Brief summary of the video...",
  "shortDescription": [
    "Key point 1",
    "Key point 2",
    "Key point 3"
  ],
  "longDescription": [
    "Detailed paragraph 1...",
    "Detailed paragraph 2..."
  ],
  "agenda": {
    "items": [
      {
        "title": "Topic name",
        "startSecond": 0,
        "duration": 60
      }
    ]
  },
  "quiz": [
    {
      "question": "Question text?",
      "options": ["A", "B", "C", "D"],
      "correct_answer_index": 0
    }
  ]
}
```

---

## 7. External Integrations

### OpenAI API

**Whisper** (Audio Transcription):
- Endpoint: `openai.audio.transcriptions.create()`
- Model: `whisper-1`
- Input: M4A audio file
- Output: Verbose JSON with segments and timestamps

**GPT** (Content Generation):
- Endpoint: `openai.responses.create()`
- Model: `gpt-5` (as configured)
- Input: Transcript text with structured prompt
- Output: JSON with summary, descriptions, agenda, quiz

### FFmpeg Commands

**Audio Extraction**:
```bash
ffmpeg -i video.mp4 -vn -acodec aac -b:a 48k audio.m4a
```
- `-vn`: No video
- `-acodec aac`: AAC codec
- `-b:a 48k`: 48kbps bitrate

**Frame Extraction**:
```bash
ffmpeg -i video.mp4 -vf fps=2 -q:v 2 frame_%05d.jpg
```
- `-vf fps=2`: 2 frames per second
- `-q:v 2`: Quality level 2 (high quality)
- `%05d`: 5-digit padding

**Duration Detection**:
```bash
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 video.mp4
```

---

## 8. Processing Pipeline

### Sequential/Parallel Processing

```
START
  │
  ├─────────────────┬─────────────────┐
  │                 │                 │
  ▼                 ▼                 │
[Audio]         [Frames]              │
  │                 │                 │
  │ ────────────────┘                 │
  │                                   │
  ▼                                   │
[Transcript] ◄── depends on Audio     │
  │                                   │
  ▼                                   │
[Details] ◄── depends on Transcript   │
  │                                   │
  ▼                                   │
COMPLETE ◄────────────────────────────┘
```

### State Management in step2.vue

```javascript
const processing = {
  audio: ref(false),
  frames: ref(false),
  transcript: ref(false),
  details: ref(false)
}

const completed = {
  audio: ref(false),
  frames: ref(false),
  transcript: ref(false),
  details: ref(false)
}

const failed = {
  audio: ref(false),
  frames: ref(false),
  transcript: ref(false),
  details: ref(false)
}
```

---

## 9. Styling Patterns

### Tailwind CSS Configuration

**tailwind.config.js**:
- Content: `./components/**/*.{js,vue,ts}`, `./app/pages/**/*.vue`
- Default Tailwind theme

**Common Classes**:
- Container: `container mx-auto px-4 py-8 max-w-7xl`
- Card: `bg-white border border-gray-100 rounded-xl p-6`
- Grid: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`
- Button: `px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700`
- Loading: `animate-pulse bg-gray-100 rounded`

### Color Scheme by Component Type

| Type | Background | Icon Color |
|------|------------|------------|
| Summary/Text | `bg-orange-50` | `text-orange-600` |
| Transcript | `bg-green-50` | `text-green-600` |
| Agenda/Lists | `bg-blue-50` | `text-blue-600` |
| Media | `bg-purple-50` | `text-purple-600` |
| Interactive | `bg-indigo-50` | `text-indigo-600` |
| Error | `bg-red-50` | `text-red-600` |

---

## 10. Error Handling Patterns

### Frontend (Vue Components)

```javascript
try {
  const response = await fetch(`/api/endpoint`)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  data.value = await response.json()
} catch (err) {
  console.error('Failed to fetch:', err)
  error.value = true
}
```

### Backend (Nuxt Server)

```typescript
if (!id) {
  throw createError({
    statusCode: 400,
    statusMessage: 'ID parameter is required'
  })
}

if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid ID format'
  })
}
```

---

## 11. Known Issues & Limitations

1. **Session Persistence**: Upload sessions are in-memory only, lost on server restart
2. **EBADF Error**: Can occur during file operations - clear uploads directory to resolve
3. **Large Files**: 5GB limit may still cause memory issues on constrained systems
4. **FFmpeg Dependency**: Must be installed separately on the system
5. **OpenAI Costs**: Whisper and GPT API calls incur costs per request
6. **No Authentication**: No user authentication or rate limiting implemented

---

## 12. Potential Improvements

1. **Persistent Sessions**: Use Redis or database for upload sessions
2. **Background Jobs**: Use job queue (Bull, etc.) for processing
3. **Progress Streaming**: WebSocket for real-time processing progress
4. **User Authentication**: Add auth layer for multi-user support
5. **Storage Abstraction**: Support S3/cloud storage for uploads
6. **Caching Layer**: Redis for API response caching
7. **Error Recovery**: Better handling of partial processing failures
8. **Testing**: Add comprehensive test coverage with Vitest