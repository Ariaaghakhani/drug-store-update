<!-- components/panel/settings/PaymentGatewaysCard.vue -->
<template>
  <UCard :ui="{ body: 'p-0' }">
    <div class="flex items-center gap-2 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UIcon name="i-heroicons-credit-card" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
      <h2 class="text-sm font-medium text-gray-900 dark:text-white">حساب درگاه‌ها</h2>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-40" />
              <USkeleton class="h-3 w-24" />
            </div>
            <USkeleton class="h-6 w-11 rounded-full" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به درگاه‌های پرداخت ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت درگاه‌های پرداخت ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="rows.length" key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="row in rows" :key="row.gateway" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 min-w-0 space-y-1">
              <div class="flex items-center gap-2 flex-wrap">
                <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ gatewayLabel(row.gateway) }}</p>
                <StatusBadge :meta="row.configured ? CONFIGURED_META : NOT_CONFIGURED_META" />
              </div>
              <p v-if="!row.requiredFields?.length" class="text-xs text-gray-500 dark:text-gray-400">
                در این نسخه پشتیبانی نمی‌شود
              </p>
            </div>

            <div v-if="row.requiredFields?.length" class="flex items-center gap-2 flex-shrink-0">
              <UButton color="neutral" variant="outline" size="sm" @click="openEdit(row)">
                {{ row.configured ? 'ویرایش' : 'ثبت حساب' }}
              </UButton>
              <USwitch
                :model-value="row.active === true"
                size="lg"
                :disabled="!row.configured || togglingGateway === row.gateway"
                :aria-label="`فعال بودن ${gatewayLabel(row.gateway)}`"
                :ui="SWITCH_UI"
                @update:model-value="toggleActive(row, $event)"
              />
            </div>
          </div>
        </div>

        <PanelEmptyState
          v-else
          key="empty"
          icon="i-heroicons-credit-card"
          title="درگاه پرداختی تعریف نشده است"
        />
      </Transition>
    </div>

    <GatewayFormModal
      v-model:open="formOpen"
      :row="editing"
      @saved="onSaved"
    />
  </UCard>
</template>

<script setup>
// Gateway list of the store: configured state and the active switch. Writes go through `app.$api.payments`.
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import StatusBadge from '@/components/panel/StatusBadge.vue'
import GatewayFormModal from '@/components/panel/settings/GatewayFormModal.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { GATEWAY_LABELS } from '~/utils/paymentMeta.js'

const app = useNuxtApp()
const toast = useAppToast()

const CONFIGURED_META = { label: 'ثبت شده', color: 'success' }
const NOT_CONFIGURED_META = { label: 'ثبت نشده', color: 'neutral' }
// Brand teal switch (DESIGN_SYSTEM "USwitch"): never color="teal"
const SWITCH_UI = {
  base: 'data-[state=checked]:bg-brand-500 dark:data-[state=checked]:bg-brand-400 data-[state=unchecked]:bg-gray-300 dark:data-[state=unchecked]:bg-gray-600',
}

const rows = ref([])
const loading = ref(true)
const error = ref(false)
const forbidden = ref(false)
const togglingGateway = ref(null)
const formOpen = ref(false)
const editing = ref(null)

const gatewayLabel = (gateway) => GATEWAY_LABELS[gateway] ?? gateway

const load = async () => {
  loading.value = true
  error.value = false
  forbidden.value = false
  try {
    const res = await app.$api.payments.adminListGateways()
    rows.value = res.data.data ?? []
  } catch (e) {
    if (errorStatus(e) === 403) forbidden.value = true
    else error.value = true
  } finally {
    loading.value = false
  }
}

const openEdit = (row) => {
  editing.value = row
  formOpen.value = true
}

const onSaved = (updated) => {
  rows.value = rows.value.map((item) => (item.gateway === updated.gateway ? updated : item))
}

// Enabling needs a complete account (the switch is disabled while unconfigured); the reply replaces the row.
const toggleActive = async (row, active) => {
  togglingGateway.value = row.gateway
  try {
    const res = active
      ? await app.$api.payments.adminEnableGateway(row.gateway)
      : await app.$api.payments.adminDisableGateway(row.gateway)
    const updated = res.data.data
    rows.value = rows.value.map((item) => (item.gateway === row.gateway ? updated : item))
    toast.success(active ? 'درگاه فعال شد' : 'درگاه غیرفعال شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'تغییر وضعیت درگاه ناموفق بود'))
  } finally {
    togglingGateway.value = null
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
