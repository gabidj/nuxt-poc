<template>
  <div class="bg-white border border-gray-100 rounded-xl p-6 md:col-span-2">
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <div class="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
          <svg class="w-4 h-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="font-semibold text-gray-900">Knowledge Quiz</h3>
      </div>

      <div v-if="!loading && !error && quizData" class="text-sm text-gray-500">
        {{ quizData.quiz.length }} questions
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <div class="h-6 bg-gray-100 rounded animate-pulse"/>
      <div class="space-y-2">
        <div class="h-4 bg-gray-100 rounded animate-pulse"/>
        <div class="h-4 bg-gray-100 rounded animate-pulse"/>
        <div class="h-4 bg-gray-100 rounded animate-pulse"/>
        <div class="h-4 bg-gray-100 rounded animate-pulse"/>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-8">
      <div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center mx-auto mb-4">
        <svg class="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p class="text-red-600 mb-2">Failed to load quiz</p>
      <button
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
        @click="fetchQuiz"
      >
        Try Again
      </button>
    </div>

    <!-- Quiz Content -->
    <div v-else-if="quizData && !quizCompleted" class="space-y-6">
      <!-- Progress Bar -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div
          class="bg-indigo-600 h-2 rounded-full transition-all duration-300"
          :style="{ width: `${(currentQuestionIndex / quizData.quiz.length) * 100}%` }"
        />
      </div>

      <!-- Question Counter -->
      <div class="text-sm text-gray-500 text-center">
        Question {{ currentQuestionIndex + 1 }} of {{ quizData.quiz.length }}
      </div>

      <!-- Current Question -->
      <div class="space-y-4">
        <h4 class="text-lg font-medium text-gray-900 leading-relaxed">
          {{ currentQuestion.question }}
        </h4>

        <!-- Answer Options -->
        <div class="space-y-3">
          <button
            v-for="(option, index) in currentQuestion.options"
            :key="index"
            class="w-full text-left p-4 rounded-lg border transition-all duration-200"
            :class="getOptionClasses(index)"
            :disabled="selectedAnswer !== null"
            @click="selectAnswer(index)"
          >
            <div class="flex items-center justify-between">
              <span class="text-sm">{{ option }}</span>
              <div v-if="selectedAnswer !== null" class="flex-shrink-0 ml-3">
                <svg
                  v-if="index === currentQuestion.correct_answer_index"
                  class="w-5 h-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                <svg
                  v-else-if="index === selectedAnswer && index !== currentQuestion.correct_answer_index"
                  class="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </button>
        </div>

        <!-- Next Button -->
        <div v-if="selectedAnswer !== null" class="flex justify-center pt-4">
          <button
            class="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            @click="nextQuestion"
          >
            {{ currentQuestionIndex === quizData.quiz.length - 1 ? 'Finish Quiz' : 'Next Question' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Quiz Results -->
    <div v-else-if="quizCompleted" class="text-center space-y-6">
      <div
        class="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
        :class="scorePercentage >= 70 ? 'bg-green-50' : 'bg-yellow-50'">
        <svg v-if="scorePercentage >= 70" class="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <svg v-else class="w-8 h-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <div>
        <h4 class="text-xl font-semibold text-gray-900 mb-2">Quiz Complete!</h4>
        <p class="text-gray-600 mb-4">
          You scored {{ correctAnswers }} out of {{ quizData.quiz.length }} questions
        </p>
        <div
          class="text-3xl font-bold mb-2"
          :class="scorePercentage >= 70 ? 'text-green-600' : 'text-yellow-600'">
          {{ scorePercentage }}%
        </div>
        <p class="text-sm text-gray-500">
          {{ scorePercentage >= 70 ? 'Great job!' : 'Keep learning!' }}
        </p>
      </div>

      <!-- Re-take Quiz Button -->
      <button
        class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        @click="retakeQuiz"
      >
        Re-take Quiz
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Reactive data
const loading = ref(true)
const error = ref(false)
const quizData = ref(null)
const currentQuestionIndex = ref(0)
const selectedAnswer = ref(null)
const userAnswers = ref([])
const quizCompleted = ref(false)

// Computed properties
const currentQuestion = computed(() => {
  if (!quizData.value || !quizData.value.quiz) return null
  return quizData.value.quiz[currentQuestionIndex.value]
})

const correctAnswers = computed(() => {
  if (!quizData.value) return 0
  return userAnswers.value.filter((answer, index) =>
    answer === quizData.value.quiz[index].correct_answer_index
  ).length
})

const scorePercentage = computed(() => {
  if (!quizData.value) return 0
  return Math.round((correctAnswers.value / quizData.value.quiz.length) * 100)
})

// Methods
const getOptionClasses = (index) => {
  if (selectedAnswer.value === null) {
    return 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 cursor-pointer'
  }

  if (index === currentQuestion.value.correct_answer_index) {
    return 'border-green-300 bg-green-50 text-green-800'
  }

  if (index === selectedAnswer.value && index !== currentQuestion.value.correct_answer_index) {
    return 'border-red-300 bg-red-50 text-red-800'
  }

  return 'border-gray-200 bg-gray-50 text-gray-500'
}

const selectAnswer = (index) => {
  if (selectedAnswer.value !== null) return
  selectedAnswer.value = index
}

const nextQuestion = () => {
  // Store the user's answer
  userAnswers.value[currentQuestionIndex.value] = selectedAnswer.value

  if (currentQuestionIndex.value === quizData.value.quiz.length - 1) {
    // Quiz completed
    quizCompleted.value = true
  } else {
    // Move to next question
    currentQuestionIndex.value++
    selectedAnswer.value = null
  }
}

const retakeQuiz = () => {
  currentQuestionIndex.value = 0
  selectedAnswer.value = null
  userAnswers.value = []
  quizCompleted.value = false
}

const fetchQuiz = async () => {
  loading.value = true
  error.value = false

  try {
    const id = useRoute().query?.file

    if (!id) {
      throw new Error('No file ID found in route parameters')
    }

    const response = await fetch(`/api/result/${id}/quiz`)

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    quizData.value = data
  } catch (err) {
    console.error('Failed to fetch quiz:', err)
    error.value = true
  } finally {
    loading.value = false
  }
}

// Lifecycle
onMounted(() => {
  fetchQuiz()
})
</script>
