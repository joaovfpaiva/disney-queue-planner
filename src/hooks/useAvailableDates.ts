import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Busca datas disponíveis para um parque usando RPC otimizada.
 * A função get_available_dates faz DISTINCT diretamente no banco,
 * retornando apenas as datas únicas (muito mais eficiente).
 */
export function useAvailableDates(parkId: string | null) {
  return useQuery({
    queryKey: ['availableDates', parkId],
    queryFn: async (): Promise<string[]> => {
      if (!parkId) return []

      const { data, error } = await supabase
        .rpc('get_available_dates', { p_park_id: parkId })

      if (error) throw error

      // RPC retorna array de { date: 'YYYY-MM-DD' }, já ordenado DESC
      return (data || []).map((d: { date: string }) => d.date)
    },
    enabled: !!parkId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
