<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 fade-in">
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center">
        <div class="p-2 bg-accent-100 rounded-lg mr-3">
          <svg class="h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900">Quick Overview</h3>
      </div>

      <button
        v-if="!loading && infoData && infoData.shortDescription?.length > 1"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        @click="showFullOverview = !showFullOverview"
      >
        {{ showFullOverview ? 'Show Less' : 'Show More' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-200 rounded card-loading"/>
      <div class="h-4 bg-gray-200 rounded card-loading w-2/3"/>
      <div class="h-4 bg-gray-200 rounded card-loading w-3/4"/>
    </div>

    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600 mb-2">Failed to load overview</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchInfo"
      >
        Try Again
      </button>
    </div>

    <div v-else-if="infoData?.shortDescription" class="space-y-4">
      <div
        class="space-y-3 overflow-hidden transition-all duration-300"
        :class="showFullOverview ? 'max-h-none' : 'max-h-32'"
      >
        <p
          v-for="(paragraph, index) in displayedDescription"
          :key="index"
          class="text-gray-700 leading-relaxed"
        >
          {{ paragraph }}
        </p>
      </div>

      <div class="pt-3 border-t border-gray-100 text-xs text-gray-500">
        <span>{{ infoData.shortDescription.length }} key points</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const showFullOverview = ref(false)
const loading = ref(true)
const error = ref(false)
const infoData = ref(null)

const displayedDescription = computed(() => {
  if (!infoData.value?.shortDescription) return []
  return showFullOverview.value
    ? infoData.value.shortDescription
    : infoData.value.shortDescription.slice(0, 1)
})

const fetchInfo = async () => {
  loading.value = true
  error.value = false

  const id = useRoute().query?.file

  try {
    const response = await fetch(`/api/result/${id}/details`)

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
