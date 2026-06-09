<template>
  <UModal v-model:open="isOpen" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" :dismissible="false">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-user" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">ویرایش اطلاعات شخصی</h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            @click="isOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="px-5 py-5 space-y-4">
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="نام" name="firstName">
              <UInput v-model="localForm.firstName" placeholder="نام" class="w-full" />
            </UFormField>
            <UFormField label="نام خانوادگی" name="lastName">
              <UInput v-model="localForm.lastName" placeholder="نام خانوادگی" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="کد ملی" name="nationalId">
            <UInput v-model="localForm.nationalId" dir="ltr" placeholder="0000000000" maxlength="10" class="w-full" />
          </UFormField>
          <UFormField label="تاریخ تولد" name="birthDate">
            <UInput v-model="localForm.birthDate" dir="ltr" placeholder="1370/01/01" class="w-full" />
          </UFormField>
          <UFormField label="جنسیت" name="gender" class="*:font-dana">
            <USelect v-model="localForm.gender" :items="genderOptions" class="w-full *:font-dana" />
          </UFormField>
        </div>

        <div class="flex items-center justify-end gap-2 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <UButton variant="soft" color="neutral" size="lg" @click="isOpen = false">انصراف</UButton>
          <UButton color="primary" size="lg" :loading="loading" :disabled="!hasChanges" @click="handleSave">
            ذخیره تغییرات
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  open: Boolean,
  form: Object,
  loading: Boolean,
})

const emit = defineEmits(['update:open', 'save'])

const isOpen = computed({
  get: () => props.open,
  set: (v) => emit('update:open', v),
})

const localForm = ref({ ...props.form })

watch(
  () => props.open,
  (val) => { if (val) localForm.value = { ...props.form } }
)

const hasChanges = computed(() =>
  Object.keys(localForm.value).some((k) => localForm.value[k] !== props.form[k])
)

const handleSave = () => emit('save', { ...localForm.value })

const genderOptions = [
  { label: 'انتخاب کنید', value: 'unspecified' },
  { label: 'مرد', value: 'male' },
  { label: 'زن', value: 'female' },
]
</script>
