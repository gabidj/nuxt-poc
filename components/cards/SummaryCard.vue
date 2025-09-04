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
      <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-1/2"></div>
    </div>

    <div v-else class="space-y-4">
      <p class="text-gray-700 leading-relaxed text-sm">{{ summary.content }}</p>
      <div class="flex items-center gap-1 text-xs text-gray-500">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {{ summary.readTime }} min read
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

const summary = ref({
  content: "This video presents a comprehensive overview of modern web development practices, focusing on component-based architecture and user experience design. The presentation covers key concepts including responsive design principles, performance optimization techniques, and accessibility best practices that are essential for creating successful web applications.",
  readTime: 2
})
</script>