<template>
  <InfoDocument :documents="documents" :loading="loading" empty-title="قوانین و مقررات یافت نشد" />
</template>

<script setup>
const { documents, loading } = useInfoDocuments(
  (api) => api.listTerms(),
  (data) =>
    (data ?? []).map((terms) => ({
      key: terms.id,
      title: terms.title,
      content: terms.content,
      meta: [terms.version && `نسخه ${terms.version}`, formatInfoDate(terms.publishedAt || terms.updatedAt)]
        .filter(Boolean)
        .join(' · '),
    }))
)

useHead({ title: 'قوانین و مقررات | داروخانه آنلاین' })
</script>
