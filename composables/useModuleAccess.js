// Module read grants for panel screens. Reads userStore.permissions (BACK `{module, action}` pairs, allowed only).
// Empty or not loaded (null/[]) means "unknown": show the UI and let BACK answer with a 403 instead of hiding it.
export const useModuleAccess = () => {
  const userStore = useUserStore()

  const canRead = (module) => {
    const list = userStore.permissions
    if (!list?.length) return true
    return list.some((permission) => permission.module === module)
  }

  const canReadAny = (modules) => modules.some((module) => canRead(module))

  return { canRead, canReadAny }
}
