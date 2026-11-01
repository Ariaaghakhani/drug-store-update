<template>
  <div class="space-y-5">
    <UCard :ui="{ body: 'p-0' }">
      <div
        class="flex items-center justify-between gap-4 flex-wrap px-6 py-4 border-b border-gray-100 dark:border-gray-800"
      >
        <div class="flex items-center gap-3">
          <UButton
            to="/panel/users"
            color="neutral"
            variant="ghost"
            square
            icon="i-heroicons-arrow-right"
            aria-label="بازگشت به کاربران"
          />
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center bg-brand-100 dark:bg-brand-900/20 flex-shrink-0"
          >
            <UIcon name="i-heroicons-shield-check" class="w-5 h-5 text-brand-500 dark:text-brand-400" />
          </div>
          <div>
            <h1 class="text-lg font-black text-gray-900 dark:text-white">
              مدیریت <span class="text-brand-500">نقش‌ها</span>
            </h1>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {{ roles.length.toLocaleString('fa-IR') }} نقش
            </p>
          </div>
        </div>
        <UButton
          v-if="can.CREATE"
          color="primary"
          icon="i-heroicons-plus"
          size="lg"
          @click="openCreate"
        >
          ایجاد نقش
        </UButton>
      </div>

      <div class="relative">
        <Transition name="sk">
          <div v-if="pending" key="sk">
            <div
              v-for="i in 5"
              :key="i"
              class="flex items-center gap-5 px-6 py-4 border-b border-gray-100 dark:border-gray-800 last:border-0"
            >
              <USkeleton class="h-4 w-28 rounded" />
              <USkeleton class="h-4 w-36 rounded" />
              <USkeleton class="h-5 w-16 rounded-full" />
              <USkeleton class="h-8 w-16 rounded-lg ms-auto" />
            </div>
          </div>

          <div v-else key="data">
            <div v-if="roles.length > 0" class="overflow-x-auto">
              <table class="w-full">
                <thead>
                  <tr class="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام نقش</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نام فنی</th>
                    <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">نوع</th>
                    <th class="px-6 py-3" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="role in roles"
                    :key="role.id"
                    class="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    <td class="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {{ role.description || BUILT_IN_LABELS[role.name] || '—' }}
                    </td>
                    <td class="px-6 py-4">
                      <span class="text-xs font-mono text-gray-600 dark:text-gray-400" dir="ltr">{{ role.name }}</span>
                    </td>
                    <td class="px-6 py-4">
                      <UBadge :color="role.builtIn ? 'warning' : 'info'" variant="subtle" size="sm">
                        {{ role.builtIn ? 'پایه' : 'سفارشی' }}
                      </UBadge>
                    </td>
                    <td class="px-6 py-4">
                      <div class="flex items-center justify-end gap-1">
                        <UButton
                          variant="ghost"
                          color="neutral"
                          square
                          size="xs"
                          icon="i-heroicons-pencil-square"
                          aria-label="ویرایش نقش"
                          @click="openEdit(role)"
                        />
                        <UButton
                          v-if="can.DELETE && !role.builtIn"
                          variant="ghost"
                          color="error"
                          square
                          size="xs"
                          icon="i-heroicons-trash"
                          aria-label="حذف نقش"
                          @click="askDelete(role)"
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-else class="flex flex-col items-center justify-center py-16 gap-3">
              <UIcon
                :name="forbidden ? 'i-heroicons-lock-closed' : 'i-heroicons-shield-check'"
                class="w-16 h-16 text-gray-300 dark:text-gray-700"
              />
              <p class="text-base font-bold text-gray-900 dark:text-white">
                {{ forbidden ? 'دسترسی به نقش‌ها ندارید' : 'نقشی یافت نشد' }}
              </p>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ forbidden ? 'فقط مدیر ارشد می‌تواند نقش‌ها را مدیریت کند' : 'اولین نقش را بسازید' }}
              </p>
              <UButton v-if="!forbidden && can.CREATE" color="primary" icon="i-heroicons-plus" @click="openCreate">
                ایجاد نقش
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </UCard>

    <p class="text-xs text-gray-500 dark:text-gray-400 px-1">
      نقش تازه در ابتدا هیچ دسترسی ندارد؛ نام و دسترسی‌های هر نقش را از دکمه ویرایش همان ردیف تنظیم کنید.
    </p>

    <RoleModal v-model:open="showRoleModal" :role="editingRole" @saved="fetchRoles" />

    <DeleteConfirmDialog
      v-model:open="showDeleteDialog"
      title="حذف نقش"
      message="با حذف نقش، کاربرانی که فقط این نقش را دارند دسترسی خود را از دست می‌دهند. این عملیات قابل بازگشت نیست."
      :item-name="deletingRole?.description || deletingRole?.name"
      @confirm="onDelete"
    />
  </div>
</template>

<script setup>
import RoleModal from '@/components/panel/users/RoleModal.vue'
import DeleteConfirmDialog from '@/components/panel/DeleteConfirmDialog.vue'

definePageMeta({ layout: 'panel' })
useHead({ title: 'مدیریت نقش‌ها | پنل مدیریت' })

// BACK refuses to rename or delete these (RoleServiceImpl.rejectBuiltIn); shown locked instead of failing on click
const BUILT_IN_LABELS = {
  ROLE_STORE_ADMIN: 'مدیر فروشگاه',
  ROLE_CUSTOMER: 'مشتری',
  ROLE_SUPER_USER: 'مدیر ارشد',
  ROLE_MANAGER: 'مدیر',
}

const app = useNuxtApp()
const toast = useAppToast()

const roles = ref([])
const pending = ref(true)
const forbidden = ref(false)

// Write buttons need ROLE grants, which the READ-only grants in userStore don't carry. If the check fails the buttons
// stay visible and BACK has the final word.
const can = reactive({ CREATE: true, UPDATE: true, DELETE: true })

async function fetchGrants() {
  try {
    const response = await app.$api.auth.getMyPermissions({
      data: { allowed: true, modules: ['ROLE'], actions: ['CREATE', 'UPDATE', 'DELETE'] },
    })
    const grants = (response.data.data ?? []).filter((grant) => grant.allowed !== false)
    for (const action of Object.keys(can)) {
      can[action] = grants.some((grant) => grant.action === action)
    }
  } catch {
    // keep everything visible
  }
}

async function fetchRoles() {
  pending.value = true
  forbidden.value = false
  try {
    const response = await app.$api.user.listRoles()
    roles.value = (response.data.data ?? []).map((role) => ({
      ...role,
      builtIn: Object.hasOwn(BUILT_IN_LABELS, role.name),
    }))
  } catch (error) {
    roles.value = []
    if (error?.response?.status === 403) forbidden.value = true
    else toast.error('دریافت نقش‌ها ناموفق بود', error?.response?.data?.message)
  } finally {
    pending.value = false
  }
}

onMounted(() => {
  fetchGrants()
  fetchRoles()
})

// ---------- create / edit ----------
// The modal saves the role and its access itself and says `saved`; the page only reloads the list
const showRoleModal = ref(false)
const editingRole = ref(null)

const openCreate = () => {
  editingRole.value = null
  showRoleModal.value = true
}

const openEdit = (role) => {
  editingRole.value = role
  showRoleModal.value = true
}

// ---------- delete ----------
const showDeleteDialog = ref(false)
const deletingRole = ref(null)

const askDelete = (role) => {
  deletingRole.value = role
  showDeleteDialog.value = true
}

async function onDelete() {
  try {
    await app.$api.user.deleteRole({ data: { id: deletingRole.value.id } })
    toast.success('نقش حذف شد')
    showDeleteDialog.value = false
    await fetchRoles()
  } catch (error) {
    toast.error('حذف نقش ناموفق بود', error?.response?.data?.message)
  }
}
</script>

<style scoped>
.sk-enter-active,
.sk-leave-active {
  transition: opacity 0.2s ease;
}
.sk-enter-from,
.sk-leave-to {
  opacity: 0;
}
.sk-leave-active {
  position: absolute;
  inset: 0;
}
</style>
