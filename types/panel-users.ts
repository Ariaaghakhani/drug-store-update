import type { RolePermissions } from '@/stores/roles'

export interface PanelUser {
  id: number
  fullName: string
  phone: string
  roleId: string
  roleFa: string
  isActive: boolean
  lastLoginFa: string
  permissions: RolePermissions
}

export interface CreateUserForm {
  fullName: string
  phone: string
  roleId: string
  isActive: boolean
}