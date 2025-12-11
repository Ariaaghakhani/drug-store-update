<template>
  <UDropdownMenu :items="[localeItems]" :popper="{ placement: 'bottom-end' }">
    <UButton
      color="gray"
      variant="ghost"
      :icon="currentLocaleIcon"
      trailing-icon="i-heroicons-chevron-down"
      size="sm"
    >
      {{ currentLocaleName }}
    </UButton>

    <template #item="{ item }">
      <div
        class="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium transition-colors"
        @click="switchLocale(item.code)"
      >
        <UIcon :name="item.icon" class="w-5 h-5" />
        <span>{{ item.label }}</span>
        <UIcon
          v-if="item.code === locale"
          name="i-heroicons-check"
          class="w-4 h-4 ms-auto text-teal-500"
        />
      </div>
    </template>
  </UDropdownMenu>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()

const currentLocale = computed(() =>
  (locales.value as any[]).find(l => l.code === locale.value)
)

const currentLocaleName = computed(() => currentLocale.value?.name || 'فارسی')

const currentLocaleIcon = computed(() => {
  return locale.value === 'fa' ? 'i-heroicons-language' : 'i-heroicons-globe-alt'
})

const localeItems = computed(() => ({
  label: 'زبان / Language',
  items: (locales.value as any[]).map(loc => ({
    label: loc.name,
    code: loc.code,
    icon: loc.code === 'fa' ? 'i-heroicons-language' : 'i-heroicons-globe-alt',
  }))
}))

const switchLocale = (newLocale: string) => {
  setLocale(newLocale)

  // Update HTML attributes
  const localeConfig = (locales.value as any[]).find(l => l.code === newLocale)
  if (typeof document !== 'undefined' && localeConfig) {
    document.documentElement.setAttribute('dir', localeConfig.dir || 'rtl')
    document.documentElement.setAttribute('lang', newLocale)
  }
}
</script>
