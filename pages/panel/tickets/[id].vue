<!-- pages/panel/tickets/[id].vue -->
<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between gap-3">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        جزئیات <span class="text-brand-500">تیکت</span>
      </h3>
      <UButton to="/panel/tickets" color="neutral" variant="outline" icon="i-heroicons-arrow-right">
        بازگشت به تیکت‌ها
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-4">
          <USkeleton class="h-24 w-full rounded-xl" />
          <USkeleton class="h-20 w-3/4 rounded-xl" />
          <USkeleton class="h-20 w-3/4 rounded-xl ms-auto" />
        </div>

        <div v-else-if="ticket" key="content" class="space-y-4">
          <!-- Header -->
          <UCard>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-base font-bold text-gray-900 dark:text-white">{{ ticket.subject }}</span>
              <UBadge :color="ticketStatusMeta(ticket.status).color" variant="subtle" size="xs">
                {{ ticketStatusMeta(ticket.status).label }}
              </UBadge>
              <UBadge :color="ticketPriorityMeta(ticket.priority).color" variant="subtle" size="xs">
                {{ ticketPriorityMeta(ticket.priority).label }}
              </UBadge>
            </div>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {{ ticket.ticketNumber }} · {{ TICKET_CATEGORY_LABELS[ticket.category] ?? '' }} ·
              {{ formatDateTime(ticket.createdAt) }}
              <template v-if="isStaff && ticket.createdByName"> · {{ ticket.createdByName }}</template>
            </p>
            <p v-if="ticket.description" class="text-sm text-gray-700 dark:text-gray-300 mt-3 whitespace-pre-line">
              {{ ticket.description }}
            </p>

            <div class="flex items-center gap-2 mt-4 flex-wrap">
              <template v-if="isStaff">
                <USelect v-model="newStatus" :items="statusOptions" size="sm" class="w-44" />
                <UButton
                  color="neutral"
                  variant="outline"
                  size="sm"
                  :loading="savingStatus"
                  :disabled="newStatus === ticket.status"
                  @click="updateStatus"
                >
                  تغییر وضعیت
                </UButton>
              </template>
              <UButton
                v-else-if="ticket.status !== 'CLOSED'"
                color="error"
                variant="outline"
                size="sm"
                icon="i-heroicons-lock-closed"
                :loading="closing"
                @click="closeTicket"
              >
                بستن تیکت
              </UButton>
            </div>
          </UCard>

          <!-- Thread -->
          <div class="space-y-3">
            <div
              v-for="message in messages"
              :key="message.id"
              class="max-w-[85%] rounded-xl px-4 py-3 text-sm"
              :class="[
                isMine(message)
                  ? 'bg-brand-50 dark:bg-brand-900/20 me-auto'
                  : 'bg-gray-100 dark:bg-gray-800 ms-auto',
                message.internal ? 'ring-1 ring-warning/50' : '',
              ]"
            >
              <div class="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span class="font-semibold text-gray-900 dark:text-white">
                  {{ message.isFromSupport && !isStaff ? 'پشتیبانی' : message.senderName }}
                </span>
                <UBadge v-if="message.internal" color="warning" variant="subtle" size="xs">یادداشت داخلی</UBadge>
                <span>{{ formatDateTime(message.createdAt) }}</span>
              </div>
              <p class="text-gray-900 dark:text-white whitespace-pre-line">{{ message.message }}</p>
              <div v-if="message.attachments?.length" class="flex flex-wrap gap-2 mt-2">
                <UButton
                  v-for="file in message.attachments"
                  :key="file.id"
                  color="neutral"
                  variant="soft"
                  size="xs"
                  icon="i-heroicons-paper-clip"
                  @click="downloadAttachment(file)"
                >
                  {{ file.fileName }}
                </UButton>
              </div>
            </div>
          </div>

          <!-- Reply -->
          <UCard v-if="ticket.status !== 'CLOSED'">
            <form class="space-y-3" @submit.prevent="sendReply">
              <UTextarea v-model="replyText" :rows="3" placeholder="پیام خود را بنویسید…" class="w-full" />
              <div class="flex items-center gap-3 flex-wrap">
                <input ref="fileInput" type="file" multiple class="hidden" @change="onFilesPicked" />
                <UButton
                  color="neutral"
                  variant="ghost"
                  size="sm"
                  icon="i-heroicons-paper-clip"
                  @click="fileInput?.click()"
                >
                  پیوست فایل
                </UButton>
                <span v-if="files.length" class="text-xs text-gray-500 dark:text-gray-400">
                  {{ files.length.toLocaleString('fa-IR') }} فایل انتخاب شد
                </span>
                <label v-if="isStaff" class="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                  <input v-model="internalNote" type="checkbox" /> یادداشت داخلی
                </label>
                <UButton type="submit" color="primary" class="ms-auto" :loading="sending" :disabled="!replyText.trim()">
                  ارسال پیام
                </UButton>
              </div>
            </form>
          </UCard>

          <!-- Rating (customers, resolved/closed, not rated yet) -->
          <UCard v-if="!isStaff && canRate">
            <h4 class="text-sm font-bold text-gray-900 dark:text-white mb-3">از پاسخ پشتیبانی راضی بودید؟</h4>
            <div class="flex items-center gap-1 mb-3">
              <button
                v-for="n in 5"
                :key="n"
                type="button"
                class="p-0.5"
                :aria-label="`${n} از ۵`"
                @click="rating.score = n"
              >
                <UIcon
                  :name="n <= rating.score ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                  class="w-7 h-7"
                  :class="n <= rating.score ? 'text-warning' : 'text-gray-300 dark:text-gray-600'"
                />
              </button>
            </div>
            <UTextarea v-model="rating.comment" :rows="2" maxlength="500" placeholder="نظر شما (اختیاری)" class="w-full mb-3" />
            <UButton color="primary" :loading="rating.saving" :disabled="!rating.score" @click="submitRating">
              ثبت امتیاز
            </UButton>
          </UCard>
          <p v-else-if="!isStaff && ticket.rating" class="text-sm text-gray-500 dark:text-gray-400 text-center">
            امتیاز شما: {{ ticket.rating.toLocaleString('fa-IR') }} از {{ (5).toLocaleString('fa-IR') }}
          </p>
        </div>

        <div v-else key="empty" class="text-center py-16">
          <div
            class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
          >
            <UIcon name="i-heroicons-lifebuoy" class="w-10 h-10 text-gray-400 dark:text-gray-600" />
          </div>
          <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">تیکت یافت نشد</h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">این تیکت وجود ندارد یا به شما تعلق ندارد</p>
          <UButton to="/panel/tickets" color="primary" icon="i-heroicons-arrow-right">
            بازگشت به تیکت‌ها
          </UButton>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const app = useNuxtApp()
const toast = useAppToast()
const { getUserRole } = useUserPanelTabs()
const isStaff = computed(() => getUserRole() !== 'customer')

const loading = ref(true)
const ticket = ref(null)
const messages = computed(() => ticket.value?.messages ?? [])

const statusOptions = toSelectItems(
  Object.fromEntries(Object.entries(TICKET_STATUS_META).map(([k, v]) => [k, v.label]))
)
const newStatus = ref(null)

const formatDateTime = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR')
}

// "mine" = same side as the viewer: customers' own messages vs support's, mirrored for staff
const isMine = (message) => (isStaff.value ? message.isFromSupport : !message.isFromSupport)

async function fetchTicket() {
  try {
    const response = await app.$api.ticket.getTicket(isStaff.value, route.params.id)
    ticket.value = response.data.data ?? null
    newStatus.value = ticket.value?.status ?? null
  } catch {
    ticket.value = null
  } finally {
    loading.value = false
  }
}
onMounted(fetchTicket)

// ---------- reply ----------
const replyText = ref('')
const internalNote = ref(false)
const files = ref([])
const fileInput = ref(null)
const sending = ref(false)

const onFilesPicked = (event) => {
  files.value = Array.from(event.target.files ?? [])
}

async function sendReply() {
  sending.value = true
  try {
    const response = await app.$api.ticket.replyTicket(isStaff.value, ticket.value.id, {
      data: { message: replyText.value.trim(), internal: isStaff.value ? internalNote.value : undefined },
    })
    if (files.value.length) {
      const body = new FormData()
      files.value.forEach((file) => body.append('files', file))
      try {
        await app.$api.ticket.attachToMessage(isStaff.value, ticket.value.id, response.data.data.id, { data: body })
      } catch (error) {
        toast.error('پیام ارسال شد اما بارگذاری فایل ناموفق بود', error?.response?.data?.message)
      }
    }
    replyText.value = ''
    internalNote.value = false
    files.value = []
    if (fileInput.value) fileInput.value.value = ''
    await fetchTicket()
  } catch (error) {
    toast.error('ارسال پیام ناموفق بود', error?.response?.data?.message)
  } finally {
    sending.value = false
  }
}

async function downloadAttachment(file) {
  try {
    const result = await app.$api.instances.default(app.$api.ticket.attachmentPath(isStaff.value, file.id), {
      responseType: 'blob',
    })
    const blob = result?.data ?? result
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = file.fileName || 'attachment'
    link.click()
    URL.revokeObjectURL(url)
  } catch {
    toast.error('دانلود فایل ناموفق بود')
  }
}

// ---------- status (staff) / close (customer) ----------
const savingStatus = ref(false)
async function updateStatus() {
  savingStatus.value = true
  try {
    await app.$api.ticket.setTicketStatus(ticket.value.id, { data: { status: newStatus.value } })
    toast.success('وضعیت تیکت تغییر کرد')
    await fetchTicket()
  } catch (error) {
    toast.error('تغییر وضعیت ناموفق بود', error?.response?.data?.message)
  } finally {
    savingStatus.value = false
  }
}

const closing = ref(false)
async function closeTicket() {
  closing.value = true
  try {
    await app.$api.ticket.closeTicket(ticket.value.id)
    toast.success('تیکت بسته شد')
    await fetchTicket()
  } catch (error) {
    toast.error('بستن تیکت ناموفق بود', error?.response?.data?.message)
  } finally {
    closing.value = false
  }
}

// ---------- rating (customer; BACK: once, RESOLVED/CLOSED only) ----------
const canRate = computed(
  () => ['RESOLVED', 'CLOSED'].includes(ticket.value?.status) && !ticket.value?.rating
)
const rating = reactive({ score: 0, comment: '', saving: false })

async function submitRating() {
  rating.saving = true
  try {
    await app.$api.ticket.rateTicket(ticket.value.id, {
      data: { score: rating.score, comment: rating.comment.trim() || undefined },
    })
    toast.success('امتیاز شما ثبت شد')
    await fetchTicket()
  } catch (error) {
    toast.error('ثبت امتیاز ناموفق بود', error?.response?.data?.message)
  } finally {
    rating.saving = false
  }
}

useHead({ title: 'جزئیات تیکت | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
