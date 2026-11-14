// Store password policy from the public `GET api/auth/password-policy` (BACK PasswordPolicyPublicController, PasswordPolicyDTO).
// Loaded once per app and shared via useState. Until it loads, or if the call fails, the fallback is the old rule: at least 8 characters.
// Length is counted in UTF-16 units (`.length`), the same as BACK's password.length().
const FALLBACK_POLICY = Object.freeze({
  minLength: 8,
  requireUppercase: false,
  requireLowercase: false,
  requireDigit: false,
  requireSpecialChar: false,
})

const toFa = (n) => Number(n).toLocaleString('fa-IR')

// Each rule mirrors PasswordPolicyServiceImpl.validate(): Java Character.isUpperCase/isLowerCase/isDigit,
// and "special" = not a letter, not a digit and not whitespace.
const RULE_DEFS = [
  {
    enabled: () => true,
    text: (p) => `حداقل ${toFa(p.minLength)} کاراکتر`,
    met: (pw, p) => pw.length >= p.minLength,
  },
  {
    enabled: (p) => p.requireUppercase,
    text: () => 'شامل حرف بزرگ انگلیسی',
    met: (pw) => /\p{Lu}/u.test(pw),
  },
  {
    enabled: (p) => p.requireLowercase,
    text: () => 'شامل حرف کوچک انگلیسی',
    met: (pw) => /\p{Ll}/u.test(pw),
  },
  {
    enabled: (p) => p.requireDigit,
    text: () => 'شامل عدد',
    met: (pw) => /\p{Nd}/u.test(pw),
  },
  {
    enabled: (p) => p.requireSpecialChar,
    text: () => 'شامل نماد خاص',
    met: (pw) => [...pw].some((c) => !/[\p{L}\p{Nd}]/u.test(c) && !/\s/.test(c)),
  },
]

export const usePasswordRules = (passwordSource) => {
  const policy = useState('password-policy', () => null)
  const loading = useState('password-policy-loading', () => false)

  const load = async () => {
    if (policy.value || loading.value) return
    loading.value = true
    try {
      const { $api } = useNuxtApp()
      const response = await $api.auth.getPasswordRules()
      policy.value = response.data.data ?? null
    } catch {
      policy.value = null
    } finally {
      loading.value = false
    }
  }

  if (import.meta.client) load()

  const effective = computed(() => ({ ...FALLBACK_POLICY, ...(policy.value ?? {}) }))

  // Every enabled rule for the policy, with met/unmet state for the given password.
  const evaluate = (password) => {
    const pw = password ?? ''
    const p = effective.value
    return RULE_DEFS.filter((rule) => rule.enabled(p)).map((rule) => ({
      text: rule.text(p),
      met: rule.met(pw, p),
    }))
  }

  const ruleList = computed(() => evaluate(toValue(passwordSource)))

  // First unmet rule text, or '' when the password passes.
  const validate = (password) => evaluate(password).find((rule) => !rule.met)?.text ?? ''

  return { ruleList, validate, load }
}
