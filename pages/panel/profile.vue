<!-- pages/panel/profile.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 min-h-8">
      <h3 class="text-xl font-bold text-gray-900 dark:text-white">
        اطلاعات شخصی
      </h3>
      <UButton
        v-if="!isEditing"
        variant="soft"
        color="gray"
        icon="i-heroicons-pencil-square"
        @click="startEditing"
      >
        ویرایش
      </UButton>
    </div>

    <UForm
      :state="form"
      class="flex flex-col space-y-5 w-full font-dana"
      dir="rtl"
      @submit.prevent="handleSubmit"
    >
      <div class="grid sm:grid-cols-2 gap-4">
        <UFormField label="نام" name="firstName" required>
          <UInput
            v-model="form.firstName"
            placeholder="نام خود را وارد کنید"
            class="w-full"
            :disabled="!isEditing"
          />
        </UFormField>

        <UFormField label="نام خانوادگی" name="lastName" required>
          <UInput
            v-model="form.lastName"
            placeholder="نام خانوادگی خود را وارد کنید"
            class="w-full"
            :disabled="!isEditing"
          />
        </UFormField>
      </div>

      <UFormField label="ایمیل" name="email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="ایمیل خود را وارد کنید"
          class="w-full"
          :disabled="!isEditing"
        />
      </UFormField>

      <UFormField label="شماره تماس" name="phone">
        <UInput
          v-model="form.phone"
          placeholder="شماره تماس خود را وارد کنید"
          class="w-full"
          disabled
        />
      </UFormField>

      <div
        class="flex justify-end gap-3 pt-2 mt-auto transition-opacity duration-150"
        :class="isEditing ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <UButton variant="soft" color="gray" @click="cancelEditing">
          انصراف
        </UButton>
        <UButton type="submit" :loading="isLoading" :disabled="!hasChanges"> ذخیره تغییرات </UButton>
      </div>
    </UForm>
  </UCard>
</template>

<script setup>
const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()
const isLoading = ref(false)
const isEditing = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const savedForm = ref({ ...form.value })

const hasChanges = computed(() =>
  ['firstName', 'lastName', 'email'].some(
    (key) => form.value[key] !== savedForm.value[key]
  )
)

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth.user
  if (user?.person) {
    form.value = {
      firstName: user.person.firstName || '',
      lastName: user.person.lastName || '',
      email: user.email || '',
      phone: user.person.phoneNumber || '',
    }
  } else {
    // TODO: remove mock data once API is connected
    form.value = {
      firstName: 'آریا',
      lastName: 'آقاخانی',
      email: 'example@email.com',
      phone: '09123456789',
    }
  }
  savedForm.value = { ...form.value }
}

const startEditing = () => {
  isEditing.value = true
}

const cancelEditing = () => {
  loadUserData()
  isEditing.value = false
}

const handleSubmit = async () => {
  isLoading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))

    toast.add({
      title: 'موفق',
      description: 'اطلاعات شما با موفقیت به‌روزرسانی شد',
      color: 'green',
    })
    savedForm.value = { ...form.value }
    isEditing.value = false
  } catch (error) {
    console.error('Update error:', error)
    toast.add({
      title: 'خطا',
      description: 'مشکلی در به‌روزرسانی اطلاعات پیش آمد',
      color: 'red',
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadUserData()
})

useHead({
  title: 'اطلاعات شخصی | پنل کاربری',
})
</script>
