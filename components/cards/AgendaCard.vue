<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900">Agenda</h3>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="flex items-center gap-3">
        <div class="w-6 h-6 bg-gray-100 rounded-full animate-pulse"></div>
        <div class="flex-1 h-4 bg-gray-100 rounded animate-pulse"></div>
      </div>
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="(item, index) in agenda.items"
        :key="index"
        class="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <div class="w-6 h-6 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
          {{ index + 1 }}
        </div>
        <div class="min-w-0 flex-1">
          <p class="font-medium text-gray-900 text-sm">{{ item.title }}</p>
          <p class="text-xs text-gray-500 mt-1">{{ item.duration }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  }
})

const agenda = ref({
  items: [
    { title: "Introduction and Setup", duration: "0:00 - 2:30" },
    { title: "Core Concepts Overview", duration: "2:30 - 8:15" },
    { title: "Practical Implementation", duration: "8:15 - 15:20" },
    { title: "Best Practices & Tips", duration: "15:20 - 20:45" },
    { title: "Q&A and Conclusion", duration: "20:45 - 25:00" }
  ]
})
</script>