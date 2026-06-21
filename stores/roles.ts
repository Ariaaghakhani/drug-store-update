import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Permission {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface RolePermissions {
  users: Permission
  products: Permission
  orders: Permission
}

export interface Role {
  id: string
  labelFa: string
  description: string
  userCount: number
  permissions: RolePermissions
}

const allOn = (): Permission => ({ create: true, read: true, update: true, delete: true })
const readOnly = (): Permission => ({ create: false, read: true, update: false, delete: false })

export const useRolesStore = defineStore('roles', () => {
  const roles = ref<Role[]>([
    {
      id: 'owner',
      labelFa: 'مالک',
      description: 'دسترسی کامل به تمام بخش‌های سیستم',
      userCount: 1,
      permissions: { users: allOn(), products: allOn(), orders: allOn() },
    },
    {
      id: 'admin',
      labelFa: 'مدیر',
      description: 'مدیریت کاربران، محصولات و سفارش‌ها',
      userCount: 3,
      permissions: { users: allOn(), products: allOn(), orders: allOn() },
    },
    {
      id: 'pharmacist',
      labelFa: 'داروساز',
      description: 'تأیید نسخه‌ها و مدیریت موجودی دارویی',
      userCount: 5,
      permissions: {
        users: readOnly(),
        products: { create: true, read: true, update: true, delete: false },
        orders: { create: false, read: true, update: true, delete: false },
      },
    },
    {
      id: 'support',
      labelFa: 'پشتیبانی',
      description: 'پاسخ‌گویی به مشتریان و پیگیری سفارش‌ها',
      userCount: 8,
      permissions: {
        users: readOnly(),
        products: readOnly(),
        orders: { create: false, read: true, update: true, delete: false },
      },
    },
    {
      id: 'customer',
      labelFa: 'مشتری',
      description: 'خرید از فروشگاه و پیگیری سفارش شخصی',
      userCount: 1247,
      permissions: {
        users: { create: false, read: false, update: false, delete: false },
        products: readOnly(),
        orders: { create: true, read: true, update: false, delete: false },
      },
    },
  ])

  const updatePermission = (
    roleId: string,
    domain: keyof RolePermissions,
    action: keyof Permission,
    value: boolean,
  ) => {
    const role = roles.value.find((r) => r.id === roleId)
    if (role) {
      role.permissions[domain][action] = value
    }
  }

  return { roles, updatePermission }
})