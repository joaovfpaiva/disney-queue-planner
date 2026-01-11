import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { getQueueClass } from '@/lib/queue-utils'
import { formatTimeLocal } from '@/lib/orlando-timezone'
import type { AttractionGridData, ParkSchedule } from '@/types'

interface QueueTableProps {
  attractions: AttractionGridData[]
  timeSlots: string[]
  schedule: ParkSchedule | null
  isLoading: boolean
  parkId: string | null
}

export function QueueTable({ attractions, timeSlots, schedule, isLoading, parkId }: QueueTableProps) {
  const [selectedAttractions, setSelectedAttractions] = useState<Set<string>>(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const [lastParkId, setLastParkId] = useState<string | null>(null)

  // Reset filters when park changes - select all attractions of new park
  useEffect(() => {
    if (parkId && parkId !== lastParkId) {
      setLastParkId(parkId)
      setSelectedAttractions(new Set())
    }
  }, [parkId, lastParkId])

  // Initialize/update filter when attractions change
  useEffect(() => {
    if (attractions.length > 0) {
      setSelectedAttractions(new Set(attractions.map(a => a.name)))
    }
  }, [attractions])

  // Handle scroll propagation - when at top/bottom of table, propagate to window
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const container = tableContainerRef.current
    if (!container) return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtTop = scrollTop === 0
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1

    // If scrolling up and at top, or scrolling down and at bottom, let it propagate
    if ((e.deltaY < 0 && isAtTop) || (e.deltaY > 0 && isAtBottom)) {
      // Don't prevent default - let it scroll the page
      return
    }
    
    // Otherwise, scroll within the table
    // Don't need to do anything special, the default behavior handles it
  }, [])

  const filteredAttractions = useMemo(() => {
    if (selectedAttractions.size === 0) return attractions
    return attractions.filter(a => selectedAttractions.has(a.name))
  }, [attractions, selectedAttractions])

  const toggleAttraction = (name: string) => {
    setSelectedAttractions(prev => {
      const next = new Set(prev)
      if (next.has(name)) {
        next.delete(name)
      } else {
        next.add(name)
      }
      return next
    })
  }

  const selectAll = () => setSelectedAttractions(new Set(attractions.map(a => a.name)))
  const selectNone = () => setSelectedAttractions(new Set())

  if (isLoading) {
    return (
      <div className="table-container">
        <div className="loading-overlay">
          <div className="spinner"></div>
          <span className="loading-text">Carregando dados...</span>
        </div>
      </div>
    )
  }

  if (attractions.length === 0) {
    return (
      <div className="table-container">
        <div className="empty-state">
          <span className="empty-state-icon">📭</span>
          <h3>Nenhum dado disponível</h3>
          <p>Não há dados de tempo de fila para esta data.</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="filter-container">
        <div className="filter-dropdown">
          <button className="filter-trigger" onClick={() => setFilterOpen(!filterOpen)}>
            <span>
              {selectedAttractions.size === attractions.length
                ? 'Todas as atrações'
                : selectedAttractions.size === 0
                ? 'Nenhuma selecionada'
                : `${selectedAttractions.size} de ${attractions.length} selecionadas`}
            </span>
          </button>
          
          {filterOpen && (
            <div className="filter-panel">
              <div className="filter-panel-header">
                <span className="filter-panel-title">Selecionar atrações</span>
                <div className="filter-quick-actions">
                  <button className="filter-quick-btn" onClick={selectAll}>Todas</button>
                  <button className="filter-quick-btn" onClick={selectNone}>Nenhuma</button>
                </div>
              </div>
              <div className="filter-list">
                {attractions.map(attr => (
                  <label key={attr.name} className="filter-item">
                    <input
                      type="checkbox"
                      checked={selectedAttractions.has(attr.name)}
                      onChange={() => toggleAttraction(attr.name)}
                    />
                    <span className="filter-item-name">{attr.name}</span>
                    <span className={`filter-item-avg ${getQueueClass(attr.avgWait)}`}>
                      {attr.avgWait ?? '—'}
                    </span>
                  </label>
                ))}
              </div>
              <div className="filter-panel-footer">
                <button className="filter-ok-btn" onClick={() => setFilterOpen(false)}>OK</button>
              </div>
            </div>
          )}
        </div>
        <span className="filter-count">
          {filteredAttractions.length} de {attractions.length} atrações
        </span>
      </div>

      <div 
        className="table-container" 
        ref={tableContainerRef}
        onWheel={handleWheel}
      >
        <table className="queue-table">
          <thead>
            <tr>
              <th>Horário</th>
              {filteredAttractions.map(attr => (
                <th key={attr.name} className="attraction-col" title={attr.name}>
                  <div className="attraction-header">
                    <div className="attraction-name">{attr.name}</div>
                    <div className={`attraction-avg ${getQueueClass(attr.avgWait)}`}>
                      {attr.avgWait ?? '—'}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(time => {
              const isHourMark = time.endsWith(':00')
              const isEarly = schedule?.early_entry && 
                time < formatTimeLocal(schedule.open_time)

              return (
                <tr key={time}>
                  <td className={`time-cell ${isHourMark ? 'hour-mark' : ''} ${isEarly ? 'early-entry' : ''}`}>
                    {time}
                  </td>
                  {filteredAttractions.map(attr => {
                    const data = attr.times[time]
                    
                    if (!data) {
                      return (
                        <td key={attr.name} className="attraction-cell">
                          <div className="queue-cell closed">
                            <span className="queue-badge">-</span>
                          </div>
                        </td>
                      )
                    }
                    
                    if (data.status === 'CLOSED') {
                      return (
                        <td key={attr.name} className="attraction-cell">
                          <div className="queue-cell closed">
                            <span className="queue-badge">—</span>
                          </div>
                        </td>
                      )
                    }
                    
                    if (data.status === 'DOWN') {
                      return (
                        <td key={attr.name} className="attraction-cell">
                          <div className="queue-cell down">
                            <span className="queue-badge">⚠</span>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td key={attr.name} className="attraction-cell">
                        <div className={`queue-cell ${getQueueClass(data.wait)}`}>
                          <span className="queue-badge">{data.wait}</span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
