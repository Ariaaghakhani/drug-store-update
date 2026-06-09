<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <UIcon name="i-heroicons-user" class="w-4 h-4 text-brand-500 flex-shrink-0" />
        <h3 class="text-sm font-medium text-gray-900 dark:text-white">اطلاعات شخصی</h3>
      </div>
      <UButton variant="soft" color="neutral" size="lg" icon="i-heroicons-pencil-square" @click="emit('edit')">
        ویرایش
      </UButton>
    </div>

    <div class="divide-y divide-gray-100 dark:divide-gray-800">
      <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', form.firstName || form.lastName ? 'bg-brand-500/15' : 'bg-warning/10']">
          <UIcon name="i-heroicons-user-circle" :class="['w-5 h-5', form.firstName || form.lastName ? 'text-brand-500' : 'text-warning']" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">نام و نام خانوادگی</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
            {{ form.firstName || form.lastName ? `${form.firstName} ${form.lastName}`.trim() : 'تعیین نشده' }}
          </p>
        </div>
      </div>

      <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', form.nationalId ? 'bg-brand-500/15' : 'bg-warning/10']">
          <UIcon name="i-heroicons-identification" :class="['w-5 h-5', form.nationalId ? 'text-brand-500' : 'text-warning']" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">کد ملی</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{{ form.nationalId || 'تعیین نشده' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', form.birthDate ? 'bg-brand-500/15' : 'bg-warning/10']">
          <UIcon name="i-heroicons-calendar-days" :class="['w-5 h-5', form.birthDate ? 'text-brand-500' : 'text-warning']" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">تاریخ تولد</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{{ form.birthDate || 'تعیین نشده' }}</p>
        </div>
      </div>

      <div class="flex items-center gap-3 px-4 sm:px-6 py-4">
        <div :class="['w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0', form.gender && form.gender !== 'unspecified' ? 'bg-brand-500/15' : 'bg-warning/10']">
          <UIcon name="i-heroicons-user" :class="['w-5 h-5', form.gender && form.gender !== 'unspecified' ? 'text-brand-500' : 'text-warning']" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[11px] text-gray-400 dark:text-gray-500">جنسیت</p>
          <p class="text-sm font-medium text-gray-900 dark:text-white mt-0.5">{{ genderLabel }}</p>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
export interface ProfileForm {
  firstName: string
  lastName: string
  nationalId: string
  birthDate: string
  gender: string
}

const props = defineProps<{ form: ProfileForm }>()
const emit = defineEmits<{ edit: [] }>()

const genderOptions = [
  { label: 'تعیین نشده', value: 'unspecified' },
  { label: 'مرد', value: 'male' },
  { label: 'زن', value: 'female' },
]

const genderLabel = computed(() => {
  if (!props.form.gender || props.form.gender === 'unspecified') return 'تعیین نشده'
  return genderOptions.find((o) => o.value === props.form.gender)?.label ?? 'تعیین نشده'
})
</script>
