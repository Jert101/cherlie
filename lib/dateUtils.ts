/**
 * Philippine Standard Time (Asia/Manila, UTC+8).
 * Use for "today" logic and date/time display so the site behaves in PH time.
 */
export const PH_TIMEZONE = 'Asia/Manila'

/** Current date in Philippines (year, month 1–12, day) for day-based logic (e.g. daily message rotation). */
export function getTodayInPH(): { year: number; month: number; day: number } {
  const str = new Date().toLocaleDateString('en-CA', { timeZone: PH_TIMEZONE })
  const [y, m, d] = str.split('-').map(Number)
  return { year: y, month: m, day: d }
}

/** Day index in PH time for rotating daily message (same formula as before, but in PH). */
export function getDayIndexInPH(): number {
  const { year, month, day } = getTodayInPH()
  return year * 1000 + (month - 1) * 50 + day
}

/** Today's date in PH as YYYY-MM-DD for date inputs. */
export function getTodayDateStringInPH(): string {
  const { year, month, day } = getTodayInPH()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** Format a date (ISO string or Date) in Philippine time for display. */
export function formatDateInPH(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-PH', { ...options, timeZone: PH_TIMEZONE })
}

/** Format a datetime in Philippine time for display. */
export function formatDateTimeInPH(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium', timeStyle: 'short' }
): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-PH', { ...options, timeZone: PH_TIMEZONE })
}

