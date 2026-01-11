import { useMemo } from 'react'
import type { AttractionGridData } from '@/types'

interface StatsPanelProps {
  attractions: AttractionGridData[]
}

export function StatsPanel({ attractions }: StatsPanelProps) {
  const stats = useMemo(() => {
    const allWaits: number[] = []
    
    attractions.forEach(attr => {
      Object.values(attr.times).forEach(data => {
        if (data.wait !== null && data.status === 'OPERATING') {
          allWaits.push(data.wait)
        }
      })
    })

    if (allWaits.length === 0) return null

    const avg = Math.round(allWaits.reduce((a, b) => a + b, 0) / allWaits.length)
    const min = Math.min(...allWaits)
    const max = Math.max(...allWaits)

    return { avg, min, max }
  }, [attractions])

  const bestTimes = useMemo(() => {
    return attractions
      .filter(attr => attr.avgWait !== null)
      .slice(0, 5)
      .map(attr => {
        const waits = Object.entries(attr.times)
          .filter(([_, d]) => d.wait !== null && d.status === 'OPERATING')
          .map(([time, d]) => ({ time, wait: d.wait as number }))
        
        if (waits.length === 0) return null

        const minWait = Math.min(...waits.map(w => w.wait))
        const bestSlot = waits.find(w => w.wait === minWait)

        return {
          name: attr.name,
          time: bestSlot?.time || '',
          wait: minWait,
        }
      })
      .filter(Boolean)
  }, [attractions])

  if (!stats) return null

  return (
    <div className="stats-panel">
      <div className="stat-card">
        <h3>📊 Resumo do Dia</h3>
        <div className="summary-stats">
          <div className="summary-stat">
            <div className="summary-stat-value">{stats.avg}</div>
            <div className="summary-stat-label">Média (min)</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{stats.min}</div>
            <div className="summary-stat-label">Mínimo (min)</div>
          </div>
          <div className="summary-stat">
            <div className="summary-stat-value">{stats.max}</div>
            <div className="summary-stat-label">Máximo (min)</div>
          </div>
        </div>
      </div>

      <div className="stat-card">
        <h3>⏰ Melhores Horários</h3>
        <div className="best-times">
          {bestTimes.map(item => item && (
            <div key={item.name} className="best-time-item">
              <span className="best-time-attraction">{item.name}</span>
              <span className="best-time-value">{item.time} → {item.wait} min</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
