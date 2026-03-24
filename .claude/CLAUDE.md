# Nuxt 4 AI Video Analyzer

## Project Overview

This is an AI-powered video analysis platform that allows users to upload videos and receive automated analysis including transcripts, summaries, agendas, and interactive quizzes.

**Tech Stack:**
- Nuxt 4.1.0 / Vue 3.5.20 / Vue Router 4.5.1
- Tailwind CSS 3.4.17
- OpenAI SDK 5.19.1 (Whisper for transcription, GPT for content generation)
- FFmpeg (system dependency for audio/frame extraction)
- Heroicons Vue 2.2.0
- TypeScript / Vitest

---

## Directory Structure

```
nuxt-poc/
├── app/
│   ├── app.vue              # Root component
│   ├── pages/
│   │   ├── index.vue        # Home - video upload
│   │   ├── step2.vue        # Processing status
│   │   ├── results.vue      # Results display
│   │   └── test.vue         # Test page
│   └── assets/
│       └── tailwind.css     # Tailwind config
├── components/
│   ├── VideoUpload.vue      # Chunked upload component
│   └── cards/               # Result display cards
│       ├── SummaryCard.vue
│       ├── ShortDescriptionCard.vue
│       ├── LongDescriptionCard.vue
│       ├── AgendaCard.vue
│       ├── TranscriptCard.vue
│       ├── QuizCard.vue
│       └── ScreenshotCard.vue
├── server/
│   ├── api/
│   │   ├── upload/          # Chunked upload endpoints
│   │   ├── process/[id]/    # Processing endpoints
│   │   └── result/[id]/     # Result retrieval
│   └── utils/
│       └── uploadSessions.js # Session management
└── public/
    └── data/
        └── uploads/[uuid]/  # Uploaded files storage
```

---

## Development Commands

```bash
npm run dev      # Start development server (localhost:3000)
npm run build    # Build for production
npm run preview  # Preview production build
npm run generate # Static site generation
```

---

## Environment Setup

Create a `.env` file with:
```
OPENAI_API_KEY=your_api_key_here
```

**System Dependencies:**
- FFmpeg must be installed and available in PATH
- Node.js 18+

---

## Application Flow

1. **Upload** (`/`) - User uploads video via chunked upload (10MB chunks, max 5GB)
2. **Process** (`/step2?file={uuid}`) - Automatic processing:
   - Audio extraction (FFmpeg → M4A 48kbps)
   - Frame extraction (FFmpeg → 2fps JPG)
   - Transcription (OpenAI Whisper)
   - Content generation (OpenAI GPT)
3. **Results** (`/results?file={uuid}`) - Display analysis cards

---

## Key Patterns

### Vue Component Pattern
All card components follow this structure:
```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const data = ref(null)

const fetchData = async () => {
  loading.value = true
  error.value = false
  const id = useRoute().query?.file
  try {
    const response = await fetch(`/api/result/${id}/endpoint`)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    data.value = await response.json()
  } catch (err) {
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchData())
</script>
```

### Card Color Conventions
- **Orange** (`bg-orange-50`): Summary/text content
- **Green** (`bg-green-50`): Transcript
- **Blue** (`bg-blue-50`): Agenda/lists
- **Purple** (`bg-purple-50`): Media/screenshots
- **Indigo** (`bg-indigo-50`): Interactive (quiz)

### API Endpoint Pattern
```typescript
export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Validate ID
  if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  // Check file exists
  const filePath = path.join(process.cwd(), 'public', 'data', 'uploads', id, 'file.json')
  try {
    await fs.access(filePath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  // Return data
  return JSON.parse(await fs.readFile(filePath, 'utf-8'))
})
```

---

## File Storage Structure

Each upload creates a UUID-based directory:
```
public/data/uploads/{uuid}/
├── video.mp4           # Uploaded video
├── audio/
│   └── audio.m4a       # Extracted audio (48kbps)
├── frames/
│   └── frame_00000.jpg # Extracted frames (2fps)
├── transcript/
│   └── whisper.json    # Whisper API response
└── details.json        # Generated content (summary, agenda, quiz)
```

---

## API Endpoints

### Upload
- `POST /api/upload/init` - Initialize chunked upload
- `POST /api/upload/chunk` - Upload file chunk
- `POST /api/upload/finalize` - Complete upload

### Processing
- `POST /api/process/{id}/audio` - Extract audio
- `POST /api/process/{id}/frames` - Extract frames
- `POST /api/process/{id}/transcript` - Generate transcript
- `POST /api/process/{id}/details` - Generate AI content

### Results
- `GET /api/result/{id}/details` - Get generated content
- `GET /api/result/{id}/transcript` - Get formatted transcript
- `GET /api/result/{id}/quiz` - Get quiz data

---

## Common Issues

1. **EBADF Error**: Clear `/public/data/uploads/` directory
2. **Upload session lost**: In-memory sessions reset on server restart
3. **FFmpeg not found**: Ensure FFmpeg is installed and in PATH
4. **OpenAI errors**: Check OPENAI_API_KEY in .env

---

## Agents

See `.claude/agents/` for specialized agents:
- `codebase-explorer.md` - Navigate and understand the codebase
- `component-developer.md` - Create Vue components
- `api-developer.md` - Create Nuxt server APIs
- `testing-specialist.md` - Testing strategies