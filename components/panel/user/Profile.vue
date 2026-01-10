<template>
  <UCard>
    <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-6">
      اطلاعات شخصی
    </h3>

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <div class="grid sm:grid-cols-2 gap-4">
        <UFormGroup label="نام" required>
          <UInput v-model="form.firstName" placeholder="نام خود را وارد کنید" />
        </UFormGroup>

        <UFormGroup label="نام خانوادگی" required>
          <UInput
            v-model="form.lastName"
            placeholder="نام خانوادگی خود را وارد کنید"
          />
        </UFormGroup>
      </div>

      <UFormGroup label="ایمیل">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="ایمیل خود را وارد کنید"
        />
      </UFormGroup>

      <UFormGroup label="شماره تماس">
        <UInput
          v-model="form.phone"
          placeholder="شماره تماس خود را وارد کنید"
          disabled
        />
      </UFormGroup>

      <div class="flex justify-end gap-3 pt-4">
        <UButton variant="soft" @click="$emit('reset')"> انصراف </UButton>
        <UButton type="submit" :loading="isLoading"> ذخیره تغییرات </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'submit', 'reset'])

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const handleSubmit = () => {
  emit('submit', form.value)
}
</script>
