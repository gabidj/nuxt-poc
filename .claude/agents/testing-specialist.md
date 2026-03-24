# Testing Specialist Agent

## Purpose

Provide guidance on testing strategies for this Nuxt 4 application using Vitest.

---

## Testing Stack

- **Vitest** 3.2.4 - Test runner (installed in package.json)
- **@vue/test-utils** - Vue component testing (recommended to add)
- **msw** - API mocking (recommended to add)

---

## Recommended Test Structure

```
tests/
├── unit/
│   ├── components/
│   │   ├── VideoUpload.test.ts
│   │   └── cards/
│   │       ├── SummaryCard.test.ts
│   │       ├── TranscriptCard.test.ts
│   │       ├── QuizCard.test.ts
│   │       └── AgendaCard.test.ts
│   └── utils/
│       └── uploadSessions.test.ts
├── integration/
│   ├── api/
│   │   ├── upload.test.ts
│   │   ├── process.test.ts
│   │   └── result.test.ts
│   └── pages/
│       ├── upload-flow.test.ts
│       └── processing-flow.test.ts
└── e2e/
    └── video-analysis.test.ts
```

---

## Component Testing

### Basic Card Component Test

```typescript
// tests/unit/components/cards/SummaryCard.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import SummaryCard from '@/components/cards/SummaryCard.vue'

// Mock useRoute
vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { file: 'test-uuid' }
  })
}))

describe('SummaryCard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows loading state initially', () => {
    global.fetch = vi.fn(() => new Promise(() => {})) // Never resolves

    const wrapper = mount(SummaryCard)
    expect(wrapper.find('.animate-pulse').exists()).toBe(true)
  })

  it('displays summary after successful fetch', async () => {
    const mockData = {
      summary: 'This is a test summary of the video content.'
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    )

    const wrapper = mount(SummaryCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('This is a test summary')
    })
  })

  it('shows error state on fetch failure', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500
      })
    )

    const wrapper = mount(SummaryCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Failed to load')
    })
  })

  it('calculates read time correctly', async () => {
    // 400 words = 2 min read at 200 wpm
    const mockData = {
      summary: Array(400).fill('word').join(' ')
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockData)
      })
    )

    const wrapper = mount(SummaryCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('2 min read')
    })
  })

  it('calls fetch again when retry is clicked', async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: false, status: 500 })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ summary: 'Success' })
      })

    const wrapper = mount(SummaryCard)

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Failed to load')
    })

    await wrapper.find('button').trigger('click')

    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Success')
    })

    expect(global.fetch).toHaveBeenCalledTimes(2)
  })
})
```

### Quiz Component Test

```typescript
// tests/unit/components/cards/QuizCard.test.ts
import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import QuizCard from '@/components/cards/QuizCard.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    query: { file: 'test-uuid' }
  })
}))

const mockQuiz = {
  quiz: [
    {
      question: 'What is the main topic?',
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correct_answer_index: 0
    },
    {
      question: 'Second question?',
      options: ['A', 'B', 'C', 'D'],
      correct_answer_index: 2
    }
  ]
}

describe('QuizCard', () => {
  it('displays questions after loading', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuiz)
      })
    )

    const wrapper = mount(QuizCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('What is the main topic?')
    })
  })

  it('allows selecting answers', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuiz)
      })
    )

    const wrapper = mount(QuizCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('Option A')
    })

    const options = wrapper.findAll('[data-testid="quiz-option"]')
    await options[0].trigger('click')

    expect(options[0].classes()).toContain('selected')
  })

  it('calculates score correctly', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockQuiz)
      })
    )

    const wrapper = mount(QuizCard)
    await vi.waitFor(() => {
      expect(wrapper.text()).toContain('What is the main topic?')
    })

    // Select correct answer for first question
    // Select wrong answer for second question
    // Submit and check score is 50%
  })
})
```

---

## API Endpoint Testing

### GET Endpoint Test

```typescript
// tests/integration/api/result.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'

// Mock the file system
vi.mock('fs', async () => {
  const actual = await vi.importActual('fs')
  return {
    ...actual,
    promises: {
      access: vi.fn(),
      readFile: vi.fn()
    }
  }
})

describe('GET /api/result/[id]/details', () => {
  const mockDetails = {
    summary: 'Test summary',
    shortDescription: ['Point 1', 'Point 2'],
    longDescription: ['Paragraph 1'],
    agenda: { items: [] },
    quiz: []
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for missing ID', async () => {
    // Test implementation
  })

  it('returns 400 for invalid ID format', async () => {
    // Test with ID containing special characters
  })

  it('returns 404 when file not found', async () => {
    vi.mocked(fs.access).mockRejectedValue(new Error('ENOENT'))
    // Test implementation
  })

  it('returns details when file exists', async () => {
    vi.mocked(fs.access).mockResolvedValue(undefined)
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(mockDetails))
    // Test implementation
  })
})
```

### POST Processing Endpoint Test

```typescript
// tests/integration/api/process.test.ts
import { describe, it, expect, vi } from 'vitest'

describe('POST /api/process/[id]/audio', () => {
  it('returns cached result if audio already exists', async () => {
    // Mock fs.access to succeed (file exists)
    // Verify FFmpeg is not called
    // Verify response includes cached: true
  })

  it('processes audio when not cached', async () => {
    // Mock fs.access to fail for output, succeed for input
    // Mock spawn for FFmpeg
    // Verify response includes cached: false
  })

  it('returns 404 when video not found', async () => {
    // Mock fs.access to fail for video file
    // Verify 404 response
  })

  it('returns 500 when FFmpeg fails', async () => {
    // Mock spawn to reject
    // Verify 500 response
  })
})
```

---

## Upload Session Testing

```typescript
// tests/unit/utils/uploadSessions.test.ts
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('uploadSessions', () => {
  let uploadSessions: Map<string, any>
  let cleanupExpiredSessions: () => void

  beforeEach(async () => {
    // Import fresh module for each test
    vi.resetModules()
    const module = await import('@/server/utils/uploadSessions')
    uploadSessions = module.uploadSessions
    cleanupExpiredSessions = module.cleanupExpiredSessions
  })

  afterEach(() => {
    uploadSessions.clear()
  })

  it('stores session data correctly', () => {
    const session = {
      uuid: 'test-uuid',
      fileName: 'video.mp4',
      fileSize: 1024,
      createdAt: new Date()
    }

    uploadSessions.set('session-1', session)
    expect(uploadSessions.get('session-1')).toEqual(session)
  })

  it('cleans up expired sessions', () => {
    const oldSession = {
      uuid: 'old-uuid',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000) // 25 hours ago
    }

    const newSession = {
      uuid: 'new-uuid',
      createdAt: new Date()
    }

    uploadSessions.set('old', oldSession)
    uploadSessions.set('new', newSession)

    cleanupExpiredSessions()

    expect(uploadSessions.has('old')).toBe(false)
    expect(uploadSessions.has('new')).toBe(true)
  })
})
```

---

## E2E Testing

```typescript
// tests/e2e/video-analysis.test.ts
import { describe, it, expect } from 'vitest'

describe('Video Analysis E2E', () => {
  it('completes full upload and analysis flow', async () => {
    // 1. Navigate to home page
    // 2. Upload a test video file
    // 3. Verify redirect to step2
    // 4. Wait for all processing to complete
    // 5. Verify redirect to results
    // 6. Check all cards display data
  })

  it('handles upload errors gracefully', async () => {
    // Test with invalid file type
    // Verify error message displayed
  })

  it('allows retrying failed processing steps', async () => {
    // Mock a processing failure
    // Click retry button
    // Verify processing resumes
  })
})
```

---

## Mocking Strategies

### Mock OpenAI SDK

```typescript
vi.mock('openai', () => ({
  default: vi.fn().mockImplementation(() => ({
    audio: {
      transcriptions: {
        create: vi.fn().mockResolvedValue({
          text: 'Mock transcript',
          segments: []
        })
      }
    },
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                summary: 'Mock summary',
                quiz: []
              })
            }
          }]
        })
      }
    }
  }))
}))
```

### Mock FFmpeg

```typescript
vi.mock('child_process', () => ({
  spawn: vi.fn().mockImplementation(() => {
    const events: Record<string, Function> = {}
    return {
      stdout: {
        on: vi.fn((event, cb) => { events[`stdout_${event}`] = cb })
      },
      stderr: {
        on: vi.fn((event, cb) => { events[`stderr_${event}`] = cb })
      },
      on: vi.fn((event, cb) => {
        events[event] = cb
        if (event === 'close') {
          setTimeout(() => cb(0), 10) // Simulate success
        }
      })
    }
  })
}))
```

### Mock fetch in Components

```typescript
global.fetch = vi.fn().mockImplementation((url) => {
  if (url.includes('/api/result/')) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ summary: 'Test' })
    })
  }
  return Promise.reject(new Error('Unknown URL'))
})
```

---

## Test Coverage Goals

| Area | Target |
|------|--------|
| Card components | 80% |
| API endpoints | 90% |
| Upload flow | 85% |
| Processing pipeline | 75% |
| Error handling | 100% |

---

## Running Tests

```bash
# Run all tests
npm run test

# Run with coverage
npm run test -- --coverage

# Run specific test file
npm run test -- tests/unit/components/cards/SummaryCard.test.ts

# Watch mode
npm run test -- --watch
```

---

## Vitest Configuration

Add to `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'url'

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.nuxt/']
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./', import.meta.url)),
      '~': fileURLToPath(new URL('./', import.meta.url))
    }
  }
})
```
