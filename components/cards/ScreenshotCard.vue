<template>
  <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 fade-in md:col-span-2">
    <div class="flex items-center mb-4">
      <div class="p-2 bg-purple-100 rounded-lg mr-3">
        <svg class="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 class="text-lg font-semibold text-gray-900">Detailed Description</h3>
    </div>

    <div v-if="loading" class="space-y-3">
      <div class="h-4 bg-gray-200 rounded card-loading"/>
      <div class="h-4 bg-gray-200 rounded card-loading"/>
      <div class="h-4 bg-gray-200 rounded card-loading w-4/5"/>
      <div class="h-4 bg-gray-200 rounded card-loading"/>
      <div class="h-4 bg-gray-200 rounded card-loading w-3/4"/>
    </div>

    <div v-else class="prose prose-gray max-w-none">
      <p>{{ description.content }}</p>
      <h4>Key Topics Covered:</h4>
      <ul>
        <li v-for="topic in description.topics" :key="topic">{{ topic }}</li>
      </ul>
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
