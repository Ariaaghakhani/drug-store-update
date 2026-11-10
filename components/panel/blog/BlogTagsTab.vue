<!-- components/panel/blog/BlogTagsTab.vue -->
<template>
  <div>
    <div class="flex flex-wrap items-center gap-3 px-4 sm:px-6 py-4 border-b border-gray-100 dark:border-gray-800">
      <UInput
        v-model="newName"
        :maxlength="100"
        placeholder="نام برچسب جدید"
        class="w-64"
        @keyup.enter="create"
      />
      <UButton
        color="primary"
        icon="i-heroicons-plus"
        :loading="creating"
        :disabled="!newName.trim() || creating"
        @click="create"
      >
        افزودن برچسب
      </UButton>
    </div>

    <div class="relative">
      <Transition name="sk">
        <div v-if="loading" key="skeleton" class="divide-y divide-gray-100 dark:divide-gray-800">
          <div v-for="i in 4" :key="i" class="flex items-center gap-4 px-4 sm:px-6 py-3">
            <USkeleton class="h-4 w-4 rounded" />
            <USkeleton class="h-4 flex-1 max-w-48" />
          </div>
        </div>

        <PanelEmptyState
          v-else-if="forbidden"
          key="forbidden"
          variant="forbidden"
          title="دسترسی به برچسب‌های بلاگ ندارید"
        />

        <PanelEmptyState
          v-else-if="error"
          key="error"
          variant="error"
          title="دریافت برچسب‌ها ناموفق بود"
        >
          <template #action>
            <UButton color="neutral" variant="soft" icon="i-heroicons-arrow-path" @click="load">
              تلاش دوباره
            </UButton>
          </template>
        </PanelEmptyState>

        <PanelEmptyState
          v-else-if="!tags.length"
          key="empty"
          icon="i-heroicons-tag"
          title="هنوز برچسبی ندارید"
          text="برچسب‌ها را اینجا بسازید و هنگام نوشتن پست انتخاب کنید"
        />

        <ul v-else key="content" class="divide-y divide-gray-100 dark:divide-gray-800">
          <li v-for="tag in tags" :key="tag.id" class="flex items-center gap-3 px-4 sm:px-6 py-3">
            <template v-if="editingId === tag.id">
              <UInput
                v-model="editName"
                :maxlength="100"
                class="flex-1 min-w-0"
                @keyup.enter="saveEdit(tag)"
                @keyup.esc="cancelEdit"
              />
              <UButton
                color="success"
                variant="soft"
                size="xs"
                :loading="savingId === tag.id"
                :disabled="!editName.trim() || savingId !== null"
                @click="saveEdit(tag)"
              >
                ذخیره
              </UButton>
              <UButton
                color="neutral"
                variant="soft"
                size="xs"
                :disabled="savingId !== null"
                @click="cancelEdit"
              >
                انصراف
              </UButton>
            </template>

            <template v-else>
              <UIcon name="i-heroicons-tag" class="w-4 h-4 text-gray-400 dark:text-gray-600 flex-shrink-0" />
              <span class="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-white truncate">{{ tag.name }}</span>
              <UButton
                color="neutral"
                variant="ghost"
                size="xs"
                icon="i-heroicons-pencil-square"
                :disabled="savingId !== null"
                @click="startEdit(tag)"
              >
                ویرایش
              </UButton>
              <UButton
                color="error"
                variant="ghost"
                size="xs"
                icon="i-heroicons-trash"
                :disabled="savingId !== null"
                @click="deleteTarget = tag"
              >
                حذف
              </UButton>
            </template>
          </li>
        </ul>
      </Transition>
    </div>

    <PanelConfirmDialog
      :open="deleteTarget !== null"
      title="حذف برچسب"
      :message="deleteTarget ? `برچسب «${deleteTarget.name}» حذف شود؟ از همه‌ی پست‌ها برداشته می‌شود.` : ''"
      confirm-label="حذف"
      confirm-color="error"
      :loading="deleting"
      @update:open="(value) => { if (!value) deleteTarget = null }"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
// Blog tags (BLOG_TAG). The list is unpaged and sorted by name; create, rename and delete happen in place.
import PanelConfirmDialog from '@/components/panel/PanelConfirmDialog.vue'
import PanelEmptyState from '@/components/panel/PanelEmptyState.vue'
import { apiErrorMessage, errorStatus } from '~/utils/apiError.js'

const app = useNuxtApp()
const toast = useAppToast()

const tags = ref([])
const loading = ref(true)
const error = ref(null)
const forbidden = ref(false)

const sortTags = (list) => [...list].sort((a, b) => a.name.localeCompare(b.name, 'fa'))

const load = async () => {
  loading.value = true
  try {
    const res = await app.$api.contentAdmin.listBlogTags()
    tags.value = sortTags(res.data.data ?? [])
    error.value = null
    forbidden.value = false
  } catch (e) {
    tags.value = []
    forbidden.value = errorStatus(e) === 403
    error.value = forbidden.value ? null : e
  } finally {
    loading.value = false
  }
}

const newName = ref('')
const creating = ref(false)

const create = async () => {
  const name = newName.value.trim()
  if (!name || creating.value) return
  creating.value = true
  try {
    const res = await app.$api.contentAdmin.createBlogTag({ data: { name } })
    tags.value = sortTags([...tags.value, res.data.data])
    newName.value = ''
    toast.success('برچسب افزوده شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'افزودن برچسب ناموفق بود'))
  } finally {
    creating.value = false
  }
}

const editingId = ref(null)
const editName = ref('')
const savingId = ref(null)

const startEdit = (tag) => {
  editingId.value = tag.id
  editName.value = tag.name
}

const cancelEdit = () => {
  editingId.value = null
  editName.value = ''
}

const saveEdit = async (tag) => {
  const name = editName.value.trim()
  if (!name || savingId.value !== null) return
  if (name === tag.name) return cancelEdit()
  savingId.value = tag.id
  try {
    const res = await app.$api.contentAdmin.updateBlogTag(tag.id, { data: { name } })
    tags.value = sortTags(tags.value.map((row) => (row.id === tag.id ? res.data.data : row)))
    cancelEdit()
    toast.success('برچسب ذخیره شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'ذخیره برچسب ناموفق بود'))
  } finally {
    savingId.value = null
  }
}

const deleteTarget = ref(null)
const deleting = ref(false)

const confirmDelete = async () => {
  const tag = deleteTarget.value
  if (!tag) return
  deleting.value = true
  try {
    await app.$api.contentAdmin.deleteBlogTag(tag.id)
    tags.value = tags.value.filter((row) => row.id !== tag.id)
    deleteTarget.value = null
    toast.success('برچسب حذف شد')
  } catch (e) {
    toast.error(apiErrorMessage(e, 'حذف برچسب ناموفق بود'))
  } finally {
    deleting.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
