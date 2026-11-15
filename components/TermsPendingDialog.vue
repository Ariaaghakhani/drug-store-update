<template>
  <UModal
    :open="open"
    title="پذیرش قوانین جدید"
    description="برای ادامه استفاده از حساب، قوانین زیر را بخوانید و بپذیرید."
    :dismissible="false"
    :close="false"
    :ui="{ content: 'sm:max-w-lg' }"
  >
    <template #body>
      <div class="space-y-4" dir="rtl">
        <div v-for="term in terms" :key="term.id" class="space-y-2">
          <div class="flex items-center justify-between gap-3">
            <h3 class="font-bold text-gray-900 dark:text-white">{{ term.title }}</h3>
            <span class="text-xs text-gray-500 dark:text-gray-400">نسخه {{ term.version }}</span>
          </div>
          <div
            class="max-h-64 overflow-y-auto whitespace-pre-line rounded-lg bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm leading-7 text-gray-700 dark:text-gray-300 text-start"
          >
            {{ htmlToText(term.content) }}
          </div>
        </div>

        <UCheckbox v-model="checked" label="قوانین بالا را خوانده و می‌پذیرم" />
      </div>
    </template>

    <template #footer>
      <div class="flex w-full gap-3">
        <UButton
          color="neutral"
          variant="soft"
          class="flex-1 justify-center"
          :disabled="accepting"
          @click="logout"
        >
          خروج از حساب
        </UButton>
        <UButton
          color="primary"
          class="flex-1 justify-center"
          :disabled="!checked"
          :loading="accepting"
          @click="onAccept"
        >
          پذیرش
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const nuxtApp = useNuxtApp()
const toast = useAppToast()
const { terms, accepting, check, accept, clear } = usePendingTerms()

const checked = ref(false)
const open = computed(() => Boolean(nuxtApp.$auth.loggedIn) && terms.value.length > 0)

watch(terms, () => {
  checked.value = false
})

watch(
  () => nuxtApp.$auth.loggedIn,
  (loggedIn) => {
    if (loggedIn) check()
    else clear()
  },
  { immediate: true }
)

const onAccept = async () => {
  if (!checked.value) return
  const ok = await accept()
  if (ok) toast.success('قوانین پذیرفته شد')
  else toast.error('ثبت پذیرش انجام نشد', 'لطفاً دوباره تلاش کنید')
}

const logout = () => logoutAndResetAuthentication(nuxtApp)
</script>
