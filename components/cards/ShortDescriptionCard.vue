<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900">Overview</h3>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-2/3"></div>
    </div>

    <div v-else class="space-y-4">
      <p class="text-gray-700 leading-relaxed text-sm">{{ description.content }}</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in description.tags"
          :key="tag"
          class="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
        >
          {{ tag }}
        </span>
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

const description = ref({
  content: "A focused presentation covering the fundamentals of modern web development with practical examples and real-world applications.",
  tags: ['Web Development', 'UI/UX', 'Best Practices', 'Tutorial']
})
</script>