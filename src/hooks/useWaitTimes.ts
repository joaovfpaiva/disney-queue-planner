import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { getOrlandoDayStartUTC, getOrlandoDayEndUTC, utcToOrlandoTime } from '@/lib/orlando-timezone'
import type { WaitTime, AttractionGridData, GridData } from '@/types'

const PAGE_SIZE = 1000

/**
 * Busca wait times de um parque em uma data específica.
 * Usa paginação para contornar o limite de 1000 registros do Supabase.
 */
export function useWaitTimes(parkId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['waitTimes', parkId, date],
    queryFn: async (): Promise<WaitTime[]> => {
      if (!parkId || !date) return []

      // date é uma data de Orlando (YYYY-MM-DD)
      // Precisamos converter para os limites UTC corretos
      const startUTC = getOrlandoDayStartUTC(date)
      const endUTC = getOrlandoDayEndUTC(date)

      // Busca paginada para contornar limite de 1000 registros do Supabase
      const allData: WaitTime[] = []
      let page = 0
      let hasMore = true

      while (hasMore) {
        const from = page * PAGE_SIZE
        const to = from + PAGE_SIZE - 1

        const { data, error } = await supabase
          .from('wait_times')
          .select('*, attractions!inner(id, name, type, park_id)')
          .eq('attractions.park_id', parkId)
          .gte('recorded_at', startUTC)
          .lt('recorded_at', endUTC)
          .order('recorded_at')
          .range(from, to)

        if (error) throw error

        if (data && data.length > 0) {
          allData.push(...data)
          hasMore = data.length === PAGE_SIZE
          page++
        } else {
          hasMore = false
        }
      }

      return allData
    },
    enabled: !!parkId && !!date,
    staleTime: 1000 * 60 * 2, // 2 minutes - wait times update frequently
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  })
}

/**
 * Transforma os dados brutos em uma grid para exibição
 */
export function transformToGrid(rawData: WaitTime[]): GridData {
  const grid: Record<string, AttractionGridData> = {}
  const timeSlots = new Set<string>()

  rawData.forEach(record => {
    const attractionName = record.attractions.name
    const attractionType = record.attractions.type || 'Área'
    const time = utcToOrlandoTime(record.recorded_at)

    if (!grid[attractionName]) {
      grid[attractionName] = {
        name: attractionName,
        type: attractionType,
        times: {},
        waits: [],
        avgWait: null,
      }
    }

    grid[attractionName].times[time] = {
      wait: record.wait_minutes,
      status: record.status,
    }

    // Adicionar à lista de esperas (para média)
    if (record.wait_minutes !== null && record.status === 'OPERATING') {
      grid[attractionName].waits.push(record.wait_minutes)
    }

    timeSlots.add(time)
  })

  // Calcular média para cada atração
  const attractions = Object.values(grid).map(attr => {
    const validWaits = attr.waits
    attr.avgWait = validWaits.length > 0
      ? Math.round(validWaits.reduce((a, b) => a + b, 0) / validWaits.length)
      : null
    return attr
  })

  // Ordenar por média de espera (maior primeiro)
  attractions.sort((a, b) => {
    if (a.avgWait === null && b.avgWait === null) return 0
    if (a.avgWait === null) return 1
    if (b.avgWait === null) return -1
    return b.avgWait - a.avgWait
  })

  return {
    attractions,
    timeSlots: [...timeSlots].sort(),
  }
}
