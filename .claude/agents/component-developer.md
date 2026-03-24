# Component Developer Agent

## Purpose

Assist in creating new Vue components following established patterns in this codebase.

---

## Card Component Template

All result display cards follow this structure:

### Template Structure

```vue
<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-{color}-50 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-{color}-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <!-- Icon path -->
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900">Title</h3>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2"/>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load data</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchData"
      >
        Try Again
      </button>
    </div>

    <!-- Success State -->
    <div v-else-if="data" class="space-y-4">
      <!-- Content here -->
    </div>
  </div>
</template>
```

### Script Setup Pattern

```vue
<script setup>
import { ref, computed, onMounted } from 'vue'

// State
const loading = ref(true)
const error = ref(false)
const data = ref(null)

// Computed (optional)
const derivedValue = computed(() => {
  if (!data.value) return null
  // Calculate derived value
  return data.value.someField
})

// Methods
const fetchData = async () => {
  loading.value = true
  error.value = false

  const id = useRoute().query?.file

  try {
    const response = await fetch(`/api/result/${id}/details`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    data.value = await response.json()
  } catch (err) {
    console.error('Failed to fetch data:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchData()
})
</script>
```

---

## Color Coding Convention

Use consistent colors based on component type:

| Component Type | Background | Text/Icon |
|----------------|------------|-----------|
| Summary/Text | `bg-orange-50` | `text-orange-600` |
| Transcript | `bg-green-50` | `text-green-600` |
| Agenda/Lists | `bg-blue-50` | `text-blue-600` |
| Media/Screenshots | `bg-purple-50` | `text-purple-600` |
| Interactive (Quiz) | `bg-indigo-50` | `text-indigo-600` |
| Error states | `bg-red-50` | `text-red-600` |

---

## Common Patterns

### Expand/Collapse Content

```vue
<script setup>
const showAll = ref(false)

const displayedItems = computed(() => {
  if (!data.value?.items) return []
  return showAll.value ? data.value.items : data.value.items.slice(0, 3)
})
</script>

<template>
  <div v-for="item in displayedItems" :key="item.id">
    {{ item.text }}
  </div>

  <button
    v-if="data?.items?.length > 3"
    @click="showAll = !showAll"
    class="text-sm text-blue-600 hover:text-blue-700 font-medium"
  >
    {{ showAll ? 'Show Less' : `Show All (${data.items.length})` }}
  </button>
</template>
```

### Word Count Calculation

```javascript
const wordCount = computed(() => {
  if (!data.value?.text) return 0
  return data.value.text.split(/\s+/).filter(word => word.length > 0).length
})
```

### Read Time Calculation

```javascript
const readTime = computed(() => {
  if (!data.value?.text) return 0
  const words = data.value.text.split(' ').length
  return Math.max(1, Math.ceil(words / 200)) // 200 words per minute
})
```

### Time Formatting

```javascript
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
```

---

## Modal Pattern (from AgendaCard)

```vue
<script setup>
const modalOpen = ref(false)
const currentIndex = ref(0)

const openModal = (index) => {
  currentIndex.value = index
  modalOpen.value = true
}

const closeModal = () => {
  modalOpen.value = false
}

const nextItem = () => {
  if (currentIndex.value < items.value.length - 1) {
    currentIndex.value++
  }
}

const prevItem = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}
</script>

<template>
  <!-- Trigger -->
  <button @click="openModal(index)">Open</button>

  <!-- Modal Overlay -->
  <div
    v-if="modalOpen"
    class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
    @click="closeModal"
  >
    <div class="relative max-w-4xl max-h-[90vh]" @click.stop>
      <!-- Content -->
      <img :src="currentItem.image" />

      <!-- Navigation -->
      <button @click="prevItem" :disabled="currentIndex === 0">Prev</button>
      <button @click="nextItem" :disabled="currentIndex === items.length - 1">Next</button>

      <!-- Close -->
      <button @click="closeModal">Close</button>
    </div>
  </div>
</template>
```

---

## Interactive Quiz Pattern (from QuizCard)

```vue
<script setup>
const currentQuestion = ref(0)
const selectedAnswers = ref({})
const showResults = ref(false)

const selectAnswer = (questionIndex, answerIndex) => {
  selectedAnswers.value[questionIndex] = answerIndex
}

const submitQuiz = () => {
  showResults.value = true
}

const score = computed(() => {
  let correct = 0
  questions.value.forEach((q, i) => {
    if (selectedAnswers.value[i] === q.correct_answer_index) {
      correct++
    }
  })
  return correct
})

const scorePercentage = computed(() => {
  return Math.round((score.value / questions.value.length) * 100)
})

const retakeQuiz = () => {
  selectedAnswers.value = {}
  showResults.value = false
  currentQuestion.value = 0
}
</script>
```

---

## Reference Files

| Pattern | Reference File |
|---------|----------------|
| Simple card | `components/cards/SummaryCard.vue` |
| Expand/collapse | `components/cards/TranscriptCard.vue` |
| Interactive quiz | `components/cards/QuizCard.vue` |
| Modal gallery | `components/cards/AgendaCard.vue` |
| Upload component | `components/VideoUpload.vue` |

---

## Tailwind Class Reference

### Common Card Classes
```
Container: bg-white border border-gray-100 rounded-xl p-6
Header icon: w-8 h-8 bg-{color}-50 rounded-lg flex items-center justify-center
Title: font-semibold text-gray-900
Body text: text-gray-700 leading-relaxed text-sm
Metadata: text-xs text-gray-500
```

### Button Classes
```
Primary: px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700
Secondary: text-sm text-blue-600 hover:text-blue-700 font-medium
Disabled: opacity-50 cursor-not-allowed
```

### Loading Skeleton
```
Skeleton line: h-4 bg-gray-100 rounded animate-pulse
Skeleton variations: w-3/4, w-1/2, w-full
```

### Error State
```
Error text: text-red-600
Retry button: text-sm text-blue-600 hover:text-blue-700 font-medium
```