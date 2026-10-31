<template>
  <InfoDocument :documents="documents" :loading="loading" empty-title="سیاست مرجوعی و لغو سفارش یافت نشد" />
</template>

<script setup>
const { documents, loading } = useInfoDocuments(
  (api) => api.getReturnPolicy(),
  (policy) =>
    policy
      ? [{ key: policy.id, title: policy.title, content: policy.content, meta: formatInfoDate(policy.updatedAt) }]
      : []
)

useHead({ title: 'مرجوعی و لغو سفارش | داروخانه آنلاین' })
</script>
