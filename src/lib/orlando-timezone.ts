import { format, parse } from 'date-fns'
import { toZonedTime, fromZonedTime } from 'date-fns-tz'

export const ORLANDO_TIMEZONE = 'America/New_York'

/**
 * Retorna a data atual em Orlando no formato YYYY-MM-DD
 */
export function getTodayInOrlando(): string {
  const now = new Date()
  const orlandoNow = toZonedTime(now, ORLANDO_TIMEZONE)
  return format(orlandoNow, 'yyyy-MM-dd')
}

/**
 * Converte um timestamp UTC para data de Orlando (YYYY-MM-DD)
 * Ex: "2026-01-11T02:00:00Z" (UTC) -> "2026-01-10" (Orlando, pois é 21h do dia anterior)
 */
export function utcToOrlandoDate(utcString: string): string {
  const utcDate = new Date(utcString)
  const orlandoDate = toZonedTime(utcDate, ORLANDO_TIMEZONE)
  return format(orlandoDate, 'yyyy-MM-dd')
}

/**
 * Converte um timestamp UTC para horário de Orlando (HH:mm)
 * Ex: "2026-01-11T14:00:00Z" -> "09:00" (Orlando, EST = UTC-5)
 */
export function utcToOrlandoTime(utcString: string): string {
  const utcDate = new Date(utcString)
  const orlandoDate = toZonedTime(utcDate, ORLANDO_TIMEZONE)
  return format(orlandoDate, 'HH:mm')
}

/**
 * Retorna o início de um dia de Orlando em formato ISO UTC
 * Ex: "2026-01-10" -> "2026-01-10T05:00:00.000Z" (meia-noite de Orlando em UTC, considerando EST=-5)
 */
export function getOrlandoDayStartUTC(dateStr: string): string {
  // Parse a data como meia-noite em Orlando
  const orlandoMidnight = parse(dateStr, 'yyyy-MM-dd', new Date())
  // Converte meia-noite de Orlando para UTC
  const utcDate = fromZonedTime(orlandoMidnight, ORLANDO_TIMEZONE)
  return utcDate.toISOString()
}

/**
 * Retorna o fim de um dia de Orlando (início do próximo dia) em formato ISO UTC
 */
export function getOrlandoDayEndUTC(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const nextDay = new Date(year, month - 1, day + 1)
  const nextDayStr = format(nextDay, 'yyyy-MM-dd')
  return getOrlandoDayStartUTC(nextDayStr)
}

/**
 * Formata uma data de Orlando para exibição em português
 */
export function formatDateBR(dateStr: string): string {
  const date = parse(dateStr, 'yyyy-MM-dd', new Date())
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  const dayOfWeek = diasSemana[date.getDay()]
  const formatted = format(date, 'dd/MM/yyyy')
  
  const todayOrlando = getTodayInOrlando()
  const [year, month, day] = todayOrlando.split('-').map(Number)
  const yesterdayDate = new Date(year, month - 1, day - 1)
  const yesterdayOrlando = format(yesterdayDate, 'yyyy-MM-dd')
  
  let suffix = ''
  if (dateStr === todayOrlando) suffix = ' - Hoje'
  else if (dateStr === yesterdayOrlando) suffix = ' - Ontem'
  
  return `${formatted} (${dayOfWeek})${suffix}`
}

/**
 * Formata horário de TIME (HH:mm:ss) para exibição
 */
export function formatTimeLocal(timeString: string | null): string {
  if (!timeString) return '--'
  return timeString.substring(0, 5)
}
