import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Park } from '@/types'

export function useParks() {
  return useQuery({
    queryKey: ['parks'],
    queryFn: async (): Promise<Park[]> => {
      const { data, error } = await supabase
        .from('parks')
        .select('id, name, thrill_api_id, themeparks_entity_id, timezone')
        .order('name')

      if (error) throw error
      return data || []
    },
    staleTime: 1000 * 60 * 60, // 1 hour - parks don't change
  })
}

// Group parks by category for display
export function groupParks(parks: Park[]) {
  const disney = parks.filter(p => 
    ['magic-kingdom', 'epcot', 'hollywood-studios', 'animal-kingdom'].includes(p.id)
  )
  const universal = parks.filter(p => 
    ['universal-studios', 'islands-adventure', 'epic-universe'].includes(p.id)
  )
  const others = parks.filter(p => 
    ['seaworld', 'busch-gardens'].includes(p.id)
  )

  return { disney, universal, others }
}
