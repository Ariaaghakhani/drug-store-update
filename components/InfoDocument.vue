<template>
  <UContainer>
    <div class="py-12 max-w-3xl mx-auto">
      <div class="relative">
        <Transition name="sk">
          <div v-if="loading" key="skeleton" class="space-y-3">
            <USkeleton class="h-9 w-64" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-full" />
            <USkeleton class="h-4 w-3/4" />
          </div>

          <div v-else-if="documents.length" key="content" class="space-y-10">
            <article v-for="doc in documents" :key="doc.key">
              <h1 class="text-3xl font-black text-gray-900 dark:text-white mb-2">{{ doc.title }}</h1>
              <p v-if="doc.meta" class="text-xs text-gray-500 dark:text-gray-400 mb-6">{{ doc.meta }}</p>
              <!-- Store-authored text is rendered as plain text on purpose (no v-html) -->
              <div class="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line">{{ doc.content }}</div>
            </article>
          </div>

          <div v-else key="empty" class="text-center py-16">
            <UIcon name="i-heroicons-document-text" class="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto" />
            <h2 class="text-base font-bold text-gray-900 dark:text-white mt-4 mb-2">{{ emptyTitle }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">این بخش هنوز توسط فروشگاه منتشر نشده است.</p>
            <UButton to="/" color="primary" icon="i-heroicons-home">بازگشت به صفحه اصلی</UButton>
          </div>
        </Transition>
      </div>
    </div>
  </UContainer>
</template>

<script setup>
// Generic public text page: pass `documents` = [{ key, title, content, meta? }]
defineProps({
  documents: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyTitle: { type: String, default: 'محتوایی یافت نشد' },
})
</script>

<style scoped>
.sk-enter-active { transition: opacity 0.25s ease; }
.sk-leave-active { transition: opacity 0.25s ease; position: absolute; inset: 0; }
.sk-enter-from, .sk-leave-to { opacity: 0; }
</style>
