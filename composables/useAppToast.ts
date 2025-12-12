// composables/useAppToast.ts
export const useAppToast = () => {
  const toast = useToast()

  const success = (title: string, description?: string, icon?: string) => {
    toast.add({
      title,
      description,
      color: 'primary',
      icon: icon || 'i-heroicons-check-circle',
    })
  }

  const error = (title: string, description?: string, icon?: string) => {
    toast.add({
      title,
      description,
      color: 'error',
      icon: icon || 'i-heroicons-x-circle',
    })
  }

  const info = (title: string, description?: string, icon?: string) => {
    toast.add({
      title,
      description,
      color: 'info',
      icon: icon || 'i-heroicons-information-circle',
    })
  }

  const warning = (title: string, description?: string, icon?: string) => {
    toast.add({
      title,
      description,
      color: 'warning',
      icon: icon || 'i-heroicons-exclamation-triangle',
    })
  }

  return {
    ...toast,
    success,
    error,
    info,
    warning,
  }
}
