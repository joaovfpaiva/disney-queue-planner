export interface Park {
  id: string
  name: string
  thrill_api_id: string
  themeparks_entity_id: string | null
  timezone: string
}

export interface Attraction {
  id: string
  park_id: string
  name: string
  thrill_api_id: string
  type: string | null
  is_active: boolean
}

export interface ParkSchedule {
  id: string
  park_id: string
  date: string
  early_entry: string | null
  open_time: string
  close_time: string
}

export interface WaitTime {
  id: string
  attraction_id: string
  recorded_at: string
  wait_minutes: number | null
  status: 'OPERATING' | 'CLOSED' | 'DOWN'
  is_early_entry: boolean
  attractions: {
    id: string
    name: string
    type: string | null
    park_id: string
  }
}

export interface AttractionGridData {
  name: string
  type: string
  times: Record<string, { wait: number | null; status: string }>
  waits: number[]
  avgWait: number | null
}

export interface GridData {
  attractions: AttractionGridData[]
  timeSlots: string[]
}
