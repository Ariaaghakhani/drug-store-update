<!-- components/panel/contact/ContactMessageModal.vue -->
<template>
  <UModal
    :open="open"
    :dismissible="!busy"
    :ui="{ content: 'sm:max-w-2xl' }"
    @update:open="emit('update:open', $event)"
  >
    <template #header>
      <div class="flex items-center gap-3 min-w-0" dir="rtl">
        <UIcon name="i-heroicons-envelope" class="w-5 h-5 flex-shrink-0 text-brand-500 dark:text-brand-400" />
        <h3 class="text-base font-bold text-gray-900 dark:text-white truncate">پیام از {{ message?.fullName }}</h3>
      </div>
    </template>

    <template #body>
      <div v-if="message" dir="rtl" class="space-y-5 font-dana">
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">ایمیل</dt>
            <dd class="text-sm mt-0.5 text-gray-900 dark:text-white" dir="ltr">
              <a
                v-if="message.email"
                :href="`mailto:${message.email}`"
                class="text-brand-500 dark:text-brand-400 hover:underline"
              >{{ message.email }}</a>
              <span v-else>—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">شماره تماس</dt>
            <dd class="text-sm mt-0.5 text-gray-900 dark:text-white" dir="ltr">
              <a
                v-if="message.phone"
                :href="`tel:${message.phone}`"
                class="text-brand-500 dark:text-brand-400 hover:underline"
              >{{ message.phone }}</a>
              <span v-else>—</span>
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">تاریخ ثبت</dt>
            <dd class="text-sm mt-0.5 text-gray-900 dark:text-white">
              {{ formatJalali(message.createdAt, { withTime: true }) || '—' }}
            </dd>
          </div>
          <div>
            <dt class="text-xs text-gray-500 dark:text-gray-400">فرستنده</dt>
            <dd class="text-sm mt-0.5 text-gray-900 dark:text-white">
              {{ message.userId ? 'کاربر ثبت‌نام‌شده' : 'مهمان' }}
            </dd>
          </div>
        </dl>

        <div class="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4 space-y-2">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ message.subject }}</p>
          <p class="text-sm text-gray-700 dark:text-gray-300 leading-6 whitespace-pre-line">{{ message.message }}</p>
        </div>

        <UFormField label="وضعیت">
          <USelect
            :model-value="message.status"
            :items="statusItems"
            :disabled="busy"
            class="w-full sm:w-56"
            @update:model-value="changeStatus"
          />
        </UFormField>

        <div v-if="message.ticketId" class="flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
          <p class="text-sm text-gray-700 dark:text-gray-300 flex-1">این پیام به تیکت تبدیل شده است</p>
          <UButton
            :to="`/panel/tickets/${message.ticketId}`"
            color="neutral"
            variant="soft"
            icon="i-heroicons-arrow-top-right-on-square"
          >
            مشاهده تیکت
          </UButton>
        </div>

        <div v-else class="rounded-xl border border-gray-100 dark:border-gray-800 p-4 space-y-4">
          <p class="text-sm font-semibold text-gray-900 dark:text-white">تبدیل به تیکت</p>
          <p v-if="convertError" class="text-sm text-error" role="alert">{{ convertError }}</p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <UFormField label="دسته‌بندی">
              <USelect v-model="convertForm.category" :items="categoryItems" :disabled="busy" class="w-full" />
            </UFormField>
            <UFormField label="اولویت">
              <USelect v-model="convertForm.priority" :items="priorityItems" :disabled="busy" class="w-full" />
            </UFormField>
          </div>
          <div class="flex justify-end">
            <UButton color="primary" icon="i-heroicons-ticket" :loading="converting" :disabled="busy" @click="convert">
              تبدیل به تیکت
            </UButton>
          </div>
        </div>
      </div>
    </template>

    <template #footer>
      <div class="flex w-full items-center gap-2" dir="rtl">
        <UButton
          color="error"
          variant="ghost"
          icon="i-heroicons-trash"
          :disabled="busy"
          @click="emit('delete', message)"
        >
          حذف پیام
        </UButton>
        <UButton class="ms-auto" color="neutral" variant="soft" :disabled="busy" @click="emit('update:open', false)">
          بستن
        </UButton>
      </div>
    </template>
  </UModal>
</template>

<script setup>
import { apiErrorMessage, errorStatus, isPending } from '~/utils/apiError.js'
import { CONTACT_STATUS_META } from '~/utils/contactMeta.js'
import { selectItems } from '~/utils/enumMeta.js'
import { formatJalali } from '~/utils/jalali.js'
import { TICKET_CATEGORY_LABELS, TICKET_PRIORITY_META, toSelectItems } from '~/utils/ticketMeta.js'

// One contact message. Status and conversion are saved here; each saved DTO goes back to the page through `changed`.
// `stale` asks the page to close and reload (a write that landed behind a workflow), `delete` hands deletion to the page.
const props = defineProps({
  open: { type: Boolean, required: true },
  // ContactMessageResponseDTO from the list
  message: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'changed', 'stale', 'delete'])

const app = useNuxtApp()
const toast = useAppToast()

const statusItems = selectItems(CONTACT_STATUS_META)
const categoryItems = toSelectItems(TICKET_CATEGORY_LABELS)
const priorityItems = Object.entries(TICKET_PRIORITY_META).map(([value, meta]) => ({ value, label: meta.label }))

const statusSaving = ref(false)
const converting = ref(false)
const convertError = ref('')
const convertForm = reactive({ category: 'GENERAL', priority: 'MEDIUM' })

const busy = computed(() => statusSaving.value || converting.value)

// Every open starts with the default conversion choice and no leftover error
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    convertError.value = ''
    convertForm.category = 'GENERAL'
    convertForm.priority = 'MEDIUM'
  }
)

const changeStatus = async (status) => {
  if (!props.message || status === props.message.status || busy.value) return
  statusSaving.value = true
  try {
    const res = await app.$api.contentAdmin.setContactMessageStatus(props.message.id, { data: { status } })
    if (isPending(res)) return emit('stale')
    emit('changed', res.data.data)
    toast.success('وضعیت پیام ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره وضعیت ناموفق بود'))
  } finally {
    statusSaving.value = false
  }
}

const convert = async () => {
  if (!props.message || busy.value) return
  converting.value = true
  convertError.value = ''
  try {
    const res = await app.$api.contentAdmin.convertContactToTicket(props.message.id, {
      data: { category: convertForm.category, priority: convertForm.priority },
    })
    if (isPending(res)) return emit('stale')
    emit('changed', res.data.data)
    toast.success('پیام به تیکت تبدیل شد')
  } catch (e) {
    // 400 (not a store user) and 409 (already converted) explain themselves inline; the modal stays open
    const status = errorStatus(e)
    if (status === 409) emit('stale')
    convertError.value = apiErrorMessage(e, 'تبدیل پیام به تیکت ناموفق بود')
  } finally {
    converting.value = false
  }
}
</script>
