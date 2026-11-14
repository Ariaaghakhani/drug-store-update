<!-- pages/panel/attributes/index.vue -->
<template>
  <div class="space-y-5">
    <PanelPageHeader
      icon="i-heroicons-adjustments-horizontal"
      title="ویژگی‌های"
      accent="کالا"
      subtitle="کتابخانه ویژگی‌ها و نسبت آن‌ها به دسته‌ها"
    >
      <template #actions>
        <UButton v-if="tab === 'attributes'" color="primary" size="lg" icon="i-heroicons-plus" @click="openCreate">
          ویژگی جدید
        </UButton>
      </template>
    </PanelPageHeader>

    <UCard :ui="{ body: 'p-0' }">
      <div class="px-6 pt-3 border-b border-gray-100 dark:border-gray-800">
        <UTabs v-model="tab" :items="TAB_ITEMS" :content="false" variant="link" color="primary" />
      </div>

      <template v-if="tab === 'attributes'">
        <div class="relative">
          <Transition name="sk">
            <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
              <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
                <div class="flex-1 space-y-2">
                  <USkeleton class="h-4 w-32" />
                  <USkeleton class="h-3 w-56" />
                </div>
                <USkeleton class="h-5 w-16 rounded-full" />
              </div>
            </div>

            <PanelEmptyState
              v-else-if="forbidden"
              key="forbidden"
              variant="forbidden"
              title="دسترسی به ویژگی‌های کالا ندارید"
            />

            <PanelEmptyState
              v-else-if="error"
              key="error"
              variant="error"
              title="دریافت ویژگی‌ها ناموفق بود"
            >
              <template #action>
                <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
                  تلاش دوباره
                </UButton>
              </template>
            </PanelEmptyState>

            <div v-else-if="attributes.length" key="content" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نوع</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">واحد</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">گزینه‌ها</th>
                    <th class="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="row in attributes"
                    :key="row.id"
                    class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-3 align-top text-sm font-semibold text-gray-900 dark:text-white">
                      {{ row.name }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ attributeTypeLabel(row.type) }}
                    </td>
                    <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                      {{ row.type === 'NUMBER' && row.unit ? row.unit : '—' }}
                    </td>
                    <td class="px-6 py-3 align-top">
                      <div v-if="hasOptions(row.type) && row.options?.length" class="flex flex-wrap gap-1.5">
                        <UBadge
                          v-for="option in sortedOptions(row).slice(0, MAX_CHIPS)"
                          :key="option.id ?? option.value"
                          color="neutral"
                          variant="subtle"
                          size="xs"
                        >
                          {{ option.value }}
                        </UBadge>
                        <UBadge v-if="row.options.length > MAX_CHIPS" color="neutral" variant="outline" size="xs">
                          +{{ (row.options.length - MAX_CHIPS).toLocaleString('fa-IR') }}
                        </UBadge>
                      </div>
                      <span v-else class="text-sm text-gray-400 dark:text-gray-600">—</span>
                    </td>
                    <td class="px-6 py-3 align-top text-end">
                      <UDropdownMenu :items="[rowActions(row)]" :ui="{ content: 'font-dana w-44' }">
                        <UButton
                          variant="ghost"
                          icon="i-heroicons-ellipsis-vertical"
                          size="xs"
                          color="neutral"
                          square
                          aria-label="عملیات ویژگی"
                        />
                      </UDropdownMenu>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <PanelEmptyState
              v-else
              key="empty"
              icon="i-heroicons-adjustments-horizontal"
              title="هنوز ویژگی‌ای تعریف نکرده‌اید"
              text="ویژگی‌ها را بسازید، سپس به دسته‌ها نسبت دهید"
            />
          </Transition>
        </div>
      </template>

      <CategoryAttributesTab v-else-if="tab === 'categories'" />
    </UCard>

    <AttributeFormModal
      v-model:open="formOpen"
      :attribute="editing"
      @saved="load"
    />

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف ویژگی"
      :message="deleteTarget ? `ویژگی «${deleteTarget.name}» حذف شود؟` : ''"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import PanelPageHeader from '@/components/panel/PanelPageHeader.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import AttributeFormModal from '@/components/panel/attributes/AttributeFormModal.vue'
import CategoryAttributesTab from '@/components/panel/attributes/CategoryAttributesTab.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { attributeTypeLabel, hasOptions } from '~/utils/attributeMeta.js'

const app = useNuxtApp()
const toast = useAppToast()
const route = useRoute()
const router = useRouter()

// Options shown as chips per row before the «+N» counter
const MAX_CHIPS = 5

const TAB_ITEMS = [
  { label: 'ویژگی‌ها', value: 'attributes', icon: 'i-heroicons-adjustments-horizontal' },
  { label: 'دسته‌بندی‌ها', value: 'categories', icon: 'i-heroicons-squares-2x2' },
]
const TAB_VALUES = TAB_ITEMS.map((item) => item.value)

// The section lives in the query string (?tab=…), so a link from the product page can open the categories tab
const tab = computed({
  get: () => (TAB_VALUES.includes(route.query.tab) ? route.query.tab : 'attributes'),
  set: (value) => router.replace({ query: { ...route.query, tab: value } }),
})

// Unpaged list: local loading / error / forbidden states
const attributes = ref([])
const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)

const deleteTarget = ref(null)
const deleting = ref(false)

const formOpen = ref(false)
const editing = ref(null)

const openCreate = () => {
  editing.value = null
  formOpen.value = true
}

const openEdit = (row) => {
  editing.value = row
  formOpen.value = true
}

const sortedOptions = (row) => [...(row.options ?? [])].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.catalogAdmin.listAttributes()
    attributes.value = res.data.data ?? []
    error.value = null
    forbidden.value = false
  } catch (e) {
    attributes.value = []
    error.value = e
    forbidden.value = errorStatus(e) === 403
  } finally {
    loading.value = false
  }
}

const rowActions = (row) => [
  { label: 'ویرایش', icon: 'i-heroicons-pencil-square', onSelect: () => openEdit(row) },
  { label: 'حذف', icon: 'i-heroicons-trash', color: 'error', onSelect: () => (deleteTarget.value = row) },
]

const confirmDelete = async () => {
  deleting.value = true
  try {
    await app.$api.catalogAdmin.deleteAttribute({ data: { id: deleteTarget.value.id } })
    deleteTarget.value = null
    toast.success('ویژگی حذف شد')
    await load()
  } catch (e) {
    // BACK refuses while goods still use the attribute; its message explains why
    toast.error(apiErrorMessage(e, 'حذف ویژگی ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)

useHead({ title: 'ویژگی‌های کالا | پنل مدیریت' })
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
