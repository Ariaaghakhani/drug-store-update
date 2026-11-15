<!-- components/panel/pages/ReturnPolicyTab.vue -->
<template>
  <div class="relative">
    <Transition name="sk">
      <div v-if="loading" key="skeleton" class="space-y-4 p-4 sm:p-6">
        <USkeleton class="h-9 w-full rounded-lg" />
        <USkeleton class="h-56 w-full rounded-lg" />
        <USkeleton class="h-9 w-40 rounded-lg" />
      </div>

      <PanelEmptyState
        v-else-if="forbidden"
        key="forbidden"
        variant="forbidden"
        title="دسترسی به شرایط مرجوعی ندارید"
      />

      <PanelEmptyState
        v-else-if="error"
        key="error"
        variant="error"
        title="دریافت شرایط مرجوعی ناموفق بود"
      >
        <template #action>
          <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
            تلاش دوباره
          </UButton>
        </template>
      </PanelEmptyState>

      <div v-else key="content" class="space-y-8 p-4 sm:p-6">
        <form dir="rtl" class="space-y-6 font-dana" @submit.prevent="save">
          <UAlert
            v-if="policy?.defaultText"
            color="info"
            variant="soft"
            icon="i-heroicons-information-circle"
            title="متن پیش‌فرض نمایش داده می‌شود"
            description="این فروشگاه هنوز متن شرایط مرجوعی ثبت نکرده است. با ذخیره‌ی این فرم، متن شما منتشر می‌شود."
          />

          <div class="flex items-center gap-2">
            <USwitch
              v-model="form.publish"
              size="lg"
              :ui="{
                base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
              }"
            />
            <span class="text-sm text-gray-900 dark:text-white">منتشر شود</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              خاموش بودن یعنی متن ذخیره می‌شود، اما برای مشتری نمایش داده نمی‌شود و در ثبت سفارش پذیرفته نمی‌شود
            </span>
          </div>

          <UFormField label="عنوان" required :error="errors.title">
            <UInput v-model="form.title" :maxlength="200" class="w-full" />
          </UFormField>

          <UFormField label="متن (HTML)" required :error="errors.content">
            <UTextarea v-model="form.content" :rows="14" :maxlength="100000" dir="ltr" class="w-full font-mono" />
          </UFormField>

          <div v-if="previewText" class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-1">
            <p class="text-xs font-medium text-gray-500 dark:text-gray-400">پیش‌نمایش متن</p>
            <p class="text-sm text-gray-700 dark:text-gray-300 leading-6 whitespace-pre-line">{{ previewText }}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
            <UButton
              color="neutral"
              variant="outline"
              icon="i-heroicons-arrow-uturn-left"
              :disabled="saving || resetting"
              @click="resetOpen = true"
            >
              بازگشت به متن پیش‌فرض
            </UButton>
            <UButton type="submit" color="primary" class="ms-auto" :loading="saving" :disabled="saving">
              ذخیره
            </UButton>
          </div>
        </form>

        <section class="space-y-3">
          <h4 class="text-sm font-medium text-gray-900 dark:text-white">نسخه‌ها</h4>

          <p v-if="versionsError" class="text-sm text-error" role="alert">فهرست نسخه‌ها دریافت نشد</p>

          <UCard v-else :ui="{ body: 'p-0' }">
            <div v-if="!versions.length" class="text-center py-10">
              <p class="text-sm text-gray-500 dark:text-gray-400">هنوز نسخه‌ای ثبت نشده است</p>
            </div>
            <div v-else class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نسخه</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">عنوان</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">انتشار</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">وضعیت</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in versions"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{{ row.version || '—' }}</td>
                    <td class="px-6 py-3 text-sm text-gray-700 dark:text-gray-300">{{ row.title }}</td>
                    <td class="px-6 py-3 text-xs text-gray-600 dark:text-gray-400">
                      {{ formatJalali(row.publishedAt, { withTime: true }) || '—' }}
                    </td>
                    <td class="px-6 py-3">
                      <div class="flex flex-wrap gap-1">
                        <UBadge v-if="row.active" color="success" variant="subtle" size="xs">جاری</UBadge>
                        <UBadge v-else color="neutral" variant="subtle" size="xs">بایگانی</UBadge>
                        <UBadge v-if="row.defaultText" color="neutral" variant="soft" size="xs">پیش‌فرض</UBadge>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </UCard>
        </section>
      </div>
    </Transition>

    <PanelConfirmDialog
      :open="resetOpen"
      title="بازگشت به متن پیش‌فرض"
      message="متن پیش‌فرض پلتفرم با نام فروشگاه و مهلت مرجوعی همین لحظه، به‌عنوان نسخه‌ی جدید منتشر می‌شود. متن فعلی در نسخه‌ها باقی می‌ماند."
      confirm-label="بازگردانی"
      confirm-color="error"
      :loading="resetting"
      @update:open="(value) => { if (!value) resetOpen = false }"
      @confirm="confirmReset"
    />
  </div>
</template>

<script setup>
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { formatJalali } from '~/utils/jalali.js'
import { htmlToText } from '~/utils/storefrontGoods.js'

// The return policy of this store (RETURN_POLICY). Saving changed text makes a new version; the newest active one is what
// customers see and accept at checkout. Loads its own policy and version list on mount.
const app = useNuxtApp()
const toast = useAppToast()

const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)
const policy = ref(null)
const versions = ref([])
const versionsError = ref(false)

const form = reactive({ title: '', content: '', publish: true })
const errors = ref({})
const previewText = computed(() => htmlToText(form.content))

const hydrate = (data) => {
  form.title = data.title ?? ''
  form.content = data.content ?? ''
  // The default text is not published until the store saves; a saved text follows its own published flag
  form.publish = data.defaultText ? true : data.active === true
}

const loadVersions = async () => {
  try {
    const res = await app.$api.contentAdmin.listReturnPolicyVersions()
    versions.value = res.data.data ?? []
    versionsError.value = false
  } catch {
    versions.value = []
    versionsError.value = true
  }
}

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.contentAdmin.getReturnPolicyAdmin()
    policy.value = res.data.data
    hydrate(policy.value)
    error.value = null
    forbidden.value = false
  } catch (e) {
    forbidden.value = errorStatus(e) === 403
    error.value = forbidden.value ? null : e
  } finally {
    loading.value = false
  }
  if (!forbidden.value && !error.value) await loadVersions()
}

const validate = () => {
  const next = {}
  if (!form.title.trim()) next.title = 'عنوان را وارد کنید'
  else if (form.title.trim().length > 200) next.title = 'حداکثر ۲۰۰ نویسه'
  if (!form.content.trim()) next.content = 'متن را وارد کنید'
  errors.value = next
  return Object.keys(next).length === 0
}

const saving = ref(false)

const save = async () => {
  if (saving.value || !validate()) return
  saving.value = true
  try {
    const res = await app.$api.contentAdmin.saveReturnPolicy({
      data: {
        title: form.title.trim(),
        content: form.content.trim(),
        // null publishes and archives the previous version; false keeps the text hidden
        active: form.publish ? null : false,
      },
    })
    if (isPending(res)) return load()
    policy.value = res.data.data
    hydrate(policy.value)
    toast.success(form.publish ? 'شرایط مرجوعی منتشر شد' : 'متن شرایط مرجوعی ذخیره شد')
    await loadVersions()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره‌ی شرایط مرجوعی ناموفق بود'))
  } finally {
    saving.value = false
  }
}

const resetOpen = ref(false)
const resetting = ref(false)

const confirmReset = async () => {
  resetting.value = true
  try {
    const res = await app.$api.contentAdmin.resetReturnPolicy()
    policy.value = res.data.data
    hydrate(policy.value)
    resetOpen.value = false
    toast.success('متن پیش‌فرض منتشر شد')
    await loadVersions()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'بازگشت به متن پیش‌فرض ناموفق بود'))
  } finally {
    resetting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
