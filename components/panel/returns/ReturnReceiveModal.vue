<!-- components/panel/returns/ReturnReceiveModal.vue -->
<template>
  <PanelFormModal
    :open="open"
    title="دریافت کالای مرجوعی"
    icon="i-heroicons-inbox-arrow-down"
    submit-label="ثبت دریافت"
    width="lg"
    :loading="saving"
    @update:open="emit('update:open', $event)"
    @submit="submit"
  >
    <p v-if="serverError" class="text-sm text-error" role="alert">{{ serverError }}</p>

    <p class="text-xs text-gray-500 dark:text-gray-400">
      برای هر قلم، تعداد سالم (به موجودی برمی‌گردد) و تعداد خراب را وارد کنید. جمع آن‌ها نباید از تعداد مرجوعی بیشتر باشد؛
      باقی‌مانده پذیرفته نمی‌شود.
    </p>

    <div
      v-for="line in lines"
      :key="line.id"
      class="rounded-xl border border-gray-200 dark:border-gray-700 p-3 space-y-3"
    >
      <div class="flex items-center justify-between gap-3">
        <p class="text-sm font-semibold text-gray-900 dark:text-white min-w-0 truncate">{{ line.goodsName }}</p>
        <p class="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
          تعداد مرجوعی: {{ line.quantity.toLocaleString('fa-IR') }}
        </p>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <UFormField label="سالم" :error="lineError(line) || undefined">
          <UInput
            v-model="line.restocked"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>
        <UFormField label="خراب">
          <UInput
            v-model="line.damaged"
            inputmode="numeric"
            dir="ltr"
            autocomplete="off"
            class="w-full"
          />
        </UFormField>
      </div>
    </div>

    <UFormField label="توضیح بازبینی (اختیاری)" :help="`حداکثر ۵۰۰ کاراکتر (${note.length.toLocaleString('fa-IR')})`">
      <UTextarea v-model="note" :maxlength="500" :rows="2" class="w-full" />
    </UFormField>
  </PanelFormModal>
</template>

<script setup>
// Inspects the returned goods, line by line: restocked goes back to stock, damaged does not.
// Defaults follow the reason: CHANGE_OF_MIND (goods are fine) restocks everything, any other reason marks it damaged.
// Emits `done` with { pending, dto }, like ReturnApproveModal.
import PanelFormModal from '@/components/panel/PanelFormModal.vue'
import { apiErrorMessage, isPending } from '~/utils/apiError.js'

const props = defineProps({
  open: { type: Boolean, required: true },
  ret: { type: Object, default: null },
})

const emit = defineEmits(['update:open', 'done'])

const app = useNuxtApp()
const toast = useAppToast()

const lines = ref([])
const note = ref('')
const serverError = ref('')
const saving = ref(false)

// Each open starts from the reason-based defaults, so a previous inspection never carries over.
watch(
  () => props.open,
  (isOpen) => {
    if (!isOpen || !props.ret) return
    const restockAll = props.ret.reason === 'CHANGE_OF_MIND'
    lines.value = (props.ret.items ?? []).map((item) => ({
      id: item.id,
      goodsName: item.goodsName,
      quantity: Number(item.quantity ?? 0),
      restocked: String(restockAll ? item.quantity ?? 0 : 0),
      damaged: String(restockAll ? 0 : item.quantity ?? 0),
    }))
    note.value = ''
    serverError.value = ''
  }
)

// Parsed counts for a line; null when the typed text is not a whole number
const counts = (line) => {
  const restocked = parseQuantity(line.restocked)
  const damaged = parseQuantity(line.damaged)
  return { restocked, damaged }
}

const lineError = (line) => {
  const { restocked, damaged } = counts(line)
  if (restocked === null || damaged === null) return 'فقط عدد صحیح وارد کنید'
  if (restocked + damaged > line.quantity) {
    return `جمع سالم و خراب بیش از ${line.quantity.toLocaleString('fa-IR')} عدد است`
  }
  return ''
}

const submit = async () => {
  serverError.value = ''
  if (lines.value.some((line) => lineError(line))) return
  saving.value = true
  try {
    const res = await app.$api.returns.receiveReturn(props.ret.id, {
      data: {
        items: lines.value.map((line) => {
          const { restocked, damaged } = counts(line)
          return { returnItemId: line.id, restockedQuantity: restocked, damagedQuantity: damaged }
        }),
        note: note.value.trim() || undefined,
      },
    })
    if (isPending(res)) {
      emit('done', { pending: true })
    } else {
      toast.success('کالای مرجوعی دریافت شد')
      emit('done', { pending: false, dto: res.data.data })
    }
    emit('update:open', false)
  } catch (e) {
    serverError.value = apiErrorMessage(e, 'ثبت دریافت ناموفق بود')
  } finally {
    saving.value = false
  }
}
</script>
