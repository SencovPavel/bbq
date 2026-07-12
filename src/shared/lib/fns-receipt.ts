export interface FnsReceiptInfo {
  total: number
  date: string | null // ISO "YYYY-MM-DD", если распозналось
}

/**
 * Парсит QR-строку чека ФНС (querystring вида "t=20260530T1142&s=4280.00&fn=...&i=...&fp=...").
 * Даёт только сумму/дату — позиционный состав чека ФНС в QR не передаёт (нужен внешний
 * сервис проверки чека, см. README плана). Возвращает null, если строка не похожа на чек ФНС.
 */
export function parseFnsQr(raw: string): FnsReceiptInfo | null {
  const trimmed = raw.trim()
  if (!trimmed) return null

  const params = new URLSearchParams(trimmed.replace(/^\?/, ''))
  const s = params.get('s')
  const t = params.get('t')
  if (!s) return null

  const total = parseFloat(s)
  if (!Number.isFinite(total) || total <= 0) return null

  let date: string | null = null
  if (t) {
    // формат ФНС: "20260530T1142" или "20260530T1142XX"
    const m = /^(\d{4})(\d{2})(\d{2})T/.exec(t)
    if (m) date = `${m[1]}-${m[2]}-${m[3]}`
  }

  return { total, date }
}
