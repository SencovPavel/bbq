import { describe, it, expect } from 'vitest'
import { parseFnsQr } from '../fns-receipt'

describe('parseFnsQr', () => {
  it('парсит сумму и дату из строки ФНС', () => {
    const result = parseFnsQr('t=20260530T1142&s=4280.00&fn=9280440300085848&i=48671&fp=2597123456&n=1')
    expect(result).toEqual({ total: 4280, date: '2026-05-30' })
  })

  it('работает без ведущего "?"', () => {
    const result = parseFnsQr('?t=20260530T1142&s=100.50')
    expect(result).toEqual({ total: 100.5, date: '2026-05-30' })
  })

  it('возвращает дату null, если параметр t отсутствует', () => {
    const result = parseFnsQr('s=250.00&fn=123')
    expect(result).toEqual({ total: 250, date: null })
  })

  it('возвращает null для пустой строки', () => {
    expect(parseFnsQr('')).toBeNull()
    expect(parseFnsQr('   ')).toBeNull()
  })

  it('возвращает null, если нет суммы', () => {
    expect(parseFnsQr('t=20260530T1142&fn=123')).toBeNull()
  })

  it('возвращает null для нулевой или отрицательной суммы', () => {
    expect(parseFnsQr('s=0')).toBeNull()
    expect(parseFnsQr('s=-10')).toBeNull()
  })

  it('возвращает null для мусорной строки', () => {
    expect(parseFnsQr('просто текст без параметров')).toBeNull()
  })
})
