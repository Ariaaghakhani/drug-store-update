<template>
  <div class="space-y-5">
    <div class="flex items-center justify-between gap-4 flex-wrap">
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

    <UCard :ui="{ body: 'p-0' }">
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
      :role-select-items="roleSelectItems"
      @create="onCreateUser"
    />

    <EditUserModal
      v-model:open="showEditModal"
      :user="selectedUser"
      :role-select-items="roleSelectItems"
      @save="onSaveUser"
    />
  </div>
</template>

<script setup lang="ts">
import type { PanelUser, CreateUserForm } from '@/types/panel-users'
import type { RolePermissions } from '@/stores/roles'
import UsersFilters from '@/components/panel/users/UsersFilters.vue'
import UsersTable from '@/components/panel/users/UsersTable.vue'
import CreateUserModal from '@/components/panel/users/CreateUserModal.vue'
import EditUserModal from '@/components/panel/users/EditUserModal.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت کاربران | پنل مدیریت' })

const rolesStore = useRolesStore()
const { getUserRole } = useUserPanelTabs()

const myPerms = computed(() => {
  const role = rolesStore.roles.find((r) => r.id === getUserRole())
  return role?.permissions.users
})
const canCreate = computed(() => myPerms.value?.create ?? false)
const canUpdate = computed(() => myPerms.value?.update ?? false)
const canDelete = computed(() => myPerms.value?.delete ?? false)

const getRolePermissions = (roleId: string): RolePermissions => {
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

const allUsers = ref<PanelUser[]>([
  {
    id: 1,
    fullName: 'رضا حسینی',
    phone: '09121000001',
    roleId: 'owner',
    roleFa: 'مالک',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۵',
    permissions: getRolePermissions('owner'),
  },
  {
    id: 2,
    fullName: 'آرش محمدی',
    phone: '09121000002',
    roleId: 'admin',
    roleFa: 'مدیر',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۵',
    permissions: getRolePermissions('admin'),
  },
  {
    id: 3,
    fullName: 'نیلوفر احمدی',
    phone: '09351000003',
    roleId: 'pharmacist',
    roleFa: 'داروساز',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۲',
    permissions: getRolePermissions('pharmacist'),
  },
  {
    id: 4,
    fullName: 'فاطمه موسوی',
    phone: '09181000004',
    roleId: 'support',
    roleFa: 'پشتیبانی',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۴',
    permissions: getRolePermissions('support'),
  },
  {
    id: 5,
    fullName: 'سارا رضایی',
    phone: '09351000005',
    roleId: 'pharmacist',
    roleFa: 'داروساز',
    isActive: false,
    lastLoginFa: '۱۴۰۳/۰۲/۳۰',
    permissions: getRolePermissions('pharmacist'),
  },
  {
    id: 6,
    fullName: 'مهدی کریمی',
    phone: '09101000006',
    roleId: 'customer',
    roleFa: 'مشتری',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۳',
    permissions: getRolePermissions('customer'),
  },
  {
    id: 7,
    fullName: 'زهرا قاسمی',
    phone: '09191000007',
    roleId: 'customer',
    roleFa: 'مشتری',
    isActive: true,
    lastLoginFa: '۱۴۰۳/۰۳/۱۰',
    permissions: getRolePermissions('customer'),
  },
  {
    id: 8,
    fullName: 'امیر صادقی',
    phone: '09361000008',
    roleId: 'customer',
    roleFa: 'مشتری',
    isActive: false,
    lastLoginFa: '۱۴۰۳/۰۳/۰۱',
    permissions: getRolePermissions('customer'),
  },
])

const searchQuery = ref('')
const roleFilter = ref('all')
const statusFilter = ref('all')
const currentPage = ref(1)
const pageSize = 5
const pending = ref(false)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const selectedUser = ref<PanelUser | null>(null)

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

const onEdit = (user: PanelUser) => {
  selectedUser.value = user
  showEditModal.value = true
}

const onSaveUser = (updated: PanelUser) => {
  const idx = allUsers.value.findIndex((u) => u.id === updated.id)
  if (idx !== -1) allUsers.value[idx] = updated
}

const onDeactivate = (user: PanelUser) => {
  const found = allUsers.value.find((u) => u.id === user.id)
  if (found) found.isActive = !found.isActive
}

const onDelete = (user: PanelUser) => {
  allUsers.value = allUsers.value.filter((u) => u.id !== user.id)
}

const onCreateUser = (form: CreateUserForm) => {
  const role = rolesStore.roles.find((r) => r.id === form.roleId)
  allUsers.value.unshift({
    id: Date.now(),
    fullName: form.fullName,
    phone: form.phone,
    roleId: form.roleId,
    roleFa: role?.labelFa ?? '',
    isActive: form.isActive,
    lastLoginFa: '—',
    permissions: getRolePermissions(form.roleId),
  })
  showCreateModal.value = false
}
</script>
