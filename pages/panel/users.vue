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
              {{ totalCount.toLocaleString('fa-IR') }} کاربر در سیستم
            </p>
          </div>
        </div>
        <UButton
          v-if="canCreate"
          color="primary"
          icon="i-heroicons-plus"
          size="lg"
          @click="showCreateModal = true"
        >
          افزودن کاربر
        </UButton>
      </div>

      <UsersFilters
        v-model:search-query="searchQuery"
        v-model:role-filter="roleFilter"
        v-model:status-filter="statusFilter"
        :role-filter-items="roleFilterItems"
        :status-filter-items="statusFilterItems"
      />
      <UsersTable
        :users="paginatedUsers"
        :pending="pending"
        :page-size="pageSize"
        :can-update="canUpdate"
        :can-delete="canDelete"
        @edit="onEdit"
        @deactivate="onDeactivate"
        @delete="onDelete"
      />
    </UCard>

    <div v-if="totalCount > pageSize" class="flex justify-center">
      <UPagination
        v-model:page="currentPage"
        :total="totalCount"
        :items-per-page="pageSize"
      />
    </div>

    <CreateUserModal
      v-model:open="showCreateModal"
      :role-select-items="realRoleSelectItems"
      :loading="creatingUser"
      @create="onCreateUser"
    />

    <EditUserModal
      v-model:open="showEditModal"
      :user="selectedUser"
      :role-select-items="roleSelectItems"
      @save="onSaveUser"
    />

    <DeleteConfirmDialog
      v-model:open="showDeleteModal"
      title="حذف کاربر"
      message="آیا از حذف این کاربر مطمئن هستید؟ این عملیات قابل بازگشت نیست."
      :item-name="userToDelete?.fullName"
      @confirm="confirmDelete"
    />
  </div>
</template>

<script setup>
import UsersFilters from '@/components/panel/users/UsersFilters.vue'
import UsersTable from '@/components/panel/users/UsersTable.vue'
import CreateUserModal from '@/components/panel/users/CreateUserModal.vue'
import EditUserModal from '@/components/panel/users/EditUserModal.vue'
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت کاربران | پنل مدیریت' })

const rolesStore = useRolesStore()
const { getUserRole } = useUserPanelTabs()
const app = useNuxtApp()
const toast = useToast()

const myPerms = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.users
})
const canCreate = computed(() => myPerms.value?.create ?? false)
const canUpdate = computed(() => myPerms.value?.update ?? false)
const canDelete = computed(() => myPerms.value?.delete ?? false)

const getRolePermissions = (roleId) => {
  const role = rolesStore.roles.find((r) => r.id === roleId)
  if (!role) {
    return {
      users: { create: false, read: true, update: false, delete: false },
      products: { create: false, read: true, update: false, delete: false },
      orders: { create: false, read: true, update: false, delete: false },
    }
  }
  return {
    users: { ...role.permissions.users },
    products: { ...role.permissions.products },
    orders: { ...role.permissions.orders },
  }
}

const allUsers = ref([])

const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 10
const pending = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref(null)
const userToDelete = ref(null)

const roleFilterItems = computed(() => [
  { label: 'همه نقش‌ها', value: 'all' },
  ...rolesStore.roles.map((r) => ({ label: r.labelFa, value: r.id })),
])

const statusFilterItems = [
  { label: 'همه وضعیت‌ها', value: 'all' },
  { label: 'فعال', value: 'active' },
  { label: 'غیرفعال', value: 'inactive' },
]

const roleSelectItems = computed(() =>
  rolesStore.roles.map((r) => ({ label: r.labelFa, value: r.id }))
)

// real tenant roles from BACK — used to label the real staff list below and to feed the
// create-user flow's role picker; users.vue's permission/filter logic still runs on the
// separate mock `rolesStore` model (see FRONTEND_API_TODO.md)
const realRoles = ref([])
const creatingUser = ref(false)

// BACK's real role-name space has no fixed tiers below "store admin" (see
// composables/useUserPanelTabs.js's same mapping) — this mirrors that heuristic so a
// fetched staff row's permissions/badge color at least degrade consistently with the rest
// of the mock-driven page, rather than matching nothing.
const mapStaffRoleId = (roleNames) =>
  roleNames?.includes('ROLE_STORE_ADMIN') ? 'owner' : 'admin'

const resolveRoleFa = (roleNames, mappedRoleId) => {
  const backendRoleName = roleNames?.[0]
  const matchedRealRole = realRoles.value.find((r) => r.name === backendRoleName)
  if (matchedRealRole) return matchedRealRole.description || matchedRealRole.name
  return rolesStore.roles.find((r) => r.id === mappedRoleId)?.labelFa || backendRoleName || ''
}

const mapStaffUser = (user) => {
  const roleId = mapStaffRoleId(user.roles)
  return {
    id: user.id,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' '),
    phone: user.phone,
    roleId,
    roleFa: resolveRoleFa(user.roles, roleId),
    isActive: user.active ?? true,
    lastLoginFa: user.lastLoginAt
      ? new Date(user.lastLoginAt).toLocaleDateString('fa-IR')
      : 'هرگز',
    permissions: getRolePermissions(roleId),
  }
}

const fetchUsers = async () => {
  pending.value = true
  try {
    const response = await app.$api.user.listStaff()
    allUsers.value = (response.data.data ?? []).map(mapStaffUser)
  } catch (error) {
    toast.add({
      title: 'خطا',
      description: error?.response?.data?.message || 'مشکلی در دریافت لیست کاربران پیش آمد',
      color: 'error',
    })
  } finally {
    pending.value = false
  }
}

onMounted(async () => {
  try {
    const response = await app.$api.user.listRoles()
    realRoles.value = response.data.data ?? []
  } catch {
    realRoles.value = []
  }
  // fetched after roles resolve so the first render's roleFa labels are already resolved
  await fetchUsers()
})

const realRoleSelectItems = computed(() =>
  realRoles.value.map((r) => ({ label: r.description || r.name, value: r.id }))
)

const filteredUsers = computed(() => {
  let result = allUsers.value
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.trim()
    result = result.filter((u) => u.fullName.includes(q) || u.phone.includes(q))
  }
  if (roleFilter.value !== 'all') {
    result = result.filter((u) => u.roleId === roleFilter.value)
  }
  if (statusFilter.value === 'active') result = result.filter((u) => u.isActive)
  if (statusFilter.value === 'inactive')
    result = result.filter((u) => !u.isActive)
  return result
})

const totalCount = computed(() => filteredUsers.value.length)

const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredUsers.value.slice(start, start + pageSize)
})

watch([searchQuery, roleFilter, statusFilter], () => {
  currentPage.value = 1
})

const onEdit = (user) => {
  selectedUser.value = user
  showEditModal.value = true
}

const onSaveUser = (updated) => {
  const idx = allUsers.value.findIndex((u) => u.id === updated.id)
  if (idx !== -1) allUsers.value[idx] = updated
}

const onDeactivate = (user) => {
  const found = allUsers.value.find((u) => u.id === user.id)
  if (found) found.isActive = !found.isActive
}

const onDelete = (user) => {
  userToDelete.value = user
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (userToDelete.value) {
    allUsers.value = allUsers.value.filter((u) => u.id !== userToDelete.value.id)
  }
  showDeleteModal.value = false
  userToDelete.value = null
}

const onCreateUser = async (form) => {
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
    toast.add({ title: 'موفق', description: 'کاربر جدید با موفقیت ایجاد شد', color: 'success' })
    await fetchUsers()
  } catch (error) {
    toast.add({
      title: 'خطا',
      description: error?.response?.data?.message || 'مشکلی در ایجاد کاربر پیش آمد',
      color: 'error',
    })
  } finally {
    creatingUser.value = false
  }
}
</script>
