<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 md:col-span-2">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Detailed Description</h3>
      </div>

      <button
        v-if="!loading && infoData && infoData.longDescription?.length > 2"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        @click="showFullDescription = !showFullDescription"
      >
        {{ showFullDescription ? 'Show Less' : 'Show More' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-4/5"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"/>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load description</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchInfo"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="infoData?.longDescription" class="space-y-6">
      <div
        class="space-y-4 overflow-hidden transition-all duration-300"
        :class="showFullDescription ? 'max-h-none' : 'max-h-64'"
      >
        <p
          v-for="(paragraph, index) in displayedDescription"
          :key="index"
          class="text-gray-700 leading-relaxed text-sm"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="pt-4 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
        <span>{{ infoData.longDescription.length }} sections</span>
        <span>{{ wordCount }} words</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showFullDescription = ref(false)
const loading = ref(true)
const error = ref(false)
const infoData = ref(null)

const displayedDescription = computed(() => {
  if (!infoData.value?.longDescription) return []
  return showFullDescription.value
    ? infoData.value.longDescription
    : infoData.value.longDescription.slice(0, 2)
})

const wordCount = computed(() => {
  if (!infoData.value?.longDescription) return 0
  return infoData.value.longDescription
    .reduce((count, paragraph) => count + paragraph.split(' ').length, 0)
    .toLocaleString()
})

const fetchInfo = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await fetch('/api/info/id-demo-result')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    infoData.value = data
  } catch (err) {
    console.error('Failed to fetch info:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchInfo()
})
</script>
