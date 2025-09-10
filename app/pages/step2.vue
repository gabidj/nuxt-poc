<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Video Analysis Platform
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        ID: {{ identifier }}
      </p>
    </div>

    <div v-if="identifier" class="mt-6">
      <div class="bg-white rounded-lg shadow-sm border p-4 mb-8">
        <h4 class="text-lg font-medium text-gray-900 mb-3">Video Preview</h4>
        <video
          :src="`/data/uploads/${identifier}/video.mp4`"
          controls
          class="max-w-full h-auto rounded-lg shadow-sm"
          style="max-height: 400px;"
        >
          Your browser does not support the video tag.
        </video>
      </div>

      <!-- Processing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <!-- Audio Processing Card -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="p-2 bg-blue-100 rounded-lg mr-3">
                <svg class="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M9 9a3 3 0 000 6v-6a3 3 0 000-6zm0 0V7a2 2 0 012-2h2a2 2 0 012 2v2M9 9a3 3 0 000 6v-6a3 3 0 000-6z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Audio</h3>
            </div>
            <div v-if="processing.audio" class="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"/>
            <div v-else-if="completed.audio" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="failed.audio" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">Extracting audio from video</p>
          <button
            v-if="failed.audio"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            @click="startProcessing('audio')"
          >
            Retry Audio Processing
          </button>
          <div v-else-if="processing.audio" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-center">
            Processing...
          </div>
          <div v-else-if="completed.audio" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center">
            Complete
          </div>
          <div v-else class="w-full px-4 py-2 bg-gray-400 text-white rounded-lg text-center">
            Starting...
          </div>
        </div>

        <!-- Frames Processing Card -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="p-2 bg-purple-100 rounded-lg mr-3">
                <svg class="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Frames</h3>
            </div>
            <div v-if="processing.frames" class="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"/>
            <div v-else-if="completed.frames" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="failed.frames" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">Extracting key frames</p>
          <button
            v-if="failed.frames"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            @click="startProcessing('frames')"
          >
            Retry Frame Processing
          </button>
          <div v-else-if="processing.frames" class="w-full px-4 py-2 bg-purple-600 text-white rounded-lg text-center">
            Processing...
          </div>
          <div v-else-if="completed.frames" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center">
            Complete
          </div>
          <div v-else class="w-full px-4 py-2 bg-gray-400 text-white rounded-lg text-center">
            Starting...
          </div>
        </div>

        <!-- Transcript Processing Card -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="p-2 bg-green-100 rounded-lg mr-3">
                <svg class="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Transcript</h3>
            </div>
            <div v-if="processing.transcript" class="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"/>
            <div v-else-if="completed.transcript" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="failed.transcript" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">Generating transcript</p>
          <div v-if="!completed.audio && !failed.audio" class="text-xs text-gray-500 mb-2">
            ⏳ Waiting for audio completion
          </div>
          <button
            v-if="failed.transcript"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            @click="startProcessing('transcript')"
          >
            Retry Transcript Processing
          </button>
          <div v-else-if="processing.transcript" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center">
            Processing...
          </div>
          <div v-else-if="completed.transcript" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center">
            Complete
          </div>
          <div v-else-if="completed.audio" class="w-full px-4 py-2 bg-gray-400 text-white rounded-lg text-center">
            Starting...
          </div>
          <div v-else class="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-center">
            Waiting...
          </div>
        </div>

        <!-- Details Processing Card -->
        <div class="bg-white rounded-lg shadow-sm border p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center">
              <div class="p-2 bg-orange-100 rounded-lg mr-3">
                <svg class="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <h3 class="text-lg font-semibold text-gray-900">Details</h3>
            </div>
            <div v-if="processing.details" class="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"/>
            <div v-else-if="completed.details" class="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div v-else-if="failed.details" class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
          <p class="text-sm text-gray-600 mb-4">Analyzing video details</p>
          <div v-if="!completed.transcript && !failed.transcript" class="text-xs text-gray-500 mb-2">
            ⏳ Waiting for transcript completion
          </div>
          <button
            v-if="failed.details"
            class="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            @click="startProcessing('details')"
          >
            Retry Details Processing
          </button>
          <div v-else-if="processing.details" class="w-full px-4 py-2 bg-orange-600 text-white rounded-lg text-center">
            Processing...
          </div>
          <div v-else-if="completed.details" class="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-center">
            Complete
          </div>
          <div v-else-if="completed.transcript" class="w-full px-4 py-2 bg-gray-400 text-white rounded-lg text-center">
            Starting...
          </div>
          <div v-else class="w-full px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-center">
            Waiting...
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SummaryCard from "../components/cards/SummaryCard"
import ShortDescriptionCard from "../components/cards/ShortDescriptionCard"
import LongDescriptionCard from "../components/cards/LongDescriptionCard"
import AgendaCard from "../components/cards/AgendaCard"
import TranscriptCard from "../components/cards/TranscriptCard"
import QuizCard from "../components/cards/QuizCard.vue"

const identifier = useRoute().query.file

// Processing states
const processing = ref({
  audio: false,
  frames: false,
  transcript: false,
  details: false
})

const completed = ref({
  audio: false,
  frames: false,
  transcript: false,
  details: false
})

const failed = ref({
  audio: false,
  frames: false,
  transcript: false,
  details: false
})

// Start processing function
const startProcessing = async (type) => {
  // Check dependencies
  if (type === 'transcript' && !completed.value.audio) {
    return
  }
  if (type === 'details' && !completed.value.transcript) {
    return
  }

  // Reset states
  processing.value[type] = true
  failed.value[type] = false

  try {
    const response = await $fetch(`/api/process/${identifier}/${type}`, {
      method: 'POST'
    })

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000))

    completed.value[type] = true

    // Auto-start next step in sequence
    if (type === 'audio' && !completed.value.transcript && !processing.value.transcript && !failed.value.transcript) {
      setTimeout(() => startProcessing('transcript'), 500)
    }

    if (type === 'transcript' && !completed.value.details && !processing.value.details && !failed.value.details) {
      setTimeout(() => startProcessing('details'), 500)
    }

  } catch (error) {
    console.error(`Error processing ${type}:`, error)
    failed.value[type] = true
  } finally {
    processing.value[type] = false
  }
}

// Auto-start processing on mount
onMounted(() => {
  if (identifier) {
    // Start audio and frames processing automatically
    setTimeout(() => startProcessing('audio'), 1000)
    setTimeout(() => startProcessing('frames'), 1000)
  }
})

const isProcessing = ref(false)
const showCards = ref(false)
const cardsLoading = ref(true)

const handleVideoUpload = async (file) => {
  isProcessing.value = true
  showCards.value = false
  cardsLoading.value = true

  try {
    await processVideo(file)
    showCards.value = true

    setTimeout(() => {
      cardsLoading.value = false
    }, 200)
  } finally {
    isProcessing.value = false
  }
}

const processVideo = async (file) => {
  return new Promise((resolve) => setTimeout(resolve, 200))
}
</script>
