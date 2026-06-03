/**
 * Берём только "YYYY-MM-DD" из строки — безопасно обрабатывает оба формата:
 * - "2025-06-02"              (plain date из корректно настроенного pg)
 * - "2025-06-02T00:00:00.000Z" (ISO datetime, если pg вернул Date object)
 */
function toDateOnly(iso: string): string {
  return iso.slice(0, 10)
}

/** Короткая дата: «22 мая» */
export const shortDate = (iso: string): string => {
  const d = new Date(toDateOnly(iso) + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

/** Полная дата события */
export const formatEventDate = (iso: string | null): string => {
  if (!iso) return 'Дата не указана'
  const d = new Date(toDateOnly(iso) + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'long' })
}

/** Месяц для плитки даты в шапке */
export const dateTileMonth = (iso: string): string => {
  const d = new Date(toDateOnly(iso) + 'T00:00:00')
  return d.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').slice(0, 3)
}
