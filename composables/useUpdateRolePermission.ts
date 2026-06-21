import type { RolePermissions, Permission } from '@/stores/roles'

export const useUpdateRolePermission = () => {
  const rolesStore = useRolesStore()

  const updatePermission = (
    roleId: string,
    domain: keyof RolePermissions,
    action: keyof Permission,
    value: boolean,
  ) => {
    rolesStore.updatePermission(roleId, domain, action, value)
    syncToApi(roleId, domain, action, value)
  }

  const syncToApi = async (
    _roleId: string,
    _domain: keyof RolePermissions,
    _action: keyof Permission,
    _value: boolean,
  ) => {}

  return { updatePermission }
}