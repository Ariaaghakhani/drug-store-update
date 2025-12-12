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
