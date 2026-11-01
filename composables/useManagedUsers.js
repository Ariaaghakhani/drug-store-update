// composables/useManagedUsers.js
// Shared by the users list and user detail pages: BACK's /api/users/* (ManagedUserDTO) → the shape they render, the
// tenant roles behind the role pickers, and the account actions. BACK enforces who may do what, so a refused action
// just shows its translated message.
const CUSTOMER_ROLE = 'ROLE_CUSTOMER'
const STORE_ADMIN_ROLE = 'ROLE_STORE_ADMIN'
const BUILT_IN_ROLE_LABELS = { [STORE_ADMIN_ROLE]: 'مدیر فروشگاه', [CUSTOMER_ROLE]: 'مشتری' }
const ROLE_BADGE_COLORS = { [STORE_ADMIN_ROLE]: 'warning', [CUSTOMER_ROLE]: 'success' }

const formatDateTime = (value) => {
  if (!value) return ''
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('fa-IR')
}

export const useManagedUsers = () => {
  const app = useNuxtApp()
  const toast = useAppToast()
  const roles = useState('managed-users-roles', () => [])

  async function loadRoles() {
    try {
      const response = await app.$api.user.listRoles()
      roles.value = response.data.data ?? []
    } catch {
      roles.value = []
    }
  }

  // The customer role can't be assigned: BACK keeps it on whoever has it
  const staffRoleItems = computed(() =>
    roles.value
      .filter((role) => role.name !== CUSTOMER_ROLE)
      .map((role) => ({ label: role.description || BUILT_IN_ROLE_LABELS[role.name] || role.name, value: role.id }))
  )

  const roleLabel = (name) => {
    const role = roles.value.find((item) => item.name === name)
    return BUILT_IN_ROLE_LABELS[name] || role?.description || name
  }

  const mapUser = (user) => ({
    ...user,
    fullName: [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username || user.phone || '',
    roleBadges: (user.roles ?? []).map((name) => ({
      name,
      label: roleLabel(name),
      color: ROLE_BADGE_COLORS[name] ?? 'info',
    })),
    isCustomer: (user.roles ?? []).includes(CUSTOMER_ROLE),
    isActive: user.active ?? true,
    isLocked: Boolean(user.accountLocked),
    lastLoginFa: formatDateTime(user.lastLoginAt) || 'هرگز',
  })

  // → the updated user, or null when BACK refused
  async function runAction(call, successTitle, failureTitle) {
    try {
      const response = await call()
      toast.success(successTitle)
      return mapUser(response.data.data)
    } catch (error) {
      toast.error(failureTitle, error?.response?.data?.message)
      return null
    }
  }

  const setActive = (user, active) =>
    runAction(
      () => (active ? app.$api.user.activateManagedUser : app.$api.user.deactivateManagedUser)({ data: { id: user.id } }),
      active ? 'حساب فعال شد' : 'حساب غیرفعال شد',
      'تغییر وضعیت حساب ناموفق بود'
    )

  const setLocked = (user, locked) =>
    runAction(
      () => (locked ? app.$api.user.lockManagedUser : app.$api.user.unlockManagedUser)({ data: { id: user.id } }),
      locked ? 'حساب قفل شد' : 'قفل حساب باز شد',
      'تغییر قفل حساب ناموفق بود'
    )

  const setRoles = (user, roleIds) =>
    runAction(
      () => app.$api.user.setManagedUserRoles({ data: { id: user.id, roleIds } }),
      'نقش‌های کاربر ذخیره شد',
      'ذخیره نقش‌ها ناموفق بود'
    )

  // The role ids behind a user's role names, for pre-filling the picker
  const staffRoleIdsOf = (user) =>
    roles.value
      .filter((role) => role.name !== CUSTOMER_ROLE && (user?.roles ?? []).includes(role.name))
      .map((role) => role.id)

  return { roles, staffRoleItems, staffRoleIdsOf, loadRoles, mapUser, setActive, setLocked, setRoles, formatDateTime }
}
