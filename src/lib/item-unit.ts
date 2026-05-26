/** Шаг изменения количества в зависимости от единицы */
export const stepForUnit = (unit: string): number => {
  if (unit === 'кг' || unit === 'л') return 0.5
  if (unit === 'г' || unit === 'мл') return 50
  return 1
}

/** Формат qty для отображения в степпере */
export const fmtQty = (qty: number, unit: string): string => {
  const step = stepForUnit(unit)
  if (step >= 1) return String(Math.round(qty))
  const rounded = Math.round(qty * 10) / 10
  return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(1).replace(/\.0$/, '')
}
