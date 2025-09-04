<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 fade-in">
    <div class="flex items-center mb-4">
      <div class="p-2 bg-accent-100 rounded-lg mr-3">
        <svg class="h-5 w-5 text-accent-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-1l-4 4z" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">Quick Overview</h3>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-200 rounded card-loading"/>
      <div class="h-4 bg-gray-200 rounded card-loading w-2/3"/>
    </div>

    <div v-else>
      <p class="text-gray-700 leading-relaxed">{{ description.content }}</p>
      <div class="mt-4 flex flex-wrap gap-2">
        <span
          v-for="tag in description.tags"
          :key="tag"
          class="px-3 py-1 bg-accent-100 text-accent-700 rounded-full text-sm font-medium"
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
