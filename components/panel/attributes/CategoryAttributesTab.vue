<!-- components/panel/attributes/CategoryAttributesTab.vue -->
<template>
  <div>
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <USelectMenu
        v-model="categoryId"
        :items="categoryItems"
        value-key="value"
        placeholder="انتخاب دسته‌بندی"
        :disabled="loadingCategories"
        class="w-72 max-w-full"
      />
      <UButton
        v-if="categoryId"
        color="primary"
        icon="i-heroicons-plus"
        class="ms-auto"
        @click="openCreate"
      >
        نسبت دادن ویژگی
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <PanelEmptyState
          v-if="!categoryId"
          key="pick"
          icon="i-heroicons-squares-2x2"
          :title="categoryError ? 'دریافت دسته‌بندی‌ها ناموفق بود' : 'یک دسته‌بندی انتخاب کنید'"
          :text="categoryError ? '' : 'ویژگی‌های هر دسته و تنظیمات آن‌ها را اینجا ببینید'"
        />

        <div v-else-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 3" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-4">
            <div class="flex-1 space-y-2">
              <USkeleton class="h-4 w-32" />
              <USkeleton class="h-3 w-48" />
            </div>
            <USkeleton class="h-5 w-16 rounded-full" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به ویژگی‌های دسته ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت ویژگی‌های دسته ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <div v-else-if="rows.length" key="content" class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">ویژگی</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">اجباری</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">فیلتر</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">محور تنوع</th>
                <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">ترتیب</th>
                <th class="px-6 py-3" />
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in rows"
                :key="row.id"
                class="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
              >
                <td class="px-6 py-3 align-top">
                  <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.attribute?.name }}</p>
                  <p class="text-xs text-gray-500 dark:text-gray-400">{{ attributeTypeLabel(row.attribute?.type) }}</p>
                  <p v-if="row.inherited" class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    از دسته‌ی والد: {{ row.categoryName }}
                  </p>
                </td>
                <td class="px-6 py-3 align-top">
                  <span :class="row.required ? 'text-sm font-medium text-success' : 'text-sm text-gray-400 dark:text-gray-600'">{{ row.required ? 'بله' : 'خیر' }}</span>
                </td>
                <td class="px-6 py-3 align-top">
                  <span :class="row.filterable ? 'text-sm font-medium text-success' : 'text-sm text-gray-400 dark:text-gray-600'">{{ row.filterable ? 'بله' : 'خیر' }}</span>
                </td>
                <td class="px-6 py-3 align-top">
                  <span :class="row.variantAxis ? 'text-sm font-medium text-success' : 'text-sm text-gray-400 dark:text-gray-600'">{{ row.variantAxis ? 'بله' : 'خیر' }}</span>
                </td>
                <td class="px-6 py-3 align-top text-sm text-gray-700 dark:text-gray-300">
                  {{ (row.sortOrder ?? 0).toLocaleString('fa-IR') }}
                </td>
                <td class="px-6 py-3 align-top text-end">
                  <UDropdownMenu
                    v-if="!row.inherited"
                    :items="[rowActions(row)]"
                    :ui="{ content: 'font-dana w-44' }"
                  >
                    <UButton
                      variant="ghost"
                      icon="i-heroicons-ellipsis-vertical"
                      size="xs"
                      color="neutral"
                      square
                      aria-label="عملیات ویژگی دسته"
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
          title="به این دسته ویژگی‌ای نسبت داده نشده"
          text="ویژگی‌ها را از کتابخانه به این دسته نسبت دهید"
        />
      </Transition>
    </div>

    <AssignAttributeModal
      v-model:open="formOpen"
      :category-id="categoryId"
      :assignment="editing"
      :assigned-ids="directAttributeIds"
      @saved="load"
    />

    <PanelConfirmDialog
      :open="removeTarget !== null"
      title="برداشتن ویژگی از دسته"
      :message="removeTarget ? `ویژگی «${removeTarget.attribute?.name}» از این دسته برداشته شود؟` : ''"
      confirm-label="برداشتن"
      confirm-color="error"
      :loading="removing"
      @update:open="(value) => { if (!value) removeTarget = null }"
      @confirm="confirmRemove"
    />
  </div>
</template>

<script setup>
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import AssignAttributeModal from '@/components/panel/attributes/AssignAttributeModal.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'
import { attributeTypeLabel } from '~/utils/attributeMeta.js'

const app = useNuxtApp()
const toast = useAppToast()

// Category picker: product categories, label = full path (or name)
const categoryId = ref(null)
const categoryItems = ref([])
const loadingCategories = ref(true)
const categoryError = ref(false)

const loadCategories = async () => {
  loadingCategories.value = true
  try {
    const res = await app.$api.catalog.listCategories({ params: { scope: 'PRODUCT' } })
    categoryItems.value = (res.data.data ?? []).map((c) => ({
      label: c.fullPath || c.name,
      value: String(c.id),
    }))
    categoryError.value = false
  } catch {
    categoryItems.value = []
    categoryError.value = true
  } finally {
    loadingCategories.value = false
  }
}

const rows = ref([])
const loading = ref(false)
const error = ref(null)
const forbidden = ref(false)

// Attribute ids assigned directly to this category (not inherited); the assign modal hides them
const directAttributeIds = computed(() => rows.value.filter((row) => !row.inherited).map((row) => row.attribute?.id))

// Latest request wins: a slow response for a previous category never overwrites the current one
let latestRequest = 0

const load = async () => {
  if (!categoryId.value) return
  const request = ++latestRequest
  loading.value = true
  try {
    const res = await app.$api.catalogAdmin.listCategoryAttributes({
      data: { categoryId: Number(categoryId.value) },
    })
    if (request !== latestRequest) return
    rows.value = res.data.data ?? []
    error.value = null
    forbidden.value = false
  } catch (e) {
    if (request !== latestRequest) return
    rows.value = []
    error.value = e
    forbidden.value = errorStatus(e) === 403
  } finally {
    if (request === latestRequest) loading.value = false
  }
}

watch(categoryId, () => {
  rows.value = []
  error.value = null
  forbidden.value = false
  load()
})

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

const removeTarget = ref(null)
const removing = ref(false)

const rowActions = (row) => [
  { label: 'ویرایش تنظیمات', icon: 'i-heroicons-pencil-square', onSelect: () => openEdit(row) },
  { label: 'برداشتن', icon: 'i-heroicons-x-mark', color: 'error', onSelect: () => (removeTarget.value = row) },
]

const confirmRemove = async () => {
  removing.value = true
  try {
    await app.$api.catalogAdmin.unassignCategoryAttribute({
      data: { categoryId: Number(categoryId.value), attributeId: removeTarget.value.attribute.id },
    })
    removeTarget.value = null
    toast.success('ویژگی از دسته برداشته شد')
    await load()
  } catch (e) {
    toast.error(apiErrorMessage(e, 'برداشتن ویژگی ناموفق بود'))
  } finally {
    removing.value = false
  }
}

onMounted(loadCategories)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
