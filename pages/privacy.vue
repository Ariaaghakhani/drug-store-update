<template>
  <InfoDocument :documents="documents" :loading="loading" empty-title="سیاست حریم خصوصی یافت نشد" />
</template>

<script setup>
const { documents, loading } = useInfoDocuments(
  (api) => api.getTermsByType('PRIVACY_POLICY'),
  (terms) =>
    terms
      ? [{ key: terms.id, title: terms.title, content: terms.content, meta: formatInfoDate(terms.publishedAt || terms.updatedAt) }]
      : []
)

useHead({ title: 'حریم خصوصی | داروخانه آنلاین' })
</script>
