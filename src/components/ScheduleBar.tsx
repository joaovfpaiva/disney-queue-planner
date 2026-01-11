import { formatTimeLocal } from '@/lib/orlando-timezone'
import type { ParkSchedule } from '@/types'

interface ScheduleBarProps {
  schedule: ParkSchedule | null
}

export function ScheduleBar({ schedule }: ScheduleBarProps) {
  if (!schedule) return null

  return (
    <div className="schedule-bar">
      <div className="schedule-item">
        <span className="schedule-item-icon">🌅</span>
        <span className="schedule-item-label">Early Entry:</span>
        <span className="schedule-item-value early">
          {formatTimeLocal(schedule.early_entry)}
        </span>
      </div>
      <div className="schedule-item">
        <span className="schedule-item-icon">🚪</span>
        <span className="schedule-item-label">Abertura:</span>
        <span className="schedule-item-value">
          {formatTimeLocal(schedule.open_time)}
        </span>
      </div>
      <div className="schedule-item">
        <span className="schedule-item-icon">🌙</span>
        <span className="schedule-item-label">Fechamento:</span>
        <span className="schedule-item-value">
          {formatTimeLocal(schedule.close_time)}
        </span>
      </div>
    </div>
  )
}
