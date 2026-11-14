<template>
  <UModal :open="open" :ui="{ content: 'sm:max-w-md p-0 gap-0 overflow-hidden' }" @update:open="emit('update:open', $event)">
    <template #content>
      <div class="flex flex-col font-dana" dir="rtl">
        <div class="flex items-center gap-3 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div class="w-8 h-8 rounded-lg bg-brand-500/15 flex items-center justify-center flex-shrink-0">
            <UIcon :name="meta.icon" class="w-4 h-4 text-brand-500 dark:text-brand-400" />
          </div>
          <h3 class="flex-1 text-sm font-semibold text-gray-900 dark:text-white">
            {{ item ? `ویرایش ${meta.label}` : `افزودن ${meta.label}` }}
          </h3>
          <UButton
            color="neutral"
            variant="ghost"
            square
            icon="i-heroicons-x-mark"
            aria-label="بستن"
            @click="emit('update:open', false)"
          />
        </div>

        <div class="px-5 py-5 space-y-4">
          <UFormField :label="meta.nameLabel" required>
            <UInput v-model="form.name" :placeholder="meta.namePlaceholder" class="w-full" autofocus />
          </UFormField>

          <UFormField v-if="kind === 'category'" label="دسته والد" help="خالی = دسته اصلی">
            <USelectMenu
              v-model="form.parentId"
              :items="parentItems"
              value-key="value"
              placeholder="بدون والد (دسته اصلی)"
              class="w-full"
            />
          </UFormField>

          <UFormField v-if="kind !== 'category'" label="توضیحات">
            <UTextarea v-model="form.description" :rows="3" class="w-full" />
          </UFormField>

          <div v-if="kind === 'brand'" class="space-y-1.5">
            <p class="text-xs font-medium text-gray-700 dark:text-gray-300">لوگو</p>
            <div class="flex items-center gap-3">
              <button
                type="button"
                class="w-20 h-20 rounded-xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-500 hover:border-brand-500 hover:text-brand-500 dark:hover:border-brand-400 dark:hover:text-brand-400 transition-colors"
                :aria-label="logoUrl ? 'تعویض لوگو' : 'افزودن لوگو'"
                @click="fileInput?.click()"
              >
                <img v-if="logoUrl" :src="logoUrl" alt="" class="w-full h-full object-contain" />
                <UIcon v-else name="i-heroicons-photo" class="w-6 h-6" />
              </button>
              <div class="flex flex-col gap-1.5">
                <UButton color="neutral" variant="outline" size="sm" icon="i-heroicons-arrow-up-tray" @click="fileInput?.click()">
                  {{ logoUrl ? 'تعویض لوگو' : 'انتخاب لوگو' }}
                </UButton>
                <UButton v-if="logoUrl" color="error" variant="soft" size="sm" icon="i-heroicons-trash" @click="removeLogo">
                  حذف لوگو
                </UButton>
              </div>
              <input ref="fileInput" type="file" accept="image/*" class="hidden" @change="onLogoPicked" />
            </div>
          </div>
        </div>

        <div class="flex gap-3 px-5 pb-5">
          <UButton
            variant="soft"
            color="neutral"
            class="flex-1 justify-center"
            :disabled="saving"
            @click="emit('update:open', false)"
          >
            انصراف
          </UButton>
          <UButton
            color="primary"
            class="flex-1 justify-center"
            :loading="saving"
            :disabled="!form.name.trim()"
            @click="save"
          >
            ذخیره
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<script setup>
const props = defineProps({
  open: { type: Boolean, required: true },
  // 'category' | 'brand' | 'tag'
  kind: { type: String, required: true },
  // null = create
  item: { type: Object, default: null },
  // every PRODUCT category, for the parent picker
  categories: { type: Array, default: () => [] },
  // PRODUCT scope id; BACK requires it for a root category
  productScopeId: { type: Number, default: null },
})

const emit = defineEmits(['update:open', 'saved'])

const KIND_META = {
  category: { label: 'دسته‌بندی', icon: 'i-heroicons-squares-2x2', nameLabel: 'نام دسته', namePlaceholder: 'مثال: ویتامین و مکمل' },
  brand: { label: 'برند', icon: 'i-heroicons-building-storefront', nameLabel: 'نام برند', namePlaceholder: 'مثال: یوروویتال' },
  tag: { label: 'تگ', icon: 'i-heroicons-tag', nameLabel: 'نام تگ', namePlaceholder: 'مثال: پرفروش' },
}
// BACK's attachment owner for brand logos (BrandAttachmentOwner)
const BRAND_REFERENCE = 'Brand'

const app = useNuxtApp()
const toast = useAppToast()

const meta = computed(() => KIND_META[props.kind])
const form = reactive({ name: '', description: '', parentId: null })
const saving = ref(false)

const fileInput = ref(null)
const existingLogos = ref([])
// {url} kept, {file, url} picked, null removed
const logo = ref(null)
const logoUrl = computed(() => logo.value?.url ?? null)

// A category can't sit under itself; BACK also refuses its descendants (category.parent.cycle)
const parentItems = computed(() =>
  props.categories
    .filter((category) => category.id !== props.item?.id)
    .map((category) => ({ label: category.fullPath || category.name, value: category.id }))
)

watch(
  () => props.open,
  (open) => {
    if (!open) return
    form.name = props.item?.name ?? props.item?.title ?? ''
    form.description = props.item?.description ?? ''
    form.parentId = props.item?.parentId ?? null
    existingLogos.value = []
    logo.value = null
    if (props.kind === 'brand' && props.item) loadLogo(props.item.id)
  }
)

async function loadLogo(brandId) {
  try {
    const response = await app.$api.attachment.byReference({ data: { referenceType: BRAND_REFERENCE, referenceId: brandId } })
    existingLogos.value = response.data.data ?? []
    const current = existingLogos.value.find((attachment) => attachment.isPrimary) ?? existingLogos.value[0]
    if (current?.url && !logo.value) logo.value = { url: current.url }
  } catch {
    // no logo shown; saving still works
  }
}

function onLogoPicked(event) {
  const file = event.target.files?.[0]
  event.target.value = ''
  if (!file) return
  if (logo.value?.file) URL.revokeObjectURL(logo.value.url)
  logo.value = { file, url: URL.createObjectURL(file) }
}

function removeLogo() {
  if (logo.value?.file) URL.revokeObjectURL(logo.value.url)
  logo.value = null
}

function saveItem() {
  const name = form.name.trim()
  const description = form.description.trim()
  const editing = props.item

  if (props.kind === 'category') {
    const body = { name, parentId: form.parentId ?? null, sortOrder: editing?.sortOrder, code: editing?.code }
    // a root category needs its scope; a child takes the parent's
    if (!editing && !body.parentId) body.categoryScopeId = props.productScopeId
    return editing
      ? app.$api.catalog.updateCategory({ data: { id: editing.id, ...body } })
      : app.$api.catalog.createCategory({ data: body })
  }

  if (props.kind === 'brand') {
    // code is required and never changes; same rule as BACK's own import (CatalogServiceImpl.findOrCreateByTitle)
    return editing
      ? app.$api.catalog.updateCatalog({ data: { id: editing.id, title: name, description } })
      : app.$api.catalog.createCatalog({
          data: { type: 'BRAND', code: name.toUpperCase().replace(/ /g, '_'), title: name, description },
        })
  }

  // updateTag drops the tag from every product it isn't told about, so the current goodsIds go back
  const tagDTO = { name, description, goodsIds: editing?.goodsIds ?? [] }
  return editing
    ? app.$api.goods.updateTag({ data: { id: editing.id, tagDTO } })
    : app.$api.goods.createTag({ data: tagDTO })
}

async function saveLogo(brandId) {
  const keptLogo = logo.value && !logo.value.file
  if (keptLogo) return
  // one logo per brand: the old one goes whether it was replaced or removed
  await Promise.all(existingLogos.value.map((attachment) => app.$api.attachment.deleteAttachment({ data: { id: attachment.id } })))
  if (!logo.value?.file) return
  const formData = new FormData()
  formData.append('file', logo.value.file)
  formData.append('referenceType', BRAND_REFERENCE)
  formData.append('referenceId', brandId)
  formData.append('isPrimary', 'true')
  await app.$api.attachment.uploadAttachment({ data: formData })
}

async function save() {
  saving.value = true
  try {
    const response = await saveItem()
    const saved = response.data.data
    if (props.kind === 'brand') {
      try {
        await saveLogo(saved?.id ?? props.item.id)
      } catch (error) {
        toast.error('برند ذخیره شد اما لوگو ذخیره نشد', error?.response?.data?.message)
      }
    }
    toast.success(`${meta.value.label} ذخیره شد`)
    emit('saved')
    emit('update:open', false)
  } catch (error) {
    toast.error(`ذخیره ${meta.value.label} ناموفق بود`, error?.response?.data?.message)
  } finally {
    saving.value = false
  }
}
</script>
