<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- New Password -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          رمز عبور جدید
        </label>
        <div class="relative h-14">
          <input
            v-model="localForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="حداقل 8 کاراکتر"
            autocomplete="new-password"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600': !localForm.errors.password,
              'border-red-500 dark:border-red-500': localForm.errors.password
            }"
          >
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="showPassword = !showPassword"
          >
            <UIcon
              :name="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              class="w-5 h-5"
            />
          </button>
        </div>
        <div class="h-6 mt-1">
          <p v-if="localForm.errors.password" class="text-sm text-red-600 dark:text-red-400">
            {{ localForm.errors.password }}
          </p>
        </div>
      </div>

      <!-- Password Confirmation -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          تکرار رمز عبور
        </label>
        <div class="relative h-14">
          <input
            v-model="localForm.passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            placeholder="رمز عبور خود را دوباره وارد کنید"
            autocomplete="new-password"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600': !localForm.errors.passwordConfirm,
              'border-red-500 dark:border-red-500': localForm.errors.passwordConfirm
            }"
          >
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            <UIcon
              :name="showPasswordConfirm ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
              class="w-5 h-5"
            />
          </button>
        </div>
        <div class="h-6 mt-1">
          <p v-if="localForm.errors.passwordConfirm" class="text-sm text-red-600 dark:text-red-400">
            {{ localForm.errors.passwordConfirm }}
          </p>
        </div>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading || !localForm.password || !localForm.passwordConfirm"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">تایید و ورود</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        در حال بروزرسانی...
      </span>
    </button>

    <button
      type="button"
      class="w-full py-3 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      @click="emit('goBack')"
    >
      انصراف و بازگشت
    </button>
  </form>
</template>

<script setup>
const props = defineProps({
  form: {
    type: Object,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:form', 'submit', 'goBack'])

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value)
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const validateForm = () => {
  const errors = {
    password: '',
    passwordConfirm: ''
  }

  if (!localForm.value.password) {
    errors.password = 'رمز عبور الزامی است'
  } else if (localForm.value.password.length < 8) {
    errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد'
  }

  if (!localForm.value.passwordConfirm) {
    errors.passwordConfirm = 'تکرار رمز عبور الزامی است'
  } else if (localForm.value.password !== localForm.value.passwordConfirm) {
    errors.passwordConfirm = 'رمز عبور و تکرار آن یکسان نیستند'
  }

  localForm.value.errors = errors
  return !errors.password && !errors.passwordConfirm
}

const handleSubmit = () => {
  if (validateForm()) {
    emit('submit')
  }
}
</script>
