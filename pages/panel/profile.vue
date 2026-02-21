<!-- pages/panel/profile.vue -->
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
        <UButton variant="soft" @click="resetForm"> انصراف </UButton>
        <UButton type="submit" :loading="isLoading"> ذخیره تغییرات </UButton>
      </div>
    </form>
  </UCard>
</template>

<script setup>
const app = useNuxtApp()
const userStore = useUserStore()
const toast = useToast()
const isLoading = ref(false)

const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
})

const loadUserData = () => {
  const user = userStore.currentUser || app.$auth.user
  if (user?.person) {
    form.value = {
      firstName: user.person.firstName || '',
      lastName: user.person.lastName || '',
      email: user.email || '',
      phone: user.person.phoneNumber || '',
    }
  }
}

const resetForm = () => {
  loadUserData()
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
