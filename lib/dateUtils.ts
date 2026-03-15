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

/**
 * Parts for 12-hour time picker in Philippine time.
 * hour is 1-12, ampm is 'AM' | 'PM'.
 */
export type UnlockDatePartsPH = {
  date: string
  hour: number
  minute: number
  ampm: 'AM' | 'PM'
}

/**
 * Convert stored unlock_date (UTC ISO) to 12-hour parts in Philippine time.
 */
export function unlockDateToPartsPH(isoString: string | null): UnlockDatePartsPH | null {
  if (!isoString) return null
  const d = new Date(isoString)
  const dateStr = d.toLocaleDateString('en-CA', { timeZone: PH_TIMEZONE })
  const timeStr = d.toLocaleTimeString('en-US', { timeZone: PH_TIMEZONE, hour12: true, hour: 'numeric', minute: '2-digit', second: '2-digit' })
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)$/i)
  const hour12 = match ? parseInt(match[1], 10) : 12
  const minute = match ? parseInt(match[2], 10) : 0
  const ampm = (match ? match[3].toUpperCase() : 'AM') as 'AM' | 'PM'
  return { date: dateStr, hour: hour12, minute, ampm }
}

/**
 * Convert 12-hour parts (Philippine time) to UTC ISO string for storage.
 */
export function partsPHToUnlockDateISO(parts: UnlockDatePartsPH | null): string | null {
  if (!parts?.date) return null
  const hour24 = parts.ampm === 'PM' ? (parts.hour === 12 ? 12 : parts.hour + 12) : (parts.hour === 12 ? 0 : parts.hour)
  const h = String(hour24).padStart(2, '0')
  const m = String(parts.minute).padStart(2, '0')
  return new Date(`${parts.date}T${h}:${m}:00+08:00`).toISOString()
}

/** For backwards compatibility / datetime-local if needed. */
export function unlockDateToDateTimeLocalPH(isoString: string | null): string {
  const parts = unlockDateToPartsPH(isoString)
  if (!parts) return ''
  const hour24 = parts.ampm === 'PM' ? (parts.hour === 12 ? 12 : parts.hour + 12) : (parts.hour === 12 ? 0 : parts.hour)
  return `${parts.date}T${String(hour24).padStart(2, '0')}:${String(parts.minute).padStart(2, '0')}`
}

export function dateTimeLocalPHToISO(localString: string): string {
  if (!localString || localString.length < 16) return ''
  const normalized = localString.slice(0, 16)
  return new Date(`${normalized}:00+08:00`).toISOString()
}

