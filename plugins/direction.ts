export default defineNuxtPlugin(() => {
  const { locale, locales } = useI18n()

  const currentLocale = computed(() => {
    return (locales.value as any[]).find(l => l.code === locale.value)
  })

  const dir = computed(() => currentLocale.value?.dir || 'rtl')

  return {
    provide: {
      dir: {
        rtl: computed(() => dir.value === 'rtl'),
        ltr: computed(() => dir.value === 'ltr'),
        value: dir,
      }
    }
  }
})
