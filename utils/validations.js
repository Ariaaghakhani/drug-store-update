export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber || phoneNumber.length === 0) {
    return ''
  }

  if (!phoneNumber.startsWith('09')) {
    return 'شماره موبایل باید با 09 شروع شود'
  }

  if (phoneNumber.length > 0 && phoneNumber.length < 11) {
    return 'شماره موبایل باید 11 رقم باشد'
  }

  if (phoneNumber.length === 11 && !/^09\d{9}$/.test(phoneNumber)) {
    return 'فرمت شماره موبایل صحیح نیست'
  }

  return ''
}
export function isValidPhoneNumber(phoneNumber) {
  return /^09\d{9}$/.test(phoneNumber)
}

export function validateIranianNationalCode(code) {
  // Convert to string and remove any non-digit characters
  const codeStr = String(code).replace(/\D/g, '')

  // Check length (must be 8-10 digits)
  if (codeStr.length > 10 || codeStr.length < 8) {
    return false
  }

  // Check if all digits are the same (invalid pattern)
  if (new Set(codeStr).size === 1) {
    return false
  }

  // Pad with zeros if less than 10 digits
  const paddedCode = codeStr.padStart(10, '0')

  // Calculate checksum
  const factors = [10, 9, 8, 7, 6, 5, 4, 3, 2]
  const checksum = factors.reduce((sum, factor, index) => {
    return sum + parseInt(paddedCode[index]) * factor
  }, 0)

  const remainder = checksum % 11
  const lastDigit = parseInt(paddedCode[9])

  // Validate last digit
  if (remainder < 2) {
    return remainder === lastDigit
  } else {
    return 11 - remainder === lastDigit
  }
}

export const validateRegisterForm = (formData) => {
  const errors = {
    name: '',
    password: '',
    passwordConfirm: '',
  }

  let isValid = true

  // Name validation
  if (!formData.name.trim()) {
    errors.name = 'نام و نام خانوادگی الزامی است'
    isValid = false
  } else if (formData.name.trim().length < 3) {
    errors.name = 'نام باید حداقل 3 کاراکتر باشد'
    isValid = false
  }

  // Password validation
  if (!formData.password) {
    errors.password = 'رمز عبور الزامی است'
    isValid = false
  } else if (formData.password.length < 8) {
    errors.password = 'رمز عبور باید حداقل 8 کاراکتر باشد'
    isValid = false
  } else if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(formData.password)) {
    errors.password = 'رمز عبور باید شامل حروف و اعداد باشد'
    isValid = false
  }

  // Password confirmation validation
  if (!formData.passwordConfirm) {
    errors.passwordConfirm = 'تکرار رمز عبور الزامی است'
    isValid = false
  } else if (formData.password !== formData.passwordConfirm) {
    errors.passwordConfirm = 'رمز عبور و تکرار آن مطابقت ندارند'
    isValid = false
  }

  return { isValid, errors }
}

// Persian/Arabic-Indic digits -> Latin, so a Persian keyboard passes the phone check
const toLatinDigits = (value) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (d) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)))

// Backend accepts 09…, 989…, +989…, 00989… with spaces/dashes and stores 09…
export function normalizeIranianMobile(value) {
  const digits = toLatinDigits(value).replace(/[\s-]/g, '')
  return digits.replace(/^(\+98|0098|98)/, '0')
}

// "۰۹۱۲•••۶۷۸۹" for showing a mobile (= the username) without printing it whole; '' when it isn't a mobile
export function maskMobile(value) {
  const phone = normalizeIranianMobile(value)
  if (!/^09\d{9}$/.test(phone)) return ''
  return `${phone.slice(0, 4)}•••${phone.slice(-4)}`.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[d])
}

// Mirrors BACK's ContactMessageCreateDTO: name/subject/message required, email or phone required, length caps.
// Returns { isValid, errors } where errors only has keys for broken fields.
export function validateContactForm(form) {
  const errors = {}
  const fullName = form.fullName?.trim() ?? ''
  const phone = normalizeIranianMobile(form.phone)
  const email = form.email?.trim() ?? ''
  const subject = form.subject?.trim() ?? ''
  const message = form.message?.trim() ?? ''

  if (!fullName) errors.fullName = 'نام و نام خانوادگی را وارد کنید'
  else if (fullName.length > 100) errors.fullName = 'نام نباید بیشتر از ۱۰۰ کاراکتر باشد'

  if (phone && !/^09\d{9}$/.test(phone)) errors.phone = 'شماره موبایل باید مانند ۰۹۱۲۳۴۵۶۷۸۹ باشد'

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'فرمت ایمیل صحیح نیست'
  else if (email.length > 100) errors.email = 'ایمیل نباید بیشتر از ۱۰۰ کاراکتر باشد'

  if (!phone && !email) {
    const msg = 'حداقل یکی از شماره موبایل یا ایمیل را وارد کنید'
    errors.phone = msg
    errors.email = msg
  }

  if (!subject) errors.subject = 'موضوع را وارد کنید'
  else if (subject.length > 200) errors.subject = 'موضوع نباید بیشتر از ۲۰۰ کاراکتر باشد'

  if (!message) errors.message = 'پیام را وارد کنید'
  else if (message.length > 5000) errors.message = 'پیام نباید بیشتر از ۵۰۰۰ کاراکتر باشد'

  return { isValid: Object.keys(errors).length === 0, errors }
}
