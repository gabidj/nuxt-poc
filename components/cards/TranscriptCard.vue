<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 lg:col-span-3">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Transcript</h3>
      </div>

      <button
        v-if="!loading"
        class="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
        @click="showFullTranscript = !showFullTranscript"
      >
        {{ showFullTranscript ? 'Show Less' : 'Show More' }}
      </button>
    </div>

    <div v-if="loading" class="space-y-4">
      <div v-for="i in 4" :key="i" class="space-y-2">
        <div class="w-16 h-3 bg-gray-100 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-100 rounded animate-pulse"></div>
        <div class="h-4 bg-gray-100 rounded animate-pulse w-4/5"></div>
      </div>
    </div>

    <div v-else class="space-y-6">
      <div 
        class="space-y-6 overflow-hidden transition-all duration-300"
        :class="showFullTranscript ? 'max-h-none' : 'max-h-80'"
      >
        <div
          v-for="segment in transcript.segments"
          :key="segment.timestamp"
          class="group"
        >
          <div class="flex items-center gap-2 mb-2">
            <span class="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-1 rounded">
              {{ segment.timestamp }}
            </span>
            <span class="text-xs text-gray-500">{{ segment.speaker }}</span>
          </div>
          <p class="text-gray-700 leading-relaxed text-sm pl-4 border-l-2 border-gray-100 group-hover:border-gray-200 transition-colors">
            {{ segment.text }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
        <span>{{ transcript.totalDuration }} duration</span>
        <span>{{ transcript.wordCount }} words</span>
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

const showFullTranscript = ref(false)

const transcript = ref({
  totalDuration: "25:30",
  wordCount: "3,247",
  segments: [
    {
      timestamp: "00:00",
      speaker: "Presenter",
      text: "Welcome to this comprehensive guide on modern web development practices. Today we'll be exploring the latest trends and techniques that are shaping the industry."
    },
    {
      timestamp: "00:45",
      speaker: "Presenter",
      text: "Let's start by understanding the fundamental principles of component-based architecture and how it revolutionizes the way we build user interfaces."
    },
    {
      timestamp: "02:30",
      speaker: "Presenter",
      text: "Component reusability is one of the key benefits we get from modern frameworks like Vue, React, and Angular. By breaking down our UI into smaller, manageable pieces, we can..."
    },
    {
      timestamp: "05:15",
      speaker: "Presenter",
      text: "Now let's dive into state management. Proper state management is crucial for building scalable applications that can handle complex data flows and user interactions."
    },
    {
      timestamp: "08:20",
      speaker: "Presenter",
      text: "Performance optimization should be a priority from day one. We'll look at techniques like code splitting, lazy loading, and how to measure and improve your application's performance."
    }
  ]
})
</script>