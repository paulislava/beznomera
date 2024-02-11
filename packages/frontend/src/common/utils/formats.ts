import { format, parseISO } from 'date-fns'
import ru from 'date-fns/locale/ru'

export const formatMoneyFull = (money: string | number): string => {
  return Number(money)
    .toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    })
    .replace(',', '.')
}

export const formatMoney = (money: string | number): string => {
  return Number(money)
    .toLocaleString('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0
    })
}

export const formatMoneyWithSign = (money: string | number): string => {
  const summ = Number(money)

  return `${summ > 0 ? '+ ' : summ < 0 ? '- ' : ''}${formatMoneyFull(Math.abs(summ))}`
}

export const formatSumm = (summ: string | number): string => {
  return Number(summ).toLocaleString('ru-RU', {}).replace(',', '.')
}

export const TEXT_DATE_FORMAT = 'd MMMM yyyy'

export const formatDate = (date: string | null, form: string = TEXT_DATE_FORMAT): string | null =>
  date && format(parseISO(date), form, { locale: ru })
