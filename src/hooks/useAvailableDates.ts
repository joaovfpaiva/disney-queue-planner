import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { utcToOrlandoDate } from '@/lib/orlando-timezone'

export function useAvailableDates(parkId: string | null) {
  return useQuery({
    queryKey: ['availableDates', parkId],
    queryFn: async (): Promise<string[]> => {
      if (!parkId) return []

      const { data, error } = await supabase
        .from('wait_times')
        .select('recorded_at, attractions!inner(park_id)')
        .eq('attractions.park_id', parkId)
        .order('recorded_at', { ascending: false })

      if (error) throw error

      // Extrai datas únicas convertendo UTC -> Orlando
      const dates = [...new Set((data || []).map(d => utcToOrlandoDate(d.recorded_at)))]
      return dates.sort().reverse()
    },
    enabled: !!parkId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
