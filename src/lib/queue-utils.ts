/**
 * Retorna a classe CSS baseada no tempo de espera
 */
export function getQueueClass(waitTime: number | null): string {
  if (waitTime === null) return 'closed'
  if (waitTime <= 20) return 'q-low'       // ≤20 min - muito bom (verde escuro)
  if (waitTime <= 35) return 'q-medium'    // 21-35 min - bom (verde claro)
  if (waitTime <= 59) return 'q-normal'    // 36-59 min - ok (amarelo leve)
  if (waitTime <= 79) return 'q-high'      // 60-79 min - alto (laranja leve)
  return 'q-extreme'                        // ≥80 min - evitar (vermelho)
}

/**
 * Retorna a classe CSS baseada no status
 */
export function getStatusClass(status: string): string {
  if (status === 'DOWN') return 'down'
  if (status === 'CLOSED') return 'closed'
  return ''
}
