<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900">Summary</h3>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2"/>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load summary</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchSummary"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="summaryData" class="space-y-4">
      <p class="text-gray-700 leading-relaxed text-sm">{{ summaryData.summary }}</p>
      <div class="flex items-center gap-1 text-xs text-gray-500">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ readTime }} min read
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const summaryData = ref(null)

const readTime = computed(() => {
  if (!summaryData.value?.summary) return 0
  // Average reading speed is ~200 words per minute
  const words = summaryData.value.summary.split(' ').length
  return Math.max(1, Math.ceil(words / 200))
})

const fetchSummary = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await fetch('/api/info/id-demo-result')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    summaryData.value = data
  } catch (err) {
    console.error('Failed to fetch summary:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSummary()
})
</script>
