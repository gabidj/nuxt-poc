<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 lg:col-span-3">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Transcript</h3>
      </div>

      <button
        v-if="!loading && transcriptData"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        @click="showFullTranscript = !showFullTranscript"
      >
        {{ showFullTranscript ? 'Show Less' : 'Show More' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="space-y-2">
        <div class="w-16 h-3 bg-gray-100 rounded animate-pulse"/>
        <div class="h-4 bg-gray-100 rounded animate-pulse"/>
        <div class="h-4 bg-gray-100 rounded animate-pulse w-4/5"/>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load transcript</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchTranscript"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="transcriptData" class="space-y-6">
      <div
        class="space-y-6 overflow-hidden transition-all duration-300"
        :class="showFullTranscript ? 'max-h-none' : 'max-h-80'"
      >
        <div
          v-for="(segment, index) in transcriptData.transcript"
          :key="index"
          class="group"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {{ segment.startTime }}
            </span>
          </div>
          <p class="text-gray-700 leading-relaxed text-sm pl-4 border-l-2 border-gray-100 group-hover:border-gray-200 transition-colors">
            {{ segment.text }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span>{{ formatDuration(totalDuration) }} duration</span>
        <span>{{ wordCount }} words</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showFullTranscript = ref(false)
const loading = ref(true)
const error = ref(false)
const transcriptData = ref(null)

const totalDuration = computed(() => {
  if (!transcriptData.value?.transcript?.length) return 0
  const lastSegment = transcriptData.value.transcript[transcriptData.value.transcript.length - 1]
  return lastSegment.endSeconds
})

const wordCount = computed(() => {
  if (!transcriptData.value?.transcript) return 0
  return transcriptData.value.transcript
    .reduce((count, segment) => count + segment.text.split(' ').length, 0)
    .toLocaleString()
})

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const fetchTranscript = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await fetch('/api/transcript/id-demo-result')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    transcriptData.value = data
  } catch (err) {
    console.error('Failed to fetch transcript:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchTranscript()
})
</script>
