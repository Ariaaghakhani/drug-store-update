<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-3xl p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana max-h-[85vh]" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon name="i-heroicons-shield-check" class="w-4 h-4 text-brand-500" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
            {{ isEdit ? 'ویرایش نقش' : 'ایجاد نقش جدید' }}
          </h3>
          <button
            class="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="بستن"
            @click="emit('update:open', false)"
          >
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto">
          <div class="px-5 py-5 grid gap-4 sm:grid-cols-2">
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام فارسی نقش</label>
              <UInput v-model="form.description" placeholder="مثال: صندوقدار" maxlength="200" class="w-full" />
            </div>
            <div class="space-y-1.5">
              <label class="text-xs font-medium text-gray-700 dark:text-gray-300">نام فنی (انگلیسی)</label>
              <UInput
                v-model="form.name"
                placeholder="ROLE_CASHIER"
                dir="ltr"
                :disabled="role?.builtIn"
                class="w-full"
                :color="nameError ? 'error' : undefined"
              />
              <p v-if="nameError" class="text-xs text-error">{{ nameError }}</p>
              <p v-else-if="role?.builtIn" class="text-xs text-gray-500 dark:text-gray-400">نام نقش‌های پایه تغییر نمی‌کند.</p>
              <p v-else class="text-xs text-gray-500 dark:text-gray-400">
                فقط حرف انگلیسی، عدد و _ ؛ پیشوند ROLE_ و حروف بزرگ خودکار اضافه می‌شود.
              </p>
            </div>
          </div>

          <div class="px-5 pb-5 space-y-3">
            <div class="flex items-center gap-3">
              <h4 class="text-sm font-semibold text-gray-900 dark:text-white">دسترسی‌ها</h4>
              <UInput
                v-model="search"
                icon="i-heroicons-magnifying-glass"
                placeholder="جستجوی بخش..."
                class="flex-1 max-w-xs ms-auto"
              />
            </div>

            <div class="relative min-h-48">
              <Transition name="sk">
                <div v-if="loading" key="sk" class="space-y-3">
                  <div v-for="i in 6" :key="i" class="flex items-center gap-4">
                    <USkeleton class="h-4 w-32 rounded" />
                    <USkeleton class="h-5 w-5 rounded ms-auto" />
                    <USkeleton class="h-5 w-5 rounded" />
                    <USkeleton class="h-5 w-5 rounded" />
                    <USkeleton class="h-5 w-5 rounded" />
                    <USkeleton class="h-5 w-5 rounded" />
                  </div>
                </div>

                <div v-else-if="failed" key="failed" class="flex flex-col items-center justify-center py-12 gap-3">
                  <UIcon name="i-heroicons-lock-closed" class="w-16 h-16 text-gray-300 dark:text-gray-700" />
                  <p class="text-base font-bold text-gray-900 dark:text-white">دریافت دسترسی‌ها ناموفق بود</p>
                  <p class="text-sm text-gray-500 dark:text-gray-400">{{ failMessage }}</p>
                  <UButton color="neutral" variant="outline" @click="loadAccess">تلاش دوباره</UButton>
                </div>

                <table v-else key="data" class="w-full">
                  <thead>
                    <tr class="border-b border-gray-100 dark:border-gray-800">
                      <th class="text-start text-xs font-medium text-gray-500 dark:text-gray-400 py-2">بخش</th>
                      <th
                        v-for="action in ACTIONS"
                        :key="action.value"
                        class="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-2 w-16"
                      >
                        {{ action.label }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="mod in visibleModules"
                      :key="mod.name"
                      class="border-b border-gray-100 dark:border-gray-800 last:border-0"
                    >
                      <td class="py-2.5 pe-3">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">{{ moduleLabel(mod.name) }}</p>
                        <p class="text-xs font-mono text-gray-400 dark:text-gray-500" dir="ltr">{{ mod.name }}</p>
                      </td>
                      <td v-for="action in ACTIONS" :key="action.value" class="text-center py-2.5">
                        <UCheckbox
                          v-if="mod.cells[action.value]?.length"
                          :model-value="cellState(mod, action.value)"
                          :disabled="saving"
                          :aria-label="`${action.label} ${moduleLabel(mod.name)}`"
                          class="justify-center"
                          @update:model-value="toggleCell(mod, action.value)"
                        />
                        <span v-else class="text-gray-300 dark:text-gray-700">—</span>
                      </td>
                    </tr>
                    <tr v-if="!visibleModules.length">
                      <td :colspan="ACTIONS.length + 1" class="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        بخشی یافت نشد
                      </td>
                    </tr>
                  </tbody>
                </table>
              </Transition>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3 px-5 py-4 border-t border-gray-100 dark:border-gray-800">
          <p class="flex-1 text-xs text-gray-500 dark:text-gray-400">
            <template v-if="accessChangeCount">{{ accessChangeCount.toLocaleString('fa-IR') }} تغییر دسترسی ذخیره‌نشده · </template>
            فقط دسترسی‌هایی را می‌توانید بدهید که خودتان دارید.
          </p>
          <UButton variant="soft" color="neutral" :disabled="saving" @click="emit('update:open', false)">انصراف</UButton>
          <UButton color="primary" :loading="saving" :disabled="!canSubmit" @click="save">
            {{ isEdit ? 'ذخیره' : 'ایجاد نقش' }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
// Create or edit a role together with its access, in one modal: the name fields on top, then a module × action grid
// where one tick grants or revokes every endpoint of that module with that action. Like ChangePasswordModal it makes
// its own API calls and reports back with `saved` once done.
const NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_]{1,59}$/

const ACTIONS = [
  { value: 'READ', label: 'مشاهده' },
  { value: 'CREATE', label: 'ایجاد' },
  { value: 'UPDATE', label: 'ویرایش' },
  { value: 'DELETE', label: 'حذف' },
  { value: 'ACTION', label: 'ویژه' },
]

const MODULE_LABELS = {
  DASHBOARD: 'داشبورد',
  USER_MANAGEMENT: 'مدیریت کاربران',
  ROLE: 'نقش‌ها',
  SECURITY: 'دسترسی‌ها',
  GOODS: 'محصولات',
  INVENTORY: 'موجودی',
  WAREHOUSE: 'انبار',
  ORDER: 'سفارشات',
  TICKET: 'تیکت‌ها',
}
const moduleLabel = (name) => MODULE_LABELS[name] || name

const props = defineProps({
  open: { type: Boolean, required: true },
  // null = create; otherwise the role being edited ({id, name, description, type, builtIn})
  role: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const app = useNuxtApp()
const toast = useAppToast()

const isEdit = computed(() => Boolean(props.role))
const form = reactive({ name: '', description: '' })
const search = ref('')
const saving = ref(false)

const loading = ref(false)
const failed = ref(false)
const failMessage = ref('')

// modules: [{name, cells: {READ: [endpointId, ...], ...}}]
const modules = ref([])
// endpointPermissionId → role-endpoint row id, as loaded; the baseline the draft is compared with
const original = ref(new Map())
// endpoint ids the role should have after saving
const draft = ref(new Set())

// BACK answers the endpoint list with a bare array, the others with { data }
const listOf = (response) => (Array.isArray(response.data) ? response.data : (response.data?.data ?? []))

async function loadAccess() {
  loading.value = true
  failed.value = false
  try {
    const [endpointsResponse, grantsResponse] = await Promise.all([
      app.$api.user.listEndpointPermissions(),
      props.role
        ? app.$api.user.listRoleEndpointPermissions({ data: { id: props.role.id } })
        : Promise.resolve({ data: [] }),
    ])

    const byModule = new Map()
    for (const endpoint of listOf(endpointsResponse)) {
      if (!endpoint.module || !endpoint.action) continue
      if (!byModule.has(endpoint.module)) byModule.set(endpoint.module, { name: endpoint.module, cells: {} })
      ;(byModule.get(endpoint.module).cells[endpoint.action] ??= []).push(endpoint.id)
    }
    modules.value = [...byModule.values()].sort((a, b) => a.name.localeCompare(b.name))

    original.value = new Map(listOf(grantsResponse).map((grant) => [grant.endpointPermissionId, grant.id]))
    draft.value = new Set(original.value.keys())
  } catch (error) {
    failed.value = true
    failMessage.value = error?.response?.data?.message || 'اتصال به سرور برقرار نشد'
  } finally {
    loading.value = false
  }
}

watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen) return
    form.name = props.role?.name ?? ''
    form.description = props.role?.description ?? ''
    search.value = ''
    loadAccess()
  }
)

// ---------- name fields ----------
const normalizedName = computed(() => {
  const name = form.name.trim().toUpperCase()
  return !name || name.startsWith('ROLE_') ? name : `ROLE_${name}`
})

const nameError = computed(() => {
  if (!form.name.trim() || props.role?.builtIn) return ''
  return NAME_PATTERN.test(normalizedName.value) ? '' : 'نام فنی نامعتبر است'
})

const roleFields = computed(() => ({
  name: props.role?.builtIn ? props.role.name : normalizedName.value,
  description: form.description.trim(),
}))

const fieldsChanged = computed(
  () => roleFields.value.name !== props.role?.name || roleFields.value.description !== (props.role?.description ?? '')
)

// ---------- access grid ----------
const visibleModules = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return modules.value
  return modules.value.filter((mod) => mod.name.toLowerCase().includes(q) || moduleLabel(mod.name).includes(q))
})

// true = all ticked, 'indeterminate' = some, false = none
const cellState = (mod, action) => {
  const ids = mod.cells[action]
  const granted = ids.filter((id) => draft.value.has(id)).length
  if (granted === 0) return false
  return granted === ids.length ? true : 'indeterminate'
}

const toggleCell = (mod, action) => {
  const ids = mod.cells[action]
  const next = new Set(draft.value)
  const everyGranted = ids.every((id) => next.has(id))
  for (const id of ids) {
    if (everyGranted) next.delete(id)
    else next.add(id)
  }
  draft.value = next
}

const toGrant = computed(() => [...draft.value].filter((id) => !original.value.has(id)))
const toRevoke = computed(() => [...original.value.keys()].filter((id) => !draft.value.has(id)))
const accessChangeCount = computed(() => toGrant.value.length + toRevoke.value.length)

// ---------- save ----------
const canSubmit = computed(() => {
  if (!form.description.trim() || !form.name.trim() || nameError.value) return false
  // The grid must have loaded, or the diff would be against nothing
  if (loading.value || failed.value) return false
  return isEdit.value ? fieldsChanged.value || accessChangeCount.value > 0 : true
})

// Returns how many revocations failed
async function applyAccess(roleId) {
  if (toGrant.value.length) {
    await app.$api.user.grantRoleEndpointsBulk({ data: { roleId, endpointPermissionIds: toGrant.value } })
  }
  // BACK has no bulk revoke; remove each row. Failures are counted so one bad row doesn't hide the rest.
  const results = await Promise.allSettled(
    toRevoke.value.map((endpointId) =>
      app.$api.user.removeEndpointFromRole({ data: { id: original.value.get(endpointId) } })
    )
  )
  return results.filter((result) => result.status === 'rejected').length
}

async function save() {
  saving.value = true
  let roleId = props.role?.id
  let roleSaved = false
  try {
    if (!isEdit.value) {
      const response = await app.$api.user.createRole({ data: roleFields.value })
      roleId = response.data.data.id
      roleSaved = true
    } else if (fieldsChanged.value) {
      await app.$api.user.updateRole({
        data: { id: roleId, roleDTO: { ...roleFields.value, type: props.role.type } },
      })
      roleSaved = true
    }

    const failedCount = await applyAccess(roleId)
    if (failedCount) {
      toast.error('بخشی از دسترسی‌ها برداشته نشد', `${failedCount.toLocaleString('fa-IR')} مورد ناموفق بود`)
      emit('saved')
      await loadAccess()
      return
    }
    toast.success(isEdit.value ? 'نقش ذخیره شد' : 'نقش جدید ایجاد شد')
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    // The role itself may already be saved when only the access step failed; refresh the list either way
    if (roleSaved) emit('saved')
    toast.error(
      roleSaved ? 'نقش ذخیره شد ولی دسترسی‌ها ذخیره نشد' : isEdit.value ? 'ذخیره نقش ناموفق بود' : 'ایجاد نقش ناموفق بود',
      error?.response?.data?.message
    )
    if (roleSaved) emit('update:open', false)
  } finally {
    saving.value = false
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
