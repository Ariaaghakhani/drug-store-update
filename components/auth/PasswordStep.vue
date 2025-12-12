<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div>
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        رمز عبور
      </label>
      <div class="relative h-14">
        <input
          v-model="localPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="رمز عبور خود را وارد کنید"
          class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          :class="{
            'border-gray-300 dark:border-gray-600': !error,
            'border-red-500 dark:border-red-500': error,
          }"
        />
        <button
          type="button"
          class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 flex justify-center items-center"
          @click="showPassword = !showPassword"
        >
          <UIcon
            :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            class="w-5 h-5"
          />
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm text-red-600 dark:text-red-400">
        {{ error }}
      </p>
    </div>

    <button
      type="submit"
      :disabled="loading || !localPassword"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">ورود</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        در حال بررسی...
      </span>
    </button>

    <div class="flex items-center justify-between gap-4 pt-2">
      <button
        type="button"
        class="flex-1 py-3 px-4 text-sm font-medium text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/20 rounded-xl hover:bg-teal-100 dark:hover:bg-teal-900/30 transition-colors"
        @click="emit('switchToOtp')"
      >
        ورود با پیامک
      </button>
      <button
        type="button"
        class="flex-1 py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        @click="emit('forgotPassword')"
      >
        فراموشی رمز عبور
      </button>
    </div>

    <button
      type="button"
      class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      @click="emit('goBack')"
    >
      بازگشت و ویرایش شماره
    </button>
  </form>
</template>

<script setup>
const props = defineProps({
  password: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits([
  'update:password',
  'update:error',
  'submit',
  'switchToOtp',
  'forgotPassword',
  'goBack',
])

const localPassword = computed({
  get: () => props.password,
  set: (value) => {
    emit('update:password', value)
    emit('update:error', '')
  },
})

const showPassword = ref(false)

const handleSubmit = () => {
  if (localPassword.value) {
    emit('submit')
  }
}
</script>
