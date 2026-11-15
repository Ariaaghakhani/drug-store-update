// Jalali (Persian/Solar Hijri) date helpers. No hand-written calendar math: every conversion goes through
// Intl with the `persian` calendar, so the results match what the browser shows elsewhere.
// ISO values are `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm:ss`; only the date part is converted, the time is kept as-is).

const DAY_MS = 24 * 60 * 60 * 1000
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})/

// Latin formatter for the Persian calendar. `timeZone: 'UTC'` keeps the calendar day equal to the ISO day.
const jalaliPartsFormatter = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
})

// Persian month names and Persian digits for display.
const displayFormatter = new Intl.DateTimeFormat('fa-IR-u-ca-persian-nu-arabext', {
  timeZone: 'UTC',
  year: 'numeric',
  month: 'long',
  day: 'numeric',
})

const persianTwoDigits = new Intl.NumberFormat('fa-IR-u-nu-arabext', { minimumIntegerDigits: 2, useGrouping: false })

const readPart = (parts, type) => Number(parts.find((part) => part.type === type)?.value)

const dateFromIso = (iso) => {
  const match = ISO_DATE.exec(String(iso ?? ''))
  if (!match) return null
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}

const jalaliOfUtcTime = (time) => {
  const parts = jalaliPartsFormatter.formatToParts(new Date(time))
  return { jy: readPart(parts, 'year'), jm: readPart(parts, 'month'), jd: readPart(parts, 'day') }
}

const dateKey = ({ jy, jm, jd }) => jy * 10000 + jm * 100 + jd

// ISO date string → { jy, jm, jd }, or null when the input is not a valid ISO date.
export const isoToJalali = (iso) => {
  const time = dateFromIso(iso)
  return time === null ? null : jalaliOfUtcTime(time)
}

// Jalali (jy/jm/jd) → ISO `YYYY-MM-DD`, or null for a non-existent Jalali date (e.g. 1404/12/30).
// Dates are ordered, so a binary search over a window around the year finds the exact day
// and the round-trip check rejects days that do not exist in that month.
export const jalaliToIso = (jy, jm, jd) => {
  const year = Number(jy)
  const month = Number(jm)
  const day = Number(jd)
  if (![year, month, day].every(Number.isInteger) || month < 1 || month > 12 || day < 1 || day > 31) return null

  const target = year * 10000 + month * 100 + day
  let low = Date.UTC(year + 620, 0, 1)
  let high = Date.UTC(year + 623, 11, 31)
  while (low <= high) {
    const middle = low + Math.floor((high - low) / (2 * DAY_MS)) * DAY_MS
    const key = dateKey(jalaliOfUtcTime(middle))
    if (key === target) return new Date(middle).toISOString().slice(0, 10)
    if (key < target) low = middle + DAY_MS
    else high = middle - DAY_MS
  }
  return null
}

// Persian and Arabic-Indic digits → Latin digits. Other characters are kept as they are.
// (For number-only input cleanup use `toLatinNumber` in utils/searchQuery.js.)
export const toLatinDigits = (value) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (digit) => String(digit.charCodeAt(0) - 0x06f0))
    .replace(/[٠-٩]/g, (digit) => String(digit.charCodeAt(0) - 0x0660))

// ISO → "۱ فروردین ۱۴۰۵" (or with " HH:mm" when `withTime`). Returns '' for an invalid ISO value.
export const formatJalali = (iso, { withTime = false } = {}) => {
  const time = dateFromIso(iso)
  if (time === null) return ''
  const dateText = displayFormatter.format(new Date(time))
  if (!withTime) return dateText
  const match = /T(\d{2}):(\d{2})/.exec(String(iso))
  if (!match) return dateText
  return `${dateText} ${persianTwoDigits.format(match[1])}:${persianTwoDigits.format(match[2])}`
}

// The Jalali year of today in Iran's time zone (the panel's business calendar).
export const currentJalaliYear = () => {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian-nu-latn', {
    timeZone: 'Asia/Tehran',
    year: 'numeric',
  }).formatToParts(new Date())
  return readPart(parts, 'year')
}

// Two-digit Persian number ("۰۳") for the input component's month/day/time display.
export const toPersianTwoDigits = (value) => persianTwoDigits.format(Number(value))
