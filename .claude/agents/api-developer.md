# API Developer Agent

## Purpose

Assist in creating new Nuxt server API endpoints following established patterns.

---

## Standard GET Endpoint Template

```typescript
// server/api/[endpoint]/[id].ts
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  // 1. Get and validate ID parameter
  const id = getRouterParam(event, 'id')

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

  // 2. Build file path
  const filePath = path.join(
    process.cwd(),
    'public',
    'data',
    'uploads',
    id,
    'filename.json'
  )

  // 3. Check file exists
  try {
    await fs.access(filePath)
  } catch {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }

  // 4. Read and return data
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process file'
    })
  }
})
```

---

## Standard POST Endpoint Template

```typescript
// server/api/[endpoint]/[id].post.ts
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  // 1. Get and validate ID
  const id = getRouterParam(event, 'id')

  if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID'
    })
  }

  // 2. Get request body (if needed)
  const body = await readBody(event)

  // 3. Validate required fields
  if (!body.requiredField) {
    throw createError({
      statusCode: 400,
      statusMessage: 'requiredField is required'
    })
  }

  // 4. Build paths
  const baseDir = path.join(process.cwd(), 'public', 'data', 'uploads', id)
  const outputPath = path.join(baseDir, 'output.json')

  // 5. Check if already processed (caching)
  try {
    await fs.access(outputPath)
    const cached = await fs.readFile(outputPath, 'utf-8')
    return { success: true, cached: true, data: JSON.parse(cached) }
  } catch {
    // Not cached, continue processing
  }

  // 6. Process data
  try {
    const result = await processData(body)

    // 7. Save result
    await fs.writeFile(outputPath, JSON.stringify(result, null, 2))

    return { success: true, cached: false, data: result }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Processing failed'
    })
  }
})
```

---

## FFmpeg Processing Pattern

Based on `server/api/process/[id]/audio.ts`:

```typescript
import { spawn } from 'child_process'
import { promises as fs } from 'fs'
import path from 'path'

// Helper: Execute command with Promise
const execCommand = (command: string, args: string[]): Promise<{ stdout: string; stderr: string }> => {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args)
    let stdout = ''
    let stderr = ''

    proc.stdout.on('data', (data) => { stdout += data.toString() })
    proc.stderr.on('data', (data) => { stderr += data.toString() })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr })
      } else {
        reject(new Error(`Command failed with code ${code}: ${stderr}`))
      }
    })

    proc.on('error', reject)
  })
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Validate ID
  if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const baseDir = path.join(process.cwd(), 'public', 'data', 'uploads', id)
  const videoPath = path.join(baseDir, 'video.mp4')
  const outputDir = path.join(baseDir, 'audio')
  const outputPath = path.join(outputDir, 'audio.m4a')

  // Check if already processed
  try {
    await fs.access(outputPath)
    return { success: true, cached: true, path: outputPath }
  } catch {
    // Not processed yet
  }

  // Verify video exists
  try {
    await fs.access(videoPath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Video not found' })
  }

  // Create output directory
  await fs.mkdir(outputDir, { recursive: true })

  // Run FFmpeg
  try {
    await execCommand('ffmpeg', [
      '-i', videoPath,
      '-vn',              // No video
      '-acodec', 'aac',   // AAC codec
      '-b:a', '48k',      // 48kbps bitrate
      outputPath
    ])

    return { success: true, cached: false, path: outputPath }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'FFmpeg processing failed'
    })
  }
})
```

---

## OpenAI Integration Pattern

Based on `server/api/process/[id]/transcript.ts` and `details.ts`:

### Whisper Transcription

```typescript
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  // Validate
  if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const config = useRuntimeConfig()
  const openai = new OpenAI({ apiKey: config.openAiKey })

  const baseDir = path.join(process.cwd(), 'public', 'data', 'uploads', id)
  const audioPath = path.join(baseDir, 'audio', 'audio.m4a')
  const outputPath = path.join(baseDir, 'transcript', 'whisper.json')

  // Check cache
  try {
    await fs.access(outputPath)
    const cached = await fs.readFile(outputPath, 'utf-8')
    return { success: true, cached: true, transcript: JSON.parse(cached) }
  } catch {
    // Not cached
  }

  // Verify audio exists
  try {
    await fs.access(audioPath)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Audio not found' })
  }

  // Create output directory
  await fs.mkdir(path.dirname(outputPath), { recursive: true })

  // Call Whisper API
  try {
    const audioFile = await fs.readFile(audioPath)
    const file = new File([audioFile], 'audio.m4a', { type: 'audio/m4a' })

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      response_format: 'verbose_json'
    })

    // Save result
    await fs.writeFile(outputPath, JSON.stringify(transcription, null, 2))

    return { success: true, cached: false, transcript: transcription }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Transcription failed'
    })
  }
})
```

### GPT Content Generation

```typescript
import OpenAI from 'openai'
import { promises as fs } from 'fs'
import path from 'path'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id || !/^[a-zA-Z0-9-_]+$/.test(id)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid ID' })
  }

  const config = useRuntimeConfig()
  const openai = new OpenAI({ apiKey: config.openAiKey })

  const baseDir = path.join(process.cwd(), 'public', 'data', 'uploads', id)
  const transcriptPath = path.join(baseDir, 'transcript', 'whisper.json')
  const outputPath = path.join(baseDir, 'details.json')

  // Check cache
  try {
    await fs.access(outputPath)
    const cached = await fs.readFile(outputPath, 'utf-8')
    return { success: true, cached: true, details: JSON.parse(cached) }
  } catch {
    // Not cached
  }

  // Read transcript
  let transcript
  try {
    const content = await fs.readFile(transcriptPath, 'utf-8')
    transcript = JSON.parse(content)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Transcript not found' })
  }

  // Generate content with GPT
  try {
    const prompt = `
Based on the following transcript, generate:
1. A brief summary (2-3 sentences)
2. Short description (3 key points)
3. Long description (5 paragraphs)
4. Agenda with timestamps
5. Quiz questions (5 multiple choice)

Transcript:
${transcript.text}

Respond in JSON format.
`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const details = JSON.parse(response.choices[0].message.content)

    // Save result
    await fs.writeFile(outputPath, JSON.stringify(details, null, 2))

    return { success: true, cached: false, details }
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Content generation failed'
    })
  }
})
```

---

## Validation Patterns

### ID Validation
```typescript
// Standard ID format: alphanumeric with hyphens and underscores
if (!/^[a-zA-Z0-9-_]+$/.test(id)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid ID format'
  })
}
```

### File Type Validation
```typescript
const allowedTypes = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'video/x-msvideo'
]

if (!allowedTypes.includes(fileType)) {
  throw createError({
    statusCode: 400,
    statusMessage: 'Invalid file type. Allowed: mp4, webm, mov, avi'
  })
}
```

### File Size Validation
```typescript
const MAX_SIZE = 5 * 1024 * 1024 * 1024 // 5GB

if (fileSize > MAX_SIZE) {
  throw createError({
    statusCode: 400,
    statusMessage: 'File too large. Maximum size: 5GB'
  })
}
```

---

## Error Response Format

Always use `createError` for consistent error responses:

```typescript
throw createError({
  statusCode: 400,  // HTTP status code
  statusMessage: 'Human-readable error message'
})
```

Common status codes:
- `400` - Bad Request (invalid input)
- `404` - Not Found (file/resource missing)
- `405` - Method Not Allowed
- `500` - Internal Server Error

---

## Reference Files

| Pattern | Reference File |
|---------|----------------|
| GET endpoint | `server/api/result/[id]/details.ts` |
| POST endpoint | `server/api/process/[id]/audio.ts` |
| Upload handling | `server/api/upload/init.post.ts` |
| Session management | `server/utils/uploadSessions.js` |
| FFmpeg processing | `server/api/process/[id]/frames.ts` |
| OpenAI integration | `server/api/process/[id]/transcript.ts` |

---

## File Naming Conventions

- GET endpoints: `[name].ts` or `[name].get.ts`
- POST endpoints: `[name].post.ts`
- Dynamic params: `[paramName].ts` or `[paramName]/index.ts`

Examples:
```
server/api/
├── hello.ts              # GET /api/hello
├── upload/
│   ├── init.post.ts      # POST /api/upload/init
│   ├── chunk.post.ts     # POST /api/upload/chunk
│   └── finalize.post.ts  # POST /api/upload/finalize
├── process/
│   └── [id]/
│       ├── audio.ts      # POST /api/process/{id}/audio
│       └── frames.ts     # POST /api/process/{id}/frames
└── result/
    └── [id]/
        └── details.ts    # GET /api/result/{id}/details
```