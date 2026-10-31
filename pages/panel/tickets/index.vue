<!-- pages/panel/tickets/index.vue -->
<template>
  <UCard>
    <div class="flex items-center justify-between mb-6 gap-3 flex-wrap">
      <h3 class="text-xl font-black text-gray-900 dark:text-white">
        {{ isStaff ? 'صندوق' : 'تیکت‌های' }} <span class="text-brand-500">{{ isStaff ? 'تیکت‌ها' : 'من' }}</span>
      </h3>
      <div class="flex items-center gap-2">
        <USelect v-model="statusFilter" :items="statusOptions" size="sm" class="w-44" />
        <UButton
          v-if="!isStaff"
          color="primary"
          icon="i-heroicons-plus"
          @click="showCreate = true"
        >
          تیکت جدید
        </UButton>
      </div>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="space-y-3">
          <div
            v-for="i in 3"
            :key="i"
            class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800"
          >
            <USkeleton class="w-11 h-11 rounded-xl flex-shrink-0" />
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-28" />
            </div>
            <USkeleton class="h-5 w-16" />
          </div>
        </div>

        <div v-else-if="tickets.length" key="content" class="space-y-3">
          <NuxtLink
            v-for="ticket in tickets"
            :key="ticket.id"
            :to="`/panel/tickets/${ticket.id}`"
            class="flex items-center gap-4 px-4 py-4 rounded-xl border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
          >
            <div
              class="w-11 h-11 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center flex-shrink-0"
            >
              <UIcon
                name="i-heroicons-lifebuoy"
                class="w-5 h-5 text-brand-500 dark:text-brand-400"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {{ ticket.subject }}
                </span>
                <UBadge :color="ticketStatusMeta(ticket.status).color" variant="subtle" size="xs">
                  {{ ticketStatusMeta(ticket.status).label }}
                </UBadge>
                <UBadge :color="ticketPriorityMeta(ticket.priority).color" variant="subtle" size="xs">
                  {{ ticketPriorityMeta(ticket.priority).label }}
                </UBadge>
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {{ ticket.ticketNumber }} · {{ TICKET_CATEGORY_LABELS[ticket.category] ?? '' }}
                <template v-if="isStaff && ticket.createdByName"> · {{ ticket.createdByName }}</template>
                · {{ formatDate(ticket.lastMessageAt || ticket.createdAt) }}
              </p>
            </div>
            <UIcon
              v-if="ticket.lastMessageFromSupport && !isStaff && ticket.status !== 'CLOSED'"
              name="i-heroicons-chat-bubble-left-ellipsis"
              class="w-5 h-5 text-brand-500 dark:text-brand-400 flex-shrink-0"
            />
          </NuxtLink>

          <div v-if="totalPages > 1" class="flex justify-center pt-2">
            <UPagination v-model:page="pageNumber" :total="totalElements" :items-per-page="PAGE_SIZE" />
          </div>
        </div>

        <div v-else key="empty" class="text-center py-16">
          <div
            class="w-20 h-20 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4"
          >
            <UIcon
              name="i-heroicons-lifebuoy"
              class="w-10 h-10 text-gray-400 dark:text-gray-600"
            />
          </div>
          <h4 class="text-base font-bold text-gray-900 dark:text-white mb-2">
            هنوز تیکتی ثبت نشده است
          </h4>
          <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">
            برای هر سوال یا مشکلی می‌توانید با پشتیبانی در تماس باشید
          </p>
          <UButton v-if="!isStaff" color="primary" icon="i-heroicons-plus" @click="showCreate = true">
            ثبت تیکت جدید
          </UButton>
        </div>
      </Transition>
    </div>

    <UModal v-model:open="showCreate" title="تیکت جدید" description="مشکل یا سوال خود را برای پشتیبانی بنویسید">
      <template #body>
        <form class="space-y-4" dir="rtl" @submit.prevent="createTicket">
          <UFormField label="موضوع" :error="errors.subject">
            <UInput v-model="form.subject" maxlength="150" class="w-full" />
          </UFormField>
          <div class="grid grid-cols-2 gap-3">
            <UFormField label="دسته‌بندی">
              <USelect v-model="form.category" :items="categoryOptions" class="w-full" />
            </UFormField>
            <UFormField label="اولویت">
              <USelect v-model="form.priority" :items="priorityOptions" class="w-full" />
            </UFormField>
          </div>
          <UFormField label="توضیحات" :error="errors.description">
            <UTextarea v-model="form.description" :rows="5" class="w-full" />
          </UFormField>
          <div class="flex justify-end gap-2">
            <UButton color="neutral" variant="outline" @click="showCreate = false">انصراف</UButton>
            <UButton type="submit" color="primary" :loading="creating">ثبت تیکت</UButton>
          </div>
        </form>
      </template>
    </UModal>
  </UCard>
</template>

<script setup>
const PAGE_SIZE = 20

const app = useNuxtApp()
const toast = useAppToast()
const { getUserRole } = useUserPanelTabs()
const isStaff = computed(() => getUserRole() !== 'customer')

const loading = ref(true)
const tickets = ref([])
const totalElements = ref(0)
const totalPages = ref(0)
const pageNumber = ref(1) // UPagination is 1-based; BACK is 0-based
const statusFilter = ref('all')

const statusOptions = [
  { value: 'all', label: 'همه وضعیت‌ها' },
  ...toSelectItems(Object.fromEntries(Object.entries(TICKET_STATUS_META).map(([k, v]) => [k, v.label]))),
]
const categoryOptions = toSelectItems(TICKET_CATEGORY_LABELS)
const priorityOptions = toSelectItems(
  Object.fromEntries(Object.entries(TICKET_PRIORITY_META).map(([k, v]) => [k, v.label]))
)

const formatDate = (value) => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('fa-IR')
}

async function fetchTickets() {
  loading.value = true
  try {
    const params = { page: pageNumber.value - 1, size: PAGE_SIZE }
    if (statusFilter.value !== 'all') params.status = statusFilter.value
    const response = await app.$api.ticket.listTickets(isStaff.value, { params })
    const page = response.data.data
    tickets.value = page?.content ?? []
    totalElements.value = page?.totalElements ?? 0
    totalPages.value = page?.totalPages ?? 0
  } catch {
    tickets.value = []
    totalElements.value = 0
    totalPages.value = 0
  } finally {
    loading.value = false
  }
}

watch(statusFilter, () => {
  pageNumber.value === 1 ? fetchTickets() : (pageNumber.value = 1)
})
watch(pageNumber, fetchTickets)
onMounted(fetchTickets)

// ---------- create (customers) ----------
const showCreate = ref(false)
const creating = ref(false)
const form = reactive({ subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM' })
const errors = reactive({ subject: '', description: '' })

async function createTicket() {
  errors.subject = form.subject.trim() ? '' : 'موضوع را وارد کنید'
  errors.description = form.description.trim() ? '' : 'توضیحات را وارد کنید'
  if (errors.subject || errors.description) return

  creating.value = true
  try {
    const response = await app.$api.ticket.createTicket({
      data: { ...form, subject: form.subject.trim(), description: form.description.trim() },
    })
    toast.success('تیکت ثبت شد')
    showCreate.value = false
    Object.assign(form, { subject: '', description: '', category: 'GENERAL', priority: 'MEDIUM' })
    await navigateTo(`/panel/tickets/${response.data.data.id}`)
  } catch (error) {
    toast.error('ثبت تیکت ناموفق بود', error?.response?.data?.message)
  } finally {
    creating.value = false
  }
}

useHead({ title: 'تیکت‌ها | پنل کاربری' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
