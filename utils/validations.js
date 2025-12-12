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
