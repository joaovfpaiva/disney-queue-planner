# Roadmap - Disney Queue Planner

## 🐛 Bugs a Investigar

### EPCOT - Horário cortando às 19h

**Problema**: O EPCOT mostra dados apenas até 19:00 na tabela, mas no Supabase os dados vão até 21:00.

**Contexto**:
- O EPCOT fecha às 21:00 (horário de Orlando)
- No banco, `recorded_at` vai até ~02:00 UTC (que é 21:00 Orlando)
- A query `useWaitTimes` deveria trazer esses dados
- A função `utcToOrlandoTime` deveria converter corretamente

**Investigação necessária**:
1. Verificar se a query está retornando os dados corretos (adicionar log no hook)
2. Verificar se `getOrlandoDayEndUTC` está calculando o limite correto
3. Comparar com Epic Universe que funciona corretamente
4. Verificar se há algo específico com os dados do EPCOT

**Hipóteses**:
- A query pode estar usando limite errado
- Pode haver problema no cálculo de DST/EST
- Os dados podem estar sendo filtrados na renderização

---

## ✨ Features Planejadas

### Média dos Últimos 7 Dias

**Objetivo**: Permitir visualizar uma "média consolidada" dos tempos de fila dos últimos 7 dias, ao invés de ver apenas um dia específico.

**Benefício**: 
- Ver padrões de fila mais confiáveis
- Identificar melhores horários de forma consistente
- Reduzir variação de dias atípicos

**Implementação proposta**:

1. **UI**: Adicionar toggle ou opção no seletor de data:
   - "Data específica" (comportamento atual)
   - "Média 7 dias" (novo)

2. **Query**: Criar novo hook `useAverageWaitTimes`:
   ```typescript
   // Buscar dados dos últimos 7 dias
   // Agrupar por atração + horário
   // Calcular média de wait_minutes
   ```

3. **Visualização**:
   - Mesmo grid, mas com valores médios
   - Indicador visual de que é média (não tempo real)
   - Possivelmente mostrar desvio padrão ou variação

4. **Considerações**:
   - Performance: pode ser muitos dados para processar no frontend
   - Alternativa: criar view materializada no Supabase
   - Cache: usar `staleTime` maior para dados históricos

---

## 📋 Backlog Geral

- [ ] Bug EPCOT 19h
- [ ] Feature média 7 dias
- [ ] PWA / Offline support
- [ ] Notificações de fila baixa
- [ ] Comparação entre parques
- [ ] Exportar roteiro otimizado
- [ ] Dark/Light mode toggle
