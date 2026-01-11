import { useState, useEffect, useMemo } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Header } from '@/components/Header'
import { ScheduleBar } from '@/components/ScheduleBar'
import { QueueTable } from '@/components/QueueTable'
import { StatsPanel } from '@/components/StatsPanel'
import { useParks } from '@/hooks/useParks'
import { useAvailableDates } from '@/hooks/useAvailableDates'
import { useParkSchedule } from '@/hooks/useParkSchedule'
import { useWaitTimes, transformToGrid } from '@/hooks/useWaitTimes'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
})

function QueuePlanner() {
  const [selectedParkId, setSelectedParkId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const { data: parks = [] } = useParks()
  const { data: dates = [] } = useAvailableDates(selectedParkId)
  const { data: schedule } = useParkSchedule(selectedParkId, selectedDate)
  const { data: waitTimes = [], isLoading: isLoadingWaitTimes } = useWaitTimes(selectedParkId, selectedDate)

  // Auto-select first park
  useEffect(() => {
    if (parks.length > 0 && !selectedParkId) {
      setSelectedParkId(parks[0].id)
    }
  }, [parks, selectedParkId])

  // Auto-select first date when park changes
  useEffect(() => {
    if (dates.length > 0) {
      // Keep current date if available in new park
      if (selectedDate && dates.includes(selectedDate)) {
        return
      }
      setSelectedDate(dates[0])
    }
  }, [dates])

  const handleParkChange = (parkId: string) => {
    setSelectedParkId(parkId)
  }

  const handleDateChange = (date: string) => {
    setSelectedDate(date)
  }

  const gridData = useMemo(() => {
    return transformToGrid(waitTimes)
  }, [waitTimes])

  return (
    <div className="app-container">
      <Header
        selectedParkId={selectedParkId}
        selectedDate={selectedDate}
        onParkChange={handleParkChange}
        onDateChange={handleDateChange}
      />

      <ScheduleBar schedule={schedule ?? null} />

      <QueueTable
        attractions={gridData.attractions}
        timeSlots={gridData.timeSlots}
        schedule={schedule ?? null}
        isLoading={isLoadingWaitTimes}
        parkId={selectedParkId}
      />

      {gridData.attractions.length > 0 && (
        <StatsPanel attractions={gridData.attractions} />
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <QueuePlanner />
    </QueryClientProvider>
  )
}
