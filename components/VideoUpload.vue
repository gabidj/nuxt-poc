<template>
  <div class="max-w-2xl mx-auto">
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
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Upload your files</h3>
          <p class="text-gray-600 mb-6">Drag and drop your files here, or click to browse</p>
        </div>

        <input
          ref="fileInput"
          type="file"
          :accept="acceptedTypes"
          :multiple="allowMultiple"
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
          Choose Files
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
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Processing Files...</h3>
          <p class="text-gray-600 mb-4">Please wait while we process your upload</p>

          <!-- Progress Bar -->
          <div class="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              class="bg-primary-600 h-2 rounded-full transition-all duration-300 ease-out"
              :style="{ width: progress + '%' }"
            />
          </div>

          <p class="text-sm text-gray-500">{{ progress }}% complete</p>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="uploadedFile" class="space-y-4">
        <div class="flex justify-center">
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Upload Complete!</h3>
          <p class="text-gray-600 mb-4">{{ uploadedFile.name }}</p>
          <p class="text-sm text-gray-500">{{ formatFileSize(uploadedFile.size) }}</p>
        </div>

        <button
          class="inline-flex items-center px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          @click="resetUpload"
        >
          Upload Another
        </button>
      </div>
    </div>

    <!-- File Preview (if applicable) -->
    <div v-if="uploadedFile && isImageFile(uploadedFile)" class="mt-6">
      <div class="bg-white rounded-lg shadow-sm border p-4">
        <h4 class="text-lg font-medium text-gray-900 mb-3">Preview</h4>
        <img
          :src="filePreview"
          :alt="uploadedFile.name"
          class="max-w-full h-auto rounded-lg shadow-sm"
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const props = defineProps({
  isProcessing: { type: Boolean, default: false },
  acceptedTypes: { type: String, default: "*" },
  allowMultiple: { type: Boolean, default: false },
  maxFileSize: { type: Number, default: 10 * 1024 * 1024 },
});

const emit = defineEmits(["file-uploaded", "upload-progress"]);

const isDragOver = ref(false);
const uploadedFile = ref(null);
const filePreview = ref(null);
const progress = ref(0);

const uploadAreaClasses = computed(() => ({
  "border-gray-300 hover:border-primary-400 hover:bg-primary-50/50":
    !isDragOver.value && !props.isProcessing,
  "border-primary-500 bg-primary-50": isDragOver.value,
  "border-green-300 bg-green-50":
    uploadedFile.value && !props.isProcessing,
  "border-primary-400 bg-primary-50": props.isProcessing,
}));

const acceptedTypesText = computed(() => {
  if (props.acceptedTypes === "*") return "All file types supported";
  if (props.acceptedTypes.includes("image"))
    return "Images supported (JPG, PNG, GIF, etc.)";
  if (props.acceptedTypes.includes("video"))
    return "Videos supported (MP4, MOV, AVI, etc.)";
  return `Supported types: ${props.acceptedTypes}`;
});

const handleDragOver = () => {
  isDragOver.value = true;
};

const handleDragLeave = (event) => {
  if (!event.currentTarget.contains(event.relatedTarget)) {
    isDragOver.value = false;
  }
};

const handleDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) handleFiles(files);
};

const handleFileSelect = (event) => {
  const files = event.target.files;
  if (files.length > 0) handleFiles(files);
};

const handleFiles = (files) => {
  const file = files[0];

  if (file.size > props.maxFileSize) {
    alert(`File size exceeds ${formatFileSize(props.maxFileSize)} limit`);
    return;
  }

  uploadedFile.value = file;

  if (isImageFile(file)) {
    const reader = new FileReader();
    reader.onload = (e) => (filePreview.value = e.target.result);
    reader.readAsDataURL(file);
  }

  emit("file-uploaded", file);
  simulateProgress();
};

const simulateProgress = () => {
  progress.value = 0;
  const interval = setInterval(() => {
    progress.value += Math.random() * 15;
    if (progress.value >= 100) {
      progress.value = 100;
      clearInterval(interval);
    }
    emit("upload-progress", progress.value);
  }, 200);
};

const resetUpload = () => {
  uploadedFile.value = null;
  filePreview.value = null;
  progress.value = 0;
};

const isImageFile = (file) => file && file.type.startsWith("image/");

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
</script>

<style scoped>
/* Tailwind handles most of the styles */
</style>
