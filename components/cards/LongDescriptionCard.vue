<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 md:col-span-2">
    <div class="flex items-center gap-3 mb-6">
      <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
        <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="font-semibold text-gray-900">Detailed Description</h3>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-4/5"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
      <div class="h-4 bg-gray-100 rounded animate-pulse w-3/4"></div>
    </div>

    <div v-else class="space-y-6">
      <p class="text-gray-700 leading-relaxed text-sm">{{ description.content }}</p>

      <div>
        <h4 class="font-medium text-gray-900 mb-3 text-sm">Key Topics Covered</h4>
        <ul class="space-y-2">
          <li 
            v-for="topic in description.topics" 
            :key="topic"
            class="flex items-start gap-2 text-sm text-gray-600"
          >
            <div class="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
            {{ topic }}
          </li>
        </ul>
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
  content: "This comprehensive video tutorial delves deep into modern web development practices, providing viewers with practical knowledge and hands-on examples. The content is structured to take learners from fundamental concepts to advanced implementations, ensuring a thorough understanding of contemporary development workflows and methodologies.",
  topics: [
    "Component-based architecture and reusability",
    "State management and data flow patterns",
    "Performance optimization and lazy loading",
    "Responsive design and mobile-first approach",
    "Accessibility standards and inclusive design",
    "Testing strategies and quality assurance"
  ]
})
</script>