import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { ParkSchedule } from '@/types'

export function useParkSchedule(parkId: string | null, date: string | null) {
  return useQuery({
    queryKey: ['parkSchedule', parkId, date],
    queryFn: async (): Promise<ParkSchedule | null> => {
      if (!parkId || !date) return null

      const { data, error } = await supabase
        .from('park_schedules')
        .select('*')
        .eq('park_id', parkId)
        .eq('date', date)
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = not found
      return data || null
    },
    enabled: !!parkId && !!date,
    staleTime: 1000 * 60 * 60, // 1 hour - schedule doesn't change
  })
}
