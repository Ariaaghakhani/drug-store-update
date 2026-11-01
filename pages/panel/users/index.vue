<template>
  <div class="space-y-5">
    <UCard :ui="{ body: 'p-0' }">
      <div
        class="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-gray-100 dark:border-gray-800"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0"
          >
            <UIcon
              name="i-heroicons-users"
              class="w-5 h-5 text-brand-500 dark:text-brand-400"
            />
          </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 dark:text-white">
              مدیریت <span class="text-brand-500">کاربران</span>
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ totalCount.toLocaleString('fa-IR') }} کاربر
            </p>
          </div>
        </div>
        <UButton
          color="primary"
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
        >
          افزودن کارمند
        </UButton>
      </div>

      <UsersFilters
        v-model:search-query="searchQuery"
        v-model:type-filter="typeFilter"
        v-model:active-filter="activeFilter"
        v-model:locked-filter="lockedFilter"
      />
      <UsersTable
        :users="users"
        :pending="pending"
        :page-size="PAGE_SIZE"
        @roles="onEditRoles"
        @set-active="onSetActive"
        @set-locked="onSetLocked"
      />
    </UCard>

    <div v-if="totalCount > PAGE_SIZE" class="flex justify-center">
      <UPagination
        v-model:page="currentPage"
        :total="totalCount"
        :items-per-page="PAGE_SIZE"
      />
    </div>

    <CreateUserModal
      v-model:open="showCreateModal"
      :role-select-items="staffRoleItems"
      :loading="creatingUser"
      @create="onCreateUser"
    />

    <UserRolesModal
      v-model:open="showRolesModal"
      :user="selectedUser"
      :role-items="staffRoleItems"
      :initial-role-ids="staffRoleIdsOf(selectedUser)"
      :loading="savingRoles"
      @save="onSaveRoles"
    />
  </div>
</template>

<script setup>
import UsersFilters from '@/components/panel/users/UsersFilters.vue'
import UsersTable from '@/components/panel/users/UsersTable.vue'
import CreateUserModal from '@/components/panel/users/CreateUserModal.vue'
import UserRolesModal from '@/components/panel/users/UserRolesModal.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت کاربران | پنل مدیریت' })

const PAGE_SIZE = 20
const SEARCH_DELAY_MS = 300

const app = useNuxtApp()
const toast = useAppToast()
const { staffRoleItems, staffRoleIdsOf, loadRoles, mapUser, setActive, setLocked, setRoles } = useManagedUsers()

const users = ref([])
const totalCount = ref(0)
const pending = ref(true)
const currentPage = ref(1) // UPagination is 1-based; BACK is 0-based

const searchQuery = ref('')
const typeFilter = ref('ALL')
const activeFilter = ref('all')
const lockedFilter = ref('all')

// Only the latest request may fill the table: a slow older search must not overwrite a newer one
let latestRequest = 0

async function fetchUsers() {
  const request = ++latestRequest
  pending.value = true
  try {
    const params = { page: currentPage.value - 1, size: PAGE_SIZE, type: typeFilter.value }
    const q = searchQuery.value.trim()
    if (q) params.q = q
    if (activeFilter.value !== 'all') params.active = activeFilter.value
    if (lockedFilter.value !== 'all') params.locked = lockedFilter.value

    const response = await app.$api.user.searchManagedUsers({ params })
    if (request !== latestRequest) return
    const page = response.data.data
    users.value = (page?.content ?? []).map(mapUser)
    totalCount.value = page?.totalElements ?? 0
  } catch (error) {
    if (request !== latestRequest) return
    users.value = []
    totalCount.value = 0
    toast.error('دریافت لیست کاربران ناموفق بود', error?.response?.data?.message)
  } finally {
    if (request === latestRequest) pending.value = false
  }
}

const reloadFromFirstPage = () => {
  if (currentPage.value === 1) fetchUsers()
  else currentPage.value = 1
}

let searchTimer = null
watch(searchQuery, () => {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(reloadFromFirstPage, SEARCH_DELAY_MS)
})
watch([typeFilter, activeFilter, lockedFilter], reloadFromFirstPage)
watch(currentPage, () => fetchUsers())
onBeforeUnmount(() => clearTimeout(searchTimer))

onMounted(async () => {
  // Roles first, so the first render's role labels are already resolved
  await loadRoles()
  await fetchUsers()
})

const replaceUser = (updated) => {
  if (!updated) return
  const index = users.value.findIndex((user) => user.id === updated.id)
  if (index !== -1) users.value[index] = updated
}

const onSetActive = async (user, active) => replaceUser(await setActive(user, active))
const onSetLocked = async (user, locked) => replaceUser(await setLocked(user, locked))

// ---------- roles ----------
const showRolesModal = ref(false)
const savingRoles = ref(false)
const selectedUser = ref(null)

const onEditRoles = (user) => {
  selectedUser.value = user
  showRolesModal.value = true
}

async function onSaveRoles(roleIds) {
  savingRoles.value = true
  const updated = await setRoles(selectedUser.value, roleIds)
  savingRoles.value = false
  if (!updated) return
  replaceUser(updated)
  showRolesModal.value = false
}

// ---------- create (staff) ----------
const showCreateModal = ref(false)
const creatingUser = ref(false)

async function onCreateUser(form) {
  const [firstName, ...rest] = form.fullName.trim().split(/\s+/)
  const lastName = rest.join(' ') || undefined

  creatingUser.value = true
  try {
    await app.$api.user.createStaff({
      data: {
        firstName,
        lastName,
        phone: form.phone,
        password: form.password,
        roleIds: [form.roleId],
      },
    })
    showCreateModal.value = false
    toast.success('کارمند جدید ایجاد شد')
    reloadFromFirstPage()
  } catch (error) {
    toast.error('ایجاد کارمند ناموفق بود', error?.response?.data?.message)
  } finally {
    creatingUser.value = false
  }
}
</script>
