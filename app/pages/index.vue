<template>
  <div class="container mx-auto px-4 py-8 max-w-7xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">
        Video Analysis Platform
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        Upload your video and get instant insights with AI-powered analysis
      </p>
    </div>

    <VideoUpload
      :is-processing="isProcessing"
      @video-uploaded="handleVideoUpload"
    />

    <div v-if="showCards" class="mt-12">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ScreenshotCard :loading="cardsLoading" />
        <SummaryCard :loading="cardsLoading" />
        <ShortDescriptionCard :loading="cardsLoading" />
        <LongDescriptionCard :loading="cardsLoading" />
        <AgendaCard :loading="cardsLoading" />
        <TranscriptCard :loading="cardsLoading" />
      </div>
    </div>
  </div>
</template>

<script setup>
const processVideo = async (file) => {
  // Simulate video processing delay
  return new Promise((resolve) => setTimeout(resolve, 200))
}

const isProcessing = ref(false)
const showCards = ref(false)
const cardsLoading = ref(true)

const handleVideoUpload = async (file) => {
  isProcessing.value = true
  showCards.value = false
  cardsLoading.value = true

  try {
    await processVideo(file)
    showCards.value = true

    // Minimum loading time of 200ms for each card
    setTimeout(() => {
      cardsLoading.value = false
    }, 200)
  } finally {
    isProcessing.value = false
  }
}
</script>
