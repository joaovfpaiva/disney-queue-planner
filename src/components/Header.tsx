import { useParks, groupParks } from '@/hooks/useParks'
import { useAvailableDates } from '@/hooks/useAvailableDates'
import { formatDateBR } from '@/lib/orlando-timezone'

interface HeaderProps {
  selectedParkId: string | null
  selectedDate: string | null
  onParkChange: (parkId: string) => void
  onDateChange: (date: string) => void
}

export function Header({ selectedParkId, selectedDate, onParkChange, onDateChange }: HeaderProps) {
  const { data: parks = [], isLoading: isLoadingParks } = useParks()
  const { data: dates = [], isLoading: isLoadingDates } = useAvailableDates(selectedParkId)

  const grouped = groupParks(parks)
  const selectedPark = parks.find(p => p.id === selectedParkId)

  return (
    <header className="header">
      <div className="logo-section">
        <div className="logo">🏰</div>
        <h1>
          Queue Planner{' '}
          <span>/ {selectedPark?.name || 'Disney World'}</span>
        </h1>
      </div>
      
      <div className="controls">
        <div className="selector-group">
          <span className="selector-label">Parque</span>
          <div className="custom-select">
            <select
              value={selectedParkId || ''}
              onChange={(e) => onParkChange(e.target.value)}
              disabled={isLoadingParks}
            >
              {isLoadingParks ? (
                <option value="">Carregando parques...</option>
              ) : (
                <>
                  {grouped.disney.length > 0 && (
                    <optgroup label="Walt Disney World">
                      {grouped.disney.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {grouped.universal.length > 0 && (
                    <optgroup label="Universal Orlando">
                      {grouped.universal.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                  {grouped.others.length > 0 && (
                    <optgroup label="Outros">
                      {grouped.others.map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
            </select>
          </div>
        </div>

        <div className="selector-group">
          <span className="selector-label">Data</span>
          <div className="custom-select">
            <select
              value={selectedDate || ''}
              onChange={(e) => onDateChange(e.target.value)}
              disabled={isLoadingDates || !selectedParkId}
            >
              {!selectedParkId ? (
                <option value="">Selecione um parque</option>
              ) : isLoadingDates ? (
                <option value="">Carregando datas...</option>
              ) : dates.length === 0 ? (
                <option value="">Nenhuma data disponível</option>
              ) : (
                dates.map(date => (
                  <option key={date} value={date}>
                    {formatDateBR(date)}
                  </option>
                ))
              )}
            </select>
          </div>
        </div>
      </div>
    </header>
  )
}
