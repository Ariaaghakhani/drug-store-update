// Jalaali (Persian) <-> Gregorian calendar conversion.
// Standard algorithm (jalaali-js), reimplemented locally to avoid a new dependency.

function div(a, b) {
  return Math.trunc(a / b)
}

function toGregorian(jy, jm, jd) {
  jy = Number(jy) + 1595
  let days =
    -355668 +
    365 * jy +
    div(jy, 33) * 8 +
    div(((jy % 33) + 3), 4) +
    Number(jd) +
    (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186)

  let gy = 400 * div(days, 146097)
  days %= 146097
  if (days > 36524) {
    gy += 100 * div(--days, 36524)
    days %= 36524
    if (days >= 365) days++
  }
  gy += 4 * div(days, 1461)
  days %= 1461
  if (days > 365) {
    gy += div(days - 1, 365)
    days = (days - 1) % 365
  }

  let gd = days + 1
  const isLeap = (gy % 4 === 0 && gy % 100 !== 0) || gy % 400 === 0
  const monthDays = [0, 31, isLeap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let gm = 0
  for (; gm < 13; gm++) {
    if (gd <= monthDays[gm]) break
    gd -= monthDays[gm]
  }

  return { gy, gm, gd }
}

function toJalaali(gy, gm, gd) {
  const gDayOffsets = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]
  gy = Number(gy)
  let jy
  if (gy > 1600) {
    jy = 979
    gy -= 1600
  } else {
    jy = 0
    gy -= 621
  }
  const gy2 = gm > 2 ? gy + 1 : gy
  let days =
    365 * gy +
    div(gy2 + 3, 4) -
    div(gy2 + 99, 100) +
    div(gy2 + 399, 400) -
    80 +
    Number(gd) +
    gDayOffsets[gm - 1]

  jy += 33 * div(days, 12053)
  days %= 12053
  jy += 4 * div(days, 1461)
  days %= 1461
  if (days > 365) {
    jy += div(days - 1, 365)
    days = (days - 1) % 365
  }

  const jm = days < 186 ? 1 + div(days, 31) : 7 + div(days - 186, 30)
  const jd = days < 186 ? 1 + (days % 31) : 1 + ((days - 186) % 30)

  return { jy, jm, jd }
}

const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹'
const toLatinDigits = (str) =>
  String(str).replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
const pad2 = (n) => String(n).padStart(2, '0')

// "1371/03/31" (or Persian digits) -> "1992-06-21" | '' if unparsable
export function jalaaliToIsoDate(jalaaliDate) {
  if (!jalaaliDate) return ''
  const normalized = toLatinDigits(jalaaliDate).trim()
  const match = normalized.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/)
  if (!match) return ''
  const [, jy, jm, jd] = match.map(Number)
  if (jm < 1 || jm > 12 || jd < 1 || jd > 31) return ''
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return `${gy}-${pad2(gm)}-${pad2(gd)}`
}

// "1992-06-21" -> "1371/03/31" | '' if unparsable
export function isoDateToJalaali(isoDate) {
  if (!isoDate) return ''
  const match = String(isoDate).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (!match) return ''
  const [, gy, gm, gd] = match.map(Number)
  const { jy, jm, jd } = toJalaali(gy, gm, gd)
  return `${jy}/${pad2(jm)}/${pad2(jd)}`
}
