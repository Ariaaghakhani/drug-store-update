<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <!-- Name -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          for="fullName"
        >
          نام و نام خانوادگی
        </label>
        <input
          id="fullName"
          v-model="localForm.name"
          type="text"
          placeholder="نام و نام خانوادگی خود را وارد کنید"
          autocomplete="off"
          class="w-full px-4 h-14 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
          :class="{
            'border-gray-300 dark:border-gray-600': !localForm.errors.name,
            'border-red-500 dark:border-red-500': localForm.errors.name,
          }"
        />
        <p
          v-if="localForm.errors.name"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.name }}
        </p>
      </div>

      <!-- Password -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          رمز عبور
        </label>
        <div class="relative h-14">
          <input
            v-model="localForm.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="حداقل 8 کاراکتر"
            autocomplete="off"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600':
                !localForm.errors.password,
              'border-red-500 dark:border-red-500': localForm.errors.password,
            }"
          />
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
        <p
          v-if="localForm.errors.password"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.password }}
        </p>
      </div>

      <!-- Password Confirmation -->
      <div>
        <label
          class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
        >
          تکرار رمز عبور
        </label>
        <div class="relative h-14">
          <input
            v-model="localForm.passwordConfirm"
            :type="showPasswordConfirm ? 'text' : 'password'"
            placeholder="رمز عبور خود را دوباره وارد کنید"
            class="w-full h-full px-4 pl-12 text-lg border-2 rounded-2xl focus:ring-4 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            :class="{
              'border-gray-300 dark:border-gray-600':
                !localForm.errors.passwordConfirm,
              'border-red-500 dark:border-red-500':
                localForm.errors.passwordConfirm,
            }"
          />
          <button
            type="button"
            class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            @click="showPasswordConfirm = !showPasswordConfirm"
          >
            <UIcon
              :name="
                showPasswordConfirm
                  ? 'i-heroicons-eye-slash'
                  : 'i-heroicons-eye'
              "
              class="w-5 h-5"
            />
          </button>
        </div>
        <p
          v-if="localForm.errors.passwordConfirm"
          class="mt-1 text-sm text-red-600 dark:text-red-400"
        >
          {{ localForm.errors.passwordConfirm }}
        </p>
      </div>
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full py-4 px-6 text-lg font-semibold text-white rounded-2xl focus:ring-4 focus:ring-teal-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
      style="background: linear-gradient(135deg, #0d9488 0%, #06b6d4 100%)"
    >
      <span v-if="!loading">تکمیل ثبت‌نام</span>
      <span v-else class="flex items-center justify-center gap-2">
        <UIcon name="i-heroicons-arrow-path" class="w-5 h-5 animate-spin" />
        در حال ثبت‌نام...
      </span>
    </button>

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
import { validateRegisterForm } from '@/utils/validations.js'

const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:form', 'submit', 'goBack'])

const localForm = computed({
  get: () => props.form,
  set: (value) => emit('update:form', value),
})

const showPassword = ref(false)
const showPasswordConfirm = ref(false)

const handleSubmit = () => {
  const { isValid, errors } = validateRegisterForm(localForm.value)

  localForm.value.errors = errors

  if (isValid) {
    emit('submit')
  }
}
</script>
