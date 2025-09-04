<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Agenda</h3>
      </div>

      <button
        v-if="!loading && agendaData && agendaData.items.length > 3"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        @click="showFullAgenda = !showFullAgenda"
      >
        {{ showFullAgenda ? 'Show Less' : 'Show More' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="flex items-center gap-3">
        <div class="w-6 h-6 bg-gray-100 rounded-full animate-pulse"/>
        <div class="flex-1 h-4 bg-gray-100 rounded animate-pulse"/>
      </div>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load agenda</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchAgenda"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="agendaData" class="space-y-3">
      <div
        class="space-y-3 overflow-hidden transition-all duration-300"
        :class="showFullAgenda ? 'max-h-none' : 'max-h-80'"
      >
        <div
          v-for="(item, index) in displayedItems"
          :key="index"
          class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
        >
          <div class="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5 group-hover:bg-gray-200 transition-colors">
            {{ index + 1 }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-medium text-gray-900 text-sm">{{ item.title }}</p>
            <p class="text-xs text-gray-500 mt-1">{{ formatTimeRange(item.startSecond, item.duration) }}</p>
          </div>
        </div>
      </div>

      <div v-if="agendaData.items.length > 0" class="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span>{{ agendaData.items.length }} agenda items</span>
        <span>{{ formatDuration(totalDuration) }} total duration</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showFullAgenda = ref(false)
const loading = ref(true)
const error = ref(false)
const agendaData = ref(null)

const displayedItems = computed(() => {
  if (!agendaData.value?.items) return []
  return showFullAgenda.value ? agendaData.value.items : agendaData.value.items.slice(0, 3)
})

const totalDuration = computed(() => {
  if (!agendaData.value?.items?.length) return 0
  return agendaData.value.items.reduce((total, item) => total + item.duration, 0)
})

const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const formatTimeRange = (startSecond, duration) => {
  const startTime = formatTime(startSecond)
  const endTime = formatTime(startSecond + duration)
  return `${startTime} - ${endTime}`
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const fetchAgenda = async () => {
  loading.value = true
  error.value = false

  try {
    const response = await fetch('/api/agenda/id-demo-result')

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    agendaData.value = data
  } catch (err) {
    console.error('Failed to fetch agenda:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchAgenda()
})
</script>
