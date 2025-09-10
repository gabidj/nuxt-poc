<!-- Nuxt + Vue VideoUpload component with chunked upload support -->
<template>
  <div class="max-w-2xl mx-auto">
    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div class="flex items-center">
        <svg class="w-5 h-5 text-red-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-red-800 font-medium">{{ error }}</p>
      </div>
    </div>

    <!-- Upload Area -->
    <div
      class="relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 ease-in-out"
      :class="uploadAreaClasses"
      @drop="handleDrop"
      @dragover.prevent="handleDragOver"
      @dragleave="handleDragLeave"
      @dragenter.prevent
    >
      <!-- Upload State -->
      <div v-if="!isProcessing && !uploadedFile" class="space-y-4">
        <!-- Upload Icon -->
        <div class="flex justify-center">
          <div class="p-3 bg-primary-100 rounded-full">
            <svg class="w-8 h-8 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Upload your video</h3>
          <p class="text-gray-600 mb-6">Drag and drop your video here, or click to browse</p>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept="video/*"
          class="hidden"
          @change="handleFileSelect"
        >

        <button
          class="inline-flex items-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-105"
          @click="$refs.fileInput.click()"
        >
          <svg class="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Choose Video
        </button>

        <p class="text-sm text-gray-500 mt-4">
          {{ acceptedTypesText }}
        </p>
      </div>

      <!-- Processing State -->
      <div v-else-if="isProcessing" class="space-y-6">
        <div class="flex justify-center">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"/>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="w-8 h-8 bg-primary-600 rounded-full opacity-20"/>
            </div>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Uploading Video...</h3>
          <p class="text-gray-600 mb-4">
            {{ uploadStatus || 'Please wait while we upload your video' }}
          </p>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: progress + '%' }"
            />
          </div>

          <p class="text-sm text-gray-500">{{ Math.round(progress) }}% complete</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="uploadedFile && uploadResult" class="space-y-4">
        <div class="flex justify-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Upload Complete!</h3>
          <p class="text-gray-600 mb-2">{{ uploadedFile.name }}</p>
          <p class="text-sm text-gray-500 mb-2">{{ formatFileSize(uploadedFile.size) }}</p>
          <p class="text-sm text-primary-600">UUID: {{ uploadResult.uuid }}</p>
          <p class="text-sm text-gray-500">Path: {{ uploadResult.path }}</p>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            @click="router.push(`/step2?file=${uploadResult.uuid}`)"
          >
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
            Continue to Step 2
          </button>
        </div>

        <button
          class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          @click="resetUpload"
        >
          Upload Another
        </button>
      </div>
    </div>

    <!-- Video Preview -->
    <div v-if="uploadedFile && isVideoFile(uploadedFile) && filePreview" class="mt-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <h4 class="text-lg font-medium text-gray-900 mb-3">Video Preview</h4>
        <video
          :src="filePreview"
          controls
          class="max-w-full h-auto rounded-lg shadow-sm"
          style="max-height: 400px;"
        >
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Reactive data
const isDragOver = ref(false)
const uploadedFile = ref(null)
const filePreview = ref(null)
const progress = ref(0)
const isProcessing = ref(false)
const uploadResult = ref(null)
const error = ref(null)
const uploadStatus = ref('')
const currentChunk = ref(0)
const totalChunks = ref(0)

// Constants
const maxFileSize = 5 * 1024 * 1024 * 1024 // 5GB
const chunkSize = 10 * 1024 * 1024 // 10MB chunks
const acceptedTypes = 'video/*'

// Computed properties
const uploadAreaClasses = computed(() => ({
  'border-gray-300 hover:border-primary-400 hover:bg-primary-50/50': !isDragOver.value && !isProcessing.value && !uploadedFile.value,
  'border-primary-500 bg-primary-50': isDragOver.value,
  'border-green-300 bg-green-50': uploadedFile.value && !isProcessing.value,
  'border-primary-400 bg-primary-50': isProcessing.value
}))

const acceptedTypesText = computed(() => {
  return 'Videos supported (MP4, MOV, AVI, WebM, etc.) - Max 5GB'
})

// Methods
const handleDragOver = () => {
  isDragOver.value = true
}

const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false
  }
}

const handleDrop = (event) => {
  event.preventDefault()
  isDragOver.value = false

  const files = event.dataTransfer.files
  if (files.length > 0) {
    handleFiles(files)
  }
}

const handleFileSelect = (event) => {
  const files = event.target.files
  if (files.length > 0) {
    handleFiles(files)
  }
}

const handleFiles = async (files) => {
  const file = files[0]
  error.value = null

  // Validate file type
  if (!file.type.startsWith('video/')) {
    error.value = 'Only video files are allowed'
    return
  }

  // Validate file size
  if (file.size > maxFileSize) {
    error.value = `File size exceeds ${formatFileSize(maxFileSize)} limit`
    return
  }

  uploadedFile.value = file
  isProcessing.value = true
  progress.value = 0
  uploadStatus.value = 'Preparing upload...'

  // Create video preview
  if (isVideoFile(file)) {
    const videoUrl = URL.createObjectURL(file)
    filePreview.value = videoUrl
  }

  try {
    await uploadFileInChunks(file)
  } catch (err) {
    error.value = err.message || 'Upload failed'
    isProcessing.value = false
    uploadStatus.value = ''
  }
}

const uploadFileInChunks = async (file) => {
  const chunks = Math.ceil(file.size / chunkSize)
  totalChunks.value = chunks

  try {
    // Initialize upload session
    uploadStatus.value = 'Initializing upload...'
    const initResponse = await $fetch('/api/upload/init', {
      method: 'POST',
      body: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        totalChunks: chunks
      }
    })

    const { uploadId, uuid } = initResponse

    // Upload chunks
    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
      currentChunk.value = chunkIndex + 1
      uploadStatus.value = `Uploading chunk ${chunkIndex + 1} of ${chunks}...`

      const start = chunkIndex * chunkSize
      const end = Math.min(start + chunkSize, file.size)
      const chunk = file.slice(start, end)

      const formData = new FormData()
      formData.append('chunk', chunk)
      formData.append('uploadId', uploadId)
      formData.append('chunkIndex', chunkIndex.toString())
      formData.append('totalChunks', chunks.toString())

      await $fetch('/api/upload/chunk', {
        method: 'POST',
        body: formData
      })

      // Update progress
      progress.value = ((chunkIndex + 1) / chunks) * 90 // Reserve 10% for finalization
    }

    // Finalize upload
    uploadStatus.value = 'Finalizing upload...'
    const finalResponse = await $fetch('/api/upload/finalize', {
      method: 'POST',
      body: {
        uploadId,
        uuid
      }
    })

    progress.value = 100
    uploadResult.value = finalResponse
    isProcessing.value = false
    uploadStatus.value = ''

    console.log('Upload successful:', finalResponse)
  } catch (err) {
    console.error('Chunked upload error:', err)
    throw err
  }
}

const resetUpload = () => {
  uploadedFile.value = null
  filePreview.value = null
  progress.value = 0
  uploadResult.value = null
  error.value = null
  uploadStatus.value = ''
  currentChunk.value = 0
  totalChunks.value = 0

  // Clear file input
  const fileInput = document.querySelector('input[type="file"]')
  if (fileInput) {
    fileInput.value = ''
  }
}

const isVideoFile = (file) => {
  return file && file.type.startsWith('video/')
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
/* Add any custom styles here if needed */
/* Tailwind classes handle most styling */
</style>
