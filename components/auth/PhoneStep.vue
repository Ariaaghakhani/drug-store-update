<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="relative mb-12">
      <label
        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        for="username"
      >
        شماره موبایل
      </label>

      <div class="relative">
        <input
          id="username"
          v-model="localPhone"
          type="tel"
          placeholder="09xxxxxxxxx"
          maxlength="11"
          class="w-full px-4 pr-12 h-14 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          :class="{
            'border-gray-300 dark:border-gray-600': !error,
            'border-red-500 dark:border-red-500': error,
          }"
          @input="handleInput"
        />

        <div
          class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 flex justify-center items-center"
        >
          <UIcon name="i-heroicons-device-phone-mobile" class="w-5 h-5" />
        </div>
      </div>

      <div class="absolute left-0 right-0 mt-1">
        <Transition name="fade">
          <p
            v-if="error"
            class="text-sm text-red-600 dark:text-red-400 absolute"
          >
            {{ error }}
          </p>
        </Transition>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading || !isValid"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">ادامه</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        در حال بررسی...
      </span>
    </button>

    <p class="text-sm text-center text-gray-600 dark:text-gray-400">
      ورود شما به معنای پذیرش
      <NuxtLink
        to="/terms"
        class="text-teal-600 dark:text-teal-400 hover:underline"
      >
        شرایط و قوانین
      </NuxtLink>
      داروپلاس است.
    </p>
  </form>
</template>

<script setup>
import { validatePhoneNumber, isValidPhoneNumber } from '@/utils/validations.js'

const props = defineProps({
  phoneNumber: {
    type: String,
    default: '',
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:phoneNumber', 'submit'])

const localPhone = computed({
  get: () => props.phoneNumber,
  set: (value) => emit('update:phoneNumber', value),
})

const error = ref('')

const isValid = computed(() => isValidPhoneNumber(localPhone.value))

const handleInput = () => {
  error.value = validatePhoneNumber(localPhone.value)
}

const handleSubmit = () => {
  handleInput()
  if (isValid.value) {
    emit('submit')
  }
}
</script>
