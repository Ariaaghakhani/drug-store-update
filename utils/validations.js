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
