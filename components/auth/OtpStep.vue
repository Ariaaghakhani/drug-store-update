<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        کد تایید
      </label>
      <div class="flex gap-3 justify-center h-14" dir="ltr">
        <input
          v-for="(digit, index) in localDigits"
          :key="index"
          :ref="(el) => setInputRef(el, index)"
          v-model="localDigits[index]"
          type="tel"
          maxlength="1"
          class="w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          :class="{
            'border-gray-300 dark:border-gray-600': !error,
            'border-red-500 dark:border-red-500': error,
          }"
          @input="handleInput(index, $event)"
          @keydown="handleKeydown(index, $event)"
          @paste="handlePaste"
        />
      </div>
      <p
        v-if="error"
        class="mt-2 text-sm text-center text-red-600 dark:text-red-400"
      >
        {{ error }}
      </p>
    </div>

    <button
      type="submit"
      :disabled="loading || !isValid"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">{{ submitButtonText }}</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        {{ loadingText }}
      </span>
    </button>

    <div class="flex items-center justify-between gap-4 pt-2">
      <div class="flex-1 text-center">
        <p v-if="timer > 0" class="text-sm text-gray-600 dark:text-gray-400">
          ارسال مجدد کد تا {{ timer }} ثانیه دیگر
        </p>
        <button
          v-else
          type="button"
          :disabled="loading"
          class="text-sm text-teal-600 dark:text-teal-400 hover:underline disabled:opacity-50"
          @click="emit('resend')"
        >
          ارسال مجدد کد تایید
        </button>
      </div>

      <!-- Only show "Switch to Password" for login context -->
      <button
        v-if="context === 'login'"
        type="button"
        class="flex-1 py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
        @click="emit('switchToPassword')"
      >
        ورود با رمز عبور
      </button>
    </div>

    <button
      type="button"
      class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      @click="emit('goBack')"
    >
      {{ backButtonText }}
    </button>
  </form>
</template>

<script setup>
const props = defineProps({
  digits: {
    type: Array,
    default: () => ['', '', '', '', ''],
  },
  error: {
    type: String,
    default: '',
  },
  timer: {
    type: Number,
    default: 0,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  context: {
    type: String,
    default: 'login', // 'login' | 'register'
    validator: (value) => ['login', 'register'].includes(value),
  },
})

const emit = defineEmits([
  'update:digits',
  'update:error',
  'submit',
  'resend',
  'switchToPassword',
  'goBack',
])

const localDigits = computed({
  get: () => props.digits,
  set: (value) => emit('update:digits', value),
})

const inputRefs = ref([])

const setInputRef = (el, index) => {
  if (el) inputRefs.value[index] = el
}

const isValid = computed(() => localDigits.value.every((digit) => digit !== ''))

const submitButtonText = computed(() => {
  if (props.context === 'register') return 'تایید و ادامه'
  if (props.context === 'forgot-password') return 'تایید'
  return 'تایید و ورود'
})

const loadingText = computed(() => {
  return props.context === 'register' ? 'در حال تایید...' : 'در حال بررسی...'
})

const backButtonText = computed(() => {
  return props.context === 'register'
    ? 'بازگشت به ثبت‌نام'
    : 'بازگشت و ویرایش شماره'
})

const handleInput = (index, event) => {
  const value = event.target.value

  if (value && !/^\d$/.test(value)) {
    localDigits.value[index] = ''
    return
  }

  localDigits.value[index] = value
  emit('update:error', '')

  if (value && index < props.digits.length - 1) {
    nextTick(() => {
      inputRefs.value[index + 1]?.focus()
    })
  }

  // Auto-submit when all digits are filled
  if (isValid.value) {
    nextTick(() => {
      emit('submit')
    })
  }
}

const handleKeydown = (index, event) => {
  if (event.key === 'Backspace' && !localDigits.value[index] && index > 0) {
    nextTick(() => {
      inputRefs.value[index - 1]?.focus()
    })
  }
}

const handlePaste = (event) => {
  event.preventDefault()
  const pastedData = event.clipboardData.getData('text').trim()
  const expectedLength = props.digits.length

  if (new RegExp(`^\\d{${expectedLength}}$`).test(pastedData)) {
    const newDigits = pastedData.split('')
    emit('update:digits', newDigits)

    nextTick(() => {
      inputRefs.value[expectedLength - 1]?.focus()
      if (isValid.value) {
        emit('submit')
      }
    })
  }
}

const handleSubmit = () => {
  if (isValid.value) {
    emit('submit')
  }
}

// Focus first input on mount
onMounted(() => {
  inputRefs.value[0]?.focus()
})

// Expose focus method for parent component
defineExpose({
  focusFirst: () => inputRefs.value[0]?.focus(),
})
</script>
