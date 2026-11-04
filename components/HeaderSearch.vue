<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="w-10 h-10 flex items-center justify-center rounded-lg text-gray-600 dark:text-gray-300 hover:text-teal-500 dark:hover:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950 transition-all"
      aria-label="جستجو"
      :aria-expanded="open"
      @click="toggle"
    >
      <UIcon :name="open ? 'i-heroicons-x-mark' : 'i-heroicons-magnifying-glass'" class="w-5 h-5" />
    </button>

    <Transition name="search-pop">
      <div
        v-if="open"
        class="fixed inset-x-4 top-18 sm:absolute sm:inset-x-auto sm:top-full sm:end-0 sm:mt-2 sm:w-96 z-50 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-3 font-dana"
        dir="rtl"
      >
        <form @submit.prevent="submit">
          <UInput
            ref="input"
            v-model="query"
            size="lg"
            class="w-full"
            icon="i-heroicons-magnifying-glass"
            placeholder="جستجوی دارو یا محصول..."
            autocomplete="off"
            enterkeyhint="search"
            @keydown.esc="close"
          />
        </form>

        <div class="mt-3 space-y-1 min-h-14">
          <!-- Nothing typed yet, or too short for BACK to suggest -->
          <p v-if="text.length < MIN_CHARS" class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            نام دارو یا محصول را بنویسید
          </p>

          <!-- Loading (first search only; later ones keep the current rows) -->
          <template v-else-if="loading && results.length === 0">
            <USkeleton v-for="i in 3" :key="i" class="h-14 w-full rounded-xl" />
          </template>

          <!-- Nothing found -->
          <div v-else-if="results.length === 0 && !failed" class="text-center py-4">
            <UIcon
              name="i-heroicons-magnifying-glass"
              class="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2"
            />
            <p class="text-sm font-bold text-gray-900 dark:text-white">محصولی یافت نشد</p>
            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">عبارت دیگری را امتحان کنید</p>
          </div>

          <!-- Top 5 -->
          <template v-else-if="results.length > 0">
            <NuxtLink
              v-for="product in results"
              :key="product.id"
              :to="`/medications/${product.groupId ?? product.id}`"
              class="flex items-center gap-3 p-2 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950 transition-colors"
              :class="loading ? 'opacity-60' : ''"
              @click="close"
            >
              <div
                class="w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
              >
                <img
                  v-if="product.imageUrl"
                  :src="product.imageUrl"
                  :alt="product.nameFa"
                  loading="lazy"
                  class="w-full h-full object-cover"
                />
                <UIcon v-else name="i-heroicons-cube" class="w-6 h-6 text-gray-300 dark:text-gray-600" />
              </div>
              <div class="min-w-0 flex-1">
                <p class="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{{ product.nameFa }}</p>
                <p class="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {{ product.brand }}
                </p>
              </div>
            </NuxtLink>
          </template>
        </div>

        <!-- CTA: always below the list (results, nothing found, or failed) -->
        <UButton
          v-if="text.length >= MIN_CHARS"
          :to="ctaTo"
          color="neutral"
          variant="soft"
          block
          class="mt-3"
          trailing-icon="i-heroicons-arrow-left"
          @click="close"
        >
          {{ results.length > 0 || failed ? 'مشاهده همه نتایج' : 'مشاهده همه محصولات' }}
        </UButton>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

// Navbar search: the icon opens a panel with an input; typing (debounced) calls the light GET api/elastic/suggest (one
// suggestion per product, typo/prefix tolerant), each linking to its product page, with a CTA to the full listing
// underneath. BACK suggests nothing under 2 characters and rate-limits it (429), so errors stay silent: the list just
// empties and the CTA still opens the listing.
const DEBOUNCE_MS = 300
const MIN_CHARS = 2
const LIMIT = 5

const { $api } = useNuxtApp()
const route = useRoute()
const router = useRouter()

const root = ref(null)
const input = ref(null)
const open = ref(false)
const query = ref('')
const results = ref([])
const loading = ref(false)
const failed = ref(false)

const text = computed(() => query.value.trim())
// with results: the full result list for this text; with none: the plain listing
const ctaTo = computed(() =>
  results.value.length > 0 || failed.value ? { path: '/medications', query: { search: text.value } } : '/medications'
)

let timer = null
let requestId = 0 // a slow older response must not replace a newer one

const search = async (value) => {
  const id = ++requestId
  loading.value = true
  failed.value = false
  try {
    const response = await $api.search.suggestGoods({ params: { q: value } })
    if (id !== requestId) return
    results.value = (response.data.data ?? []).slice(0, LIMIT)
  } catch {
    if (id !== requestId) return
    results.value = []
    failed.value = true
  } finally {
    if (id === requestId) loading.value = false
  }
}

watch(text, (value) => {
  clearTimeout(timer)
  if (value.length < MIN_CHARS) {
    requestId++ // drop anything still in flight
    results.value = []
    loading.value = false
    failed.value = false
    return
  }
  timer = setTimeout(() => search(value), DEBOUNCE_MS)
})

const close = () => {
  open.value = false
}

const toggle = async () => {
  open.value = !open.value
  if (open.value) {
    await nextTick()
    input.value?.inputRef?.focus?.()
  }
}

// Enter: go straight to the listing for what was typed
const submit = () => {
  if (!text.value) return
  router.push({ path: '/medications', query: { search: text.value } })
  close()
}

const onPointerDown = (event) => {
  if (open.value && root.value && !root.value.contains(event.target)) close()
}

onMounted(() => document.addEventListener('pointerdown', onPointerDown))
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDown)
  clearTimeout(timer)
})

// leaving the page closes the panel and resets the box
watch(
  () => route.fullPath,
  () => {
    close()
    query.value = ''
  }
)
</script>

<style scoped>
.search-pop-enter-active,
.search-pop-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.search-pop-enter-from,
.search-pop-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
