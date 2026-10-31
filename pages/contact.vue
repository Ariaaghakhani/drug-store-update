<template>
  <UContainer>
    <div class="py-12 max-w-xl mx-auto">
      <h1 class="text-3xl font-black text-gray-900 dark:text-white mb-2">
        تماس <span class="text-brand-500">با ما</span>
      </h1>
      <p class="text-gray-600 dark:text-gray-400 mb-8">پیام خود را بنویسید؛ پشتیبانی در اسرع وقت پاسخ می‌دهد.</p>

      <div v-if="sent" class="text-center py-12">
        <UIcon name="i-heroicons-check-circle" class="w-20 h-20 text-success mx-auto" />
        <h2 class="text-xl font-black text-gray-900 dark:text-white mt-4 mb-2">پیام شما ارسال شد</h2>
        <p class="text-gray-600 dark:text-gray-400 mb-6">از تماس شما سپاسگزاریم.</p>
        <UButton to="/" color="primary" icon="i-heroicons-home">بازگشت به صفحه اصلی</UButton>
      </div>

      <UCard v-else>
        <form class="space-y-4" @submit.prevent="submit">
          <UFormField label="نام و نام خانوادگی" :error="errors.fullName">
            <UInput v-model="form.fullName" maxlength="100" class="w-full" />
          </UFormField>
          <div class="grid sm:grid-cols-2 gap-4">
            <UFormField label="شماره موبایل">
              <UInput v-model="form.phone" inputmode="tel" dir="ltr" class="w-full" />
            </UFormField>
            <UFormField label="ایمیل">
              <UInput v-model="form.email" type="email" dir="ltr" maxlength="100" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="موضوع" :error="errors.subject">
            <UInput v-model="form.subject" maxlength="200" class="w-full" />
          </UFormField>
          <UFormField label="پیام" :error="errors.message">
            <UTextarea v-model="form.message" :rows="6" class="w-full" />
          </UFormField>
          <!-- Honeypot: the backend `website` field must stay empty; hidden from real users -->
          <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" class="hidden" aria-hidden="true" />
          <UButton type="submit" block color="primary" :loading="sending">ارسال پیام</UButton>
        </form>
      </UCard>
    </div>
  </UContainer>
</template>

<script setup>
const app = useNuxtApp()
const toast = useAppToast()

const form = reactive({ fullName: '', phone: '', email: '', subject: '', message: '', website: '' })
const errors = reactive({ fullName: '', subject: '', message: '' })
const sending = ref(false)
const sent = ref(false)

async function submit() {
  errors.fullName = form.fullName.trim() ? '' : 'نام را وارد کنید'
  errors.subject = form.subject.trim() ? '' : 'موضوع را وارد کنید'
  errors.message = form.message.trim() ? '' : 'پیام را وارد کنید'
  if (errors.fullName || errors.subject || errors.message) return

  sending.value = true
  try {
    await app.$api.storefront.sendContactMessage({
      data: {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        email: form.email.trim() || undefined,
        subject: form.subject.trim(),
        message: form.message.trim(),
        website: form.website,
      },
    })
    sent.value = true
  } catch (error) {
    // 429 = the backend rate limit
    toast.error(
      error?.response?.status === 429 ? 'تعداد درخواست‌ها زیاد است' : 'ارسال پیام ناموفق بود',
      error?.response?.data?.message
    )
  } finally {
    sending.value = false
  }
}

useHead({ title: 'تماس با ما | داروخانه آنلاین' })
</script>
