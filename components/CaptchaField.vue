<template>
  <UFormField v-if="visible" label="کد امنیتی" required :error="error" class="w-full">
    <div class="flex items-center gap-3">
      <div class="relative h-12 w-32 shrink-0">
        <Transition name="sk">
          <img
            v-if="challenge"
            :key="challenge.captchaId"
            :src="challenge.image"
            alt="تصویر کد امنیتی"
            class="h-12 w-32 rounded-lg border border-gray-200 bg-white object-contain dark:border-gray-700 dark:bg-white"
          >
          <USkeleton v-else class="h-12 w-32 rounded-lg" />
        </Transition>
      </div>
      <UButton
        type="button"
        color="neutral"
        variant="ghost"
        square
        icon="i-heroicons-arrow-path"
        aria-label="دریافت کد امنیتی جدید"
        :loading="loading"
        @click="refresh"
      />
    </div>
    <UInput
      :model-value="model.captchaAnswer ?? ''"
      :maxlength="challenge?.length"
      :inputmode="challenge?.digitsOnly ? 'numeric' : 'text'"
      :disabled="!challenge"
      placeholder="کد تصویر را وارد کنید"
      autocomplete="off"
      dir="ltr"
      class="mt-3 w-full"
      @update:model-value="setAnswer"
    />
    <p v-if="failed" class="mt-2 text-xs text-error">کد امنیتی بارگذاری نشد؛ با دکمه‌ی تازه‌سازی دوباره تلاش کنید.</p>
  </UFormField>
</template>

<script setup>
// Captcha for the public forms (login, register, contact). Status and challenge are fetched from
// services/api/auth.js; the parent spreads the v-model `{captchaId, captchaAnswer}` into its request body.
// Hidden unless the server says it is required (or the parent forces it after a captcha.* error).
const REFRESH_MARGIN_SECONDS = 30

const props = defineProps({
  modelValue: { type: Object, default: () => ({ captchaId: null, captchaAnswer: null }) },
  // Phone for login/forgot-password so the "after N failures" count is per user; empty for contact
  subject: { type: String, default: '' },
  audience: { type: String, default: 'STOREFRONT' },
  error: { type: String, default: '' },
})
const emit = defineEmits(['update:modelValue'])

const app = useNuxtApp()

const status = ref(null)
const challenge = ref(null)
const forced = ref(false)
const loading = ref(false)
const failed = ref(false)

let refreshTimer = null
let alive = true
let statusSeq = 0
// In-flight createCaptcha promise; lets force() + reset() in the same tick share one request
let challengeLoad = null

const model = computed(() => props.modelValue ?? { captchaId: null, captchaAnswer: null })
const visible = computed(() => forced.value || (!!status.value?.enabled && !!status.value?.required))

function setModel(value) {
  emit('update:modelValue', value)
}

function setAnswer(value) {
  setModel({ captchaId: model.value.captchaId, captchaAnswer: value || null })
}

function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

function scheduleRefresh(expiresInSeconds) {
  clearRefreshTimer()
  const seconds = Math.max((expiresInSeconds || 0) - REFRESH_MARGIN_SECONDS, 5)
  refreshTimer = setTimeout(() => {
    refreshTimer = null
    loadChallenge()
  }, seconds * 1000)
}

function loadChallenge() {
  if (challengeLoad) return challengeLoad
  clearRefreshTimer()
  loading.value = true
  challengeLoad = (async () => {
    try {
      const res = await app.$api.auth.createCaptcha({ data: { audience: props.audience } })
      if (!alive) return
      challenge.value = res.data.data
      failed.value = false
      setModel({ captchaId: challenge.value.captchaId, captchaAnswer: null })
      scheduleRefresh(challenge.value.expiresInSeconds)
    } catch {
      if (!alive) return
      challenge.value = null
      failed.value = true
      setModel({ captchaId: null, captchaAnswer: null })
    } finally {
      if (alive) loading.value = false
    }
  })()
  challengeLoad.finally(() => {
    challengeLoad = null
  })
  return challengeLoad
}

async function loadStatus() {
  const seq = ++statusSeq
  const params = { audience: props.audience }
  if (props.subject) params.subject = props.subject
  try {
    const res = await app.$api.auth.getCaptchaStatus({ params })
    if (!alive || seq !== statusSeq) return
    status.value = res.data.data
  } catch {
    if (!alive || seq !== statusSeq) return
    // A failed status check must never block the form: it counts as "not required"
    status.value = null
  }
  if (!visible.value) {
    clearRefreshTimer()
    challenge.value = null
    if (model.value.captchaId) setModel({ captchaId: null, captchaAnswer: null })
    return
  }
  if (!challenge.value) loadChallenge()
}

// Called by the parent after a captcha.* error: show the field even if the status said "not required"
function force() {
  forced.value = true
  if (!challenge.value) return loadChallenge()
  return challengeLoad ?? Promise.resolve()
}

// New challenge, answer cleared (the previous one is single-use, so any failed submit needs this)
function reset() {
  if (!visible.value) {
    clearRefreshTimer()
    setModel({ captchaId: null, captchaAnswer: null })
    return Promise.resolve()
  }
  return loadChallenge()
}

function refresh() {
  return loadChallenge()
}

watch(
  () => props.subject,
  () => loadStatus()
)

watch(
  () => props.audience,
  () => {
    challenge.value = null
    loadStatus()
  }
)

onMounted(loadStatus)

onBeforeUnmount(() => {
  alive = false
  clearRefreshTimer()
})

defineExpose({ reset, force })
</script>
