<template>
  <UContainer>
    <div class="py-12 max-w-3xl mx-auto">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <USkeleton class="h-10 w-56 mx-auto" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-2/3" />
          </div>

          <div v-else-if="about" key="content" class="space-y-8">
            <div class="text-center">
              <img v-if="about.logoUrl" :src="about.logoUrl" :alt="about.title" class="h-20 mx-auto mb-4" />
              <h1 class="text-4xl font-black text-gray-900 dark:text-white">{{ about.title }}</h1>
            </div>

            <!-- Store-authored text is rendered as plain text on purpose (no v-html) -->
            <p class="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line">{{ about.content }}</p>

            <div v-if="about.mission || about.vision" class="grid sm:grid-cols-2 gap-4">
              <UCard v-if="about.mission">
                <h2 class="font-bold text-gray-900 dark:text-white mb-2">ماموریت ما</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ about.mission }}</p>
              </UCard>
              <UCard v-if="about.vision">
                <h2 class="font-bold text-gray-900 dark:text-white mb-2">چشم‌انداز</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">{{ about.vision }}</p>
              </UCard>
            </div>

            <UCard v-if="contactRows.length">
              <h2 class="font-bold text-gray-900 dark:text-white mb-3">راه‌های ارتباطی</h2>
              <ul class="space-y-2 text-sm">
                <li v-for="row in contactRows" :key="row.icon" class="flex items-start gap-2">
                  <UIcon :name="row.icon" class="w-5 h-5 text-brand-500 dark:text-brand-400 flex-shrink-0" />
                  <a v-if="row.href" :href="row.href" class="text-gray-700 dark:text-gray-300 hover:underline" dir="auto">{{ row.text }}</a>
                  <span v-else class="text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ row.text }}</span>
                </li>
              </ul>
              <UButton to="/contact" color="primary" class="mt-4" icon="i-heroicons-envelope">تماس با ما</UButton>
            </UCard>
          </div>

          <div v-else key="empty" class="text-center py-16">
            <UIcon name="i-heroicons-information-circle" class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
            <h2 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">اطلاعاتی ثبت نشده است</h2>
            <UButton to="/" color="primary" class="mt-4" icon="i-heroicons-home">بازگشت به صفحه اصلی</UButton>
          </div>
        </Transition>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
const app = useNuxtApp()

const about = ref(null)
const loading = ref(true)

const contactRows = computed(() => {
  const a = about.value
  if (!a) return []
  return [
    a.contactPhone && { icon: 'i-heroicons-phone', text: a.contactPhone, href: `tel:${a.contactPhone}` },
    a.contactEmail && { icon: 'i-heroicons-envelope', text: a.contactEmail, href: `mailto:${a.contactEmail}` },
    a.address && { icon: 'i-heroicons-map-pin', text: a.address },
    a.workingHours && { icon: 'i-heroicons-clock', text: a.workingHours },
    a.instagram && { icon: 'i-heroicons-camera', text: a.instagram },
    a.telegram && { icon: 'i-heroicons-paper-airplane', text: a.telegram },
    a.whatsapp && { icon: 'i-heroicons-chat-bubble-left-right', text: a.whatsapp },
  ].filter(Boolean)
})

onMounted(async () => {
  try {
    about.value = (await app.$api.storefront.getAboutUs()).data.data ?? null
  } catch {
    about.value = null
  } finally {
    loading.value = false
  }
})

useHead({ title: 'درباره ما | داروخانه آنلاین' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
