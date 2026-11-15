<!-- components/panel/workflow/StepJsonEditor.vue -->
<template>
  <div class="grid gap-3 md:grid-cols-2">
    <!-- ===== the textarea ===== -->
    <div class="space-y-2 min-w-0">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-xs text-gray-500 dark:text-gray-400">قالب:</span>
        <UButton
          v-for="template in templates"
          :key="template.id"
          color="neutral"
          variant="soft"
          size="xs"
          :disabled="disabled"
          @click="applyText(template.text)"
        >
          {{ template.label }}
        </UButton>
        <UButton
          class="ms-auto"
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-heroicons-arrow-uturn-left"
          :disabled="disabled || text === initialText"
          @click="applyText(initialText)"
        >
          مقدار اولیه
        </UButton>
      </div>

      <UTextarea
        v-model="text"
        :rows="14"
        dir="ltr"
        autocomplete="off"
        spellcheck="false"
        :disabled="disabled"
        :aria-invalid="Boolean(error)"
        aria-label="JSON ویژگی‌های مرحله"
        class="w-full font-mono text-xs"
        @blur="commit"
      />

      <p class="text-xs text-gray-500 dark:text-gray-400 leading-5">
        فقط کلیدهای این نوع مرحله اینجا هستند:
        <span v-for="key in allowedKeys" :key="key" class="font-mono mx-1" dir="ltr">{{ key }}</span>
        ؛ کلید، عنوان، نوع و شرط را از بخش‌های بالا ویرایش کنید. با خروج از کادر، متن بررسی و اعمال می‌شود.
      </p>

      <div v-if="error" class="rounded-lg bg-error/10 dark:bg-error/20 px-3 py-2 space-y-1" role="alert">
        <p class="flex items-start gap-1 text-xs text-error">
          <UIcon name="i-heroicons-exclamation-circle" class="w-4 h-4 flex-shrink-0" />
          <span>{{ error }}</span>
        </p>
        <p v-if="detail" class="text-xs text-gray-600 dark:text-gray-400 font-mono text-start break-words" dir="ltr">{{ detail }}</p>
        <p class="text-xs text-gray-600 dark:text-gray-400">تا وقتی درست نشود، تغییرات این کادر به مرحله اعمال نمی‌شود.</p>
      </div>
    </div>

    <!-- ===== side reference ===== -->
    <aside
      class="min-w-0 max-h-96 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 p-3 space-y-4 text-xs text-gray-700 dark:text-gray-300"
    >
      <!-- ACTION: registered actions -->
      <section v-if="type === 'ACTION'" class="space-y-3">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">اقدام‌های ثبت‌شده</h4>
        <p v-if="!systemActions" class="text-gray-500 dark:text-gray-400">
          فهرست اقدام‌ها دریافت نشد؛ کد اقدام را از مستندات بنویسید. درستی آن موقع «اعتبارسنجی» بررسی می‌شود.
        </p>
        <p v-else-if="!systemActions.length" class="text-gray-500 dark:text-gray-400">اقدامی ثبت نشده است.</p>
        <article
          v-for="action in systemActions ?? []"
          :key="action.code"
          class="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2 space-y-2"
        >
          <div class="flex flex-wrap items-center gap-2">
            <span class="font-semibold text-gray-900 dark:text-white">{{ action.title }}</span>
            <span class="font-mono text-gray-500 dark:text-gray-400" dir="ltr">{{ action.code }}</span>
            <UButton
              class="ms-auto"
              color="neutral"
              variant="soft"
              size="xs"
              :disabled="disabled"
              @click="applyText(actionTemplateText(action))"
            >
              درج قالب
            </UButton>
          </div>
          <div v-if="action.params?.length">
            <p class="text-gray-500 dark:text-gray-400">ورودی‌ها</p>
            <ul class="space-y-1">
              <li v-for="param in action.params" :key="param.key">
                <span class="font-mono" dir="ltr">{{ param.key }}</span>
                <span class="text-gray-500 dark:text-gray-400"> · {{ param.title }} · {{ labelOf(PARAM_TYPE_LABELS, param.type) }}</span>
                <span v-if="param.required" class="text-error"> · لازم</span>
                <span v-if="param.type === 'TEXT' && param.maxLength" class="text-gray-500 dark:text-gray-400">
                  · تا {{ param.maxLength.toLocaleString('fa-IR') }} نویسه
                </span>
                <span v-if="param.type === 'CHOICE'" class="text-gray-500 dark:text-gray-400">
                  ·
                  <span v-for="(title, code) in param.choices" :key="code" class="me-2">
                    <span class="font-mono" dir="ltr">{{ code }}</span> ({{ title }})
                  </span>
                </span>
              </li>
            </ul>
          </div>
          <div v-if="action.outputs?.length">
            <p class="text-gray-500 dark:text-gray-400">جواب‌ها (مرحله‌های بعد این‌ها را می‌خوانند)</p>
            <ul class="space-y-1">
              <li v-for="output in action.outputs" :key="output.key">
                <span class="font-mono break-all" dir="ltr">step.{{ stepKey || '<key>' }}.{{ output.key }}</span>
                <span class="text-gray-500 dark:text-gray-400"> · {{ output.title }} · {{ labelOf(OUTPUT_TYPE_LABELS, output.type) }}</span>
              </li>
            </ul>
          </div>
        </article>

        <div class="space-y-1">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white">مقدار ورودی از جای دیگر</h4>
          <p class="text-gray-500 dark:text-gray-400">
            ورودی‌های متن، عدد و بله/خیر به‌جای مقدار ثابت می‌توانند ارجاع بگیرند. در متن ثابت هم می‌توان نوشت
            <span class="font-mono" dir="ltr">{amount}</span>.
          </p>
          <ul class="space-y-1">
            <li v-for="hint in REF_HINTS" :key="hint.code">
              <span class="font-mono break-all" dir="ltr">{{ hint.code }}</span>
              <span class="text-gray-500 dark:text-gray-400"> · {{ hint.text }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- WAIT: events -->
      <section v-if="type === 'WAIT'" class="space-y-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">رویدادهای این موجودیت</h4>
        <p v-if="!subject" class="text-gray-500 dark:text-gray-400">
          فهرست رویدادها دریافت نشد. درستی کد رویداد موقع «اعتبارسنجی» بررسی می‌شود.
        </p>
        <p v-else-if="!subject.events?.length" class="text-gray-500 dark:text-gray-400">این موجودیت رویدادی ندارد.</p>
        <ul v-else class="space-y-1">
          <li v-for="event in subject.events" :key="event.code">
            <span class="font-mono" dir="ltr">{{ event.code }}</span>
            <span class="text-gray-500 dark:text-gray-400"> · {{ event.title }}</span>
          </li>
        </ul>
        <p class="text-gray-500 dark:text-gray-400">رویدادهای سفارشی فروشگاه هم در همین فهرست‌اند.</p>
        <div class="space-y-1">
          <p class="text-gray-500 dark:text-gray-400">مقدارهای مجاز</p>
          <ul class="space-y-1">
            <li>
              <span class="font-mono" dir="ltr">onTimeout</span> · <span class="font-mono" dir="ltr">{{ TIMEOUT_CODES }}</span>
            </li>
            <li>
              <span class="font-mono" dir="ltr">deadline.unit</span> · <span class="font-mono" dir="ltr">{{ UNIT_CODES }}</span>
            </li>
            <li>
              <span class="font-mono" dir="ltr">deadline.amount</span> · {{ (1).toLocaleString('fa-IR') }} تا {{ MAX_DEADLINE_DAYS.toLocaleString('fa-IR') }}
            </li>
          </ul>
        </div>
      </section>

      <!-- WAIT and AUTO: goTo targets -->
      <section v-if="type === 'WAIT' || type === 'AUTO'" class="space-y-2">
        <h4 class="text-sm font-semibold text-gray-900 dark:text-white">
          {{ type === 'AUTO' ? 'مقصد «رفتن به مرحله» (فقط بعدتر)' : 'مقصد «رفتن به» پس از رد' }}
        </h4>
        <p v-if="!targets.length" class="text-gray-500 dark:text-gray-400">مرحله‌ی دیگری که بتواند مقصد باشد نیست.</p>
        <ul v-else class="space-y-1">
          <li v-for="target in targets" :key="target.key">
            <span class="font-mono" dir="ltr">{{ target.key }}</span>
            <span class="text-gray-500 dark:text-gray-400"> · {{ target.title }}</span>
          </li>
        </ul>
        <p class="text-gray-500 dark:text-gray-400">مرحله‌ی بعدی و خود مرحله مقصد نمی‌شوند.</p>
      </section>
    </aside>
  </div>
</template>

<script setup>
import { labelOf } from '~/utils/enumMeta.js'
import { DEADLINE_UNIT_LABELS, WAIT_TIMEOUT_LABELS } from '~/utils/workflowMeta.js'
import { MAX_DEADLINE_DAYS } from '~/utils/workflowStep.js'
import { JSON_KEYS_BY_TYPE, actionTemplateText, jsonTemplates, mergeStepJson, stepJsonText } from '~/utils/workflowStepJson.js'

// JSON editor of the type-specific keys of an ACTION, WAIT or AUTO step (C22f), with templates and a reference of what BACK offers.
// Props: `modelValue` (the draft step, never mutated), `type` (ACTION | WAIT | AUTO), `subject` (catalog entry with `events`, or null),
// `systemActions` (`getApproverOptions().systemActions`, or null when they did not load), `targets` (`[{key, title}]` a goTo may point at),
// `disabled`. Emits `update:modelValue` (a NEW step with only this type's allowed keys replaced) and `error` (the inline message, '' when
// the text is fine). `commit()` is exposed: the modal calls it before it accepts, so text that was never blurred is not lost.
// The text is parsed with `JSON.parse` only, on blur; a key outside the allowed set is an error, not dropped (see utils/workflowStepJson.js).
const props = defineProps({
  modelValue: { type: Object, required: true },
  type: { type: String, required: true },
  subject: { type: Object, default: null },
  systemActions: { type: Array, default: null },
  targets: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue', 'error'])

const PARAM_TYPE_LABELS = {
  TEXT: 'متن',
  NUMBER: 'عدد',
  BOOLEAN: 'بله/خیر',
  CHOICE: 'انتخابی',
  ROLE: 'نقش (شناسه)',
  USER: 'کارمند (شناسه)',
}
const OUTPUT_TYPE_LABELS = { NUMBER: 'عدد', TEXT: 'متن', BOOLEAN: 'بله/خیر', ID: 'شناسه' }
const REF_HINTS = [
  { code: '{"ref":"amount"}', text: 'فیلد موجودیت (کلید فیلد)' },
  { code: '{"ref":"step.<key>.<answer>"}', text: 'جواب یک مرحله‌ی اقدام پیش از این مرحله' },
  { code: '{"ref":"@starter"}', text: 'ثبت‌کننده‌ی درخواست' },
  { code: '{"ref":"@instance"}', text: 'شناسه‌ی اجرا' },
  { code: '{"ref":"@entity"}', text: 'شناسه‌ی رکورد' },
]

const TIMEOUT_CODES = Object.keys(WAIT_TIMEOUT_LABELS).join(' | ')
const UNIT_CODES = Object.keys(DEADLINE_UNIT_LABELS).join(' | ')

const allowedKeys = computed(() => JSON_KEYS_BY_TYPE[props.type] ?? [])
const stepKey = computed(() => (typeof props.modelValue.key === 'string' ? props.modelValue.key : ''))
const templates = computed(() => jsonTemplates(props.type, props.targets[0]?.key ?? ''))

const initialText = stepJsonText(props.modelValue, props.type)
const text = ref(initialText)
const error = ref('')
const detail = ref('')

// Parses the text and, when it is valid, hands the merged step up and shows the normalised text. Returns false while the text is invalid.
function commit() {
  const result = mergeStepJson(props.modelValue, props.type, text.value)
  if (!result.ok) {
    error.value = result.error
    detail.value = result.detail ?? ''
    emit('error', result.error)
    return false
  }
  error.value = ''
  detail.value = ''
  emit('error', '')
  emit('update:modelValue', result.step)
  text.value = stepJsonText(result.step, props.type)
  return true
}

// A template or the initial value goes into the textarea and is applied at once
function applyText(value) {
  text.value = value
  commit()
}

defineExpose({ commit })
</script>
