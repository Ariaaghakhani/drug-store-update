// Weekday enum of BACK's calendar and shipping pickup hours (Saturday-first, the Iranian week).
export const WEEKDAYS = [
  { value: 'SATURDAY', label: 'شنبه' },
  { value: 'SUNDAY', label: 'یکشنبه' },
  { value: 'MONDAY', label: 'دوشنبه' },
  { value: 'TUESDAY', label: 'سه‌شنبه' },
  { value: 'WEDNESDAY', label: 'چهارشنبه' },
  { value: 'THURSDAY', label: 'پنجشنبه' },
  { value: 'FRIDAY', label: 'جمعه' },
]

// 'FRIDAY' → 'جمعه'; unknown → the raw value, '—' when empty.
export const weekdayLabel = (value) => WEEKDAYS.find((day) => day.value === value)?.label ?? value ?? '—'
