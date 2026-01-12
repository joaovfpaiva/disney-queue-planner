# Disney Queue Planner - Documentação do Backend

## Visão Geral

Sistema de coleta e visualização de tempos de fila de parques temáticos em Orlando.

**Stack Backend**:
- **Banco de Dados**: Supabase (PostgreSQL)
- **Automação**: n8n (Railway)
- **APIs**: Queue-Times.com + ThemeParks.wiki

**Status**: ✅ Backend 100% funcional e coletando dados a cada 10 minutos

---

## Conexão com Supabase

```javascript
const SUPABASE_URL = 'https://SEU_PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'sua-anon-key-aqui';

// Headers para todas as requisições
const headers = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json'
};
```

**Nota**: A `anon key` é segura para usar no frontend - o RLS (Row Level Security) está configurado para permitir apenas leitura.

---

## Schema do Banco de Dados

### Tabela: `parks`

Lista dos 9 parques monitorados.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | VARCHAR(50) | **PK**. Ex: `magic-kingdom`, `epcot` |
| `name` | VARCHAR(100) | Nome do parque |
| `thrill_api_id` | VARCHAR(50) | ID na API Queue-Times |
| `themeparks_entity_id` | VARCHAR(50) | ID na API ThemeParks.wiki |
| `timezone` | VARCHAR(50) | Default: `America/New_York` |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Dados atuais**:
```
id                  | name                      | thrill_api_id
--------------------|---------------------------|---------------
magic-kingdom       | Magic Kingdom             | 6
epcot               | EPCOT                     | 5
hollywood-studios   | Hollywood Studios         | 7
animal-kingdom      | Animal Kingdom            | 8
universal-studios   | Universal Studios Florida | 65
islands-adventure   | Islands of Adventure      | 64
epic-universe       | Epic Universe             | 334
seaworld            | SeaWorld Orlando          | 21
busch-gardens       | Busch Gardens Tampa       | 24
```

---

### Tabela: `attractions`

Atrações de cada parque (~300 total).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | VARCHAR(100) | **PK**. Formato: `{park_id}-{thrill_api_id}` |
| `park_id` | VARCHAR(50) | **FK** → parks.id |
| `name` | VARCHAR(200) | Nome da atração |
| `thrill_api_id` | VARCHAR(50) | ID na API Queue-Times |
| `type` | VARCHAR(100) | Área do parque (land). Ex: `Fantasyland`, `Tomorrowland` |
| `is_active` | BOOLEAN | Se está ativa |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Exemplo**:
```
id                      | park_id         | name                    | type
------------------------|-----------------|-------------------------|-------------
magic-kingdom-129       | magic-kingdom   | Seven Dwarfs Mine Train | Fantasyland
magic-kingdom-138       | magic-kingdom   | Space Mountain          | Tomorrowland
magic-kingdom-11527     | magic-kingdom   | TRON Lightcycle / Run   | Tomorrowland
```

---

### Tabela: `park_schedules`

Horários de funcionamento diários.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | **PK** |
| `park_id` | VARCHAR(50) | **FK** → parks.id |
| `date` | DATE | Data |
| `early_entry` | TIME | Horário Early Entry (pode ser null) |
| `open_time` | TIME | Horário de abertura |
| `close_time` | TIME | Horário de fechamento |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Constraint**: `UNIQUE(park_id, date)`

**Exemplo**:
```
park_id         | date       | early_entry | open_time | close_time
----------------|------------|-------------|-----------|------------
magic-kingdom   | 2026-01-10 | 08:30       | 09:00     | 22:00
magic-kingdom   | 2026-01-16 | 07:30       | 08:00     | 22:00
epcot           | 2026-01-10 | 09:30       | 10:00     | 21:00
```

---

### Tabela: `wait_times`

Dados de tempo de fila coletados (tabela principal).

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | UUID | **PK** |
| `attraction_id` | VARCHAR(100) | **FK** → attractions.id |
| `recorded_at` | TIMESTAMPTZ | Momento da coleta |
| `wait_minutes` | INTEGER | Tempo de espera em minutos (null se fechado) |
| `status` | VARCHAR(20) | `OPERATING`, `CLOSED`, ou `DOWN` |
| `is_early_entry` | BOOLEAN | Se foi coletado durante Early Entry |
| `created_at` | TIMESTAMPTZ | Data de criação |

**Coleta**: A cada 10 minutos (cron: `*/10 * * * *`)

**Exemplo**:
```
attraction_id           | recorded_at              | wait_minutes | status     | is_early_entry
------------------------|--------------------------|--------------|------------|----------------
magic-kingdom-129       | 2026-01-10T14:00:00Z     | 45           | OPERATING  | false
magic-kingdom-138       | 2026-01-10T14:00:00Z     | 35           | OPERATING  | false
magic-kingdom-130       | 2026-01-10T14:00:00Z     | null         | CLOSED     | false
```

---

## Índices

```sql
CREATE INDEX idx_wait_times_attraction_id ON wait_times(attraction_id);
CREATE INDEX idx_wait_times_recorded_at ON wait_times(recorded_at);
CREATE INDEX idx_attractions_park_id ON attractions(park_id);
CREATE INDEX idx_park_schedules_date ON park_schedules(date);
```

---

## Queries Úteis (Exemplos de Endpoints)

### 1. Buscar todos os parques

```javascript
const response = await fetch(
    `${SUPABASE_URL}/rest/v1/parks?select=*&order=name`,
    { headers }
);
const parks = await response.json();
```

---

### 2. Buscar atrações de um parque

```javascript
const parkId = 'magic-kingdom';
const response = await fetch(
    `${SUPABASE_URL}/rest/v1/attractions?park_id=eq.${parkId}&is_active=eq.true&select=*&order=name`,
    { headers }
);
const attractions = await response.json();
```

---

### 3. Buscar horário de um parque em uma data

```javascript
const parkId = 'magic-kingdom';
const date = '2026-01-10';
const response = await fetch(
    `${SUPABASE_URL}/rest/v1/park_schedules?park_id=eq.${parkId}&date=eq.${date}&select=*`,
    { headers }
);
const schedule = await response.json();
```

---

### 4. Buscar wait times de um parque em uma data (PRINCIPAL)

```javascript
const parkId = 'magic-kingdom';
const date = '2026-01-10';

const response = await fetch(
    `${SUPABASE_URL}/rest/v1/wait_times?select=*,attractions!inner(id,name,type,park_id)&attractions.park_id=eq.${parkId}&recorded_at=gte.${date}T00:00:00Z&recorded_at=lt.${date}T23:59:59Z&order=recorded_at`,
    { headers }
);
const waitTimes = await response.json();
```

**Resposta**:
```json
[
  {
    "id": "uuid",
    "attraction_id": "magic-kingdom-129",
    "recorded_at": "2026-01-10T14:00:00Z",
    "wait_minutes": 45,
    "status": "OPERATING",
    "is_early_entry": false,
    "attractions": {
      "id": "magic-kingdom-129",
      "name": "Seven Dwarfs Mine Train",
      "type": "Fantasyland",
      "park_id": "magic-kingdom"
    }
  }
]
```

---

### 5. Buscar datas disponíveis com dados (RPC Otimizada)

**⚠️ Importante**: Não use query direta na tabela `wait_times` para buscar datas únicas! Com milhares de registros, isso é extremamente ineficiente e bate no limite de 1000 registros do Supabase.

**Solução**: Use a função RPC `get_available_dates` que faz `DISTINCT` diretamente no banco:

```javascript
// ✅ Forma correta - usa RPC
const { data, error } = await supabase
  .rpc('get_available_dates', { p_park_id: parkId });

// Retorna: [{ date: '2026-01-11' }, { date: '2026-01-10' }, ...]
const dates = data.map(d => d.date);
```

**SQL da função RPC** (já criada no Supabase):
```sql
CREATE OR REPLACE FUNCTION get_available_dates(p_park_id TEXT)
RETURNS TABLE(date TEXT) 
LANGUAGE sql
STABLE
AS $$
  SELECT DISTINCT 
    TO_CHAR(
      wt.recorded_at AT TIME ZONE 'America/New_York', 
      'YYYY-MM-DD'
    ) as date
  FROM wait_times wt
  INNER JOIN attractions a ON a.id = wt.attraction_id
  WHERE a.park_id = p_park_id
  ORDER BY date DESC;
$$;
```

---

### 6. Buscar wait times agrupados por horário (para grid)

Para montar a visualização em grid, você vai precisar:
1. Buscar todos os wait_times do dia
2. Agrupar por `recorded_at` (arredondado para 10 min)
3. Montar a matriz atração × horário

```javascript
// Buscar dados
const parkId = 'magic-kingdom';
const date = '2026-01-10';

const response = await fetch(
    `${SUPABASE_URL}/rest/v1/wait_times?select=*,attractions!inner(id,name,type)&attractions.park_id=eq.${parkId}&recorded_at=gte.${date}T00:00:00Z&recorded_at=lt.${date}T23:59:59Z`,
    { headers }
);
const rawData = await response.json();

// Agrupar por atração e horário
const grid = {};
const timeSlots = new Set();

rawData.forEach(record => {
    const attractionName = record.attractions.name;
    const time = record.recorded_at.substring(11, 16); // HH:MM
    
    if (!grid[attractionName]) {
        grid[attractionName] = {};
    }
    grid[attractionName][time] = {
        wait: record.wait_minutes,
        status: record.status
    };
    timeSlots.add(time);
});

// Ordenar time slots
const sortedSlots = [...timeSlots].sort();
```

---

## Diagrama de Relacionamentos

```
┌─────────────────┐
│     parks       │
├─────────────────┤
│ id (PK)         │───┐
│ name            │   │
│ thrill_api_id   │   │
└─────────────────┘   │
                      │
        ┌─────────────┴─────────────┐
        │                           │
        ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│  attractions    │       │ park_schedules  │
├─────────────────┤       ├─────────────────┤
│ id (PK)         │───┐   │ id (PK)         │
│ park_id (FK)    │   │   │ park_id (FK)    │
│ name            │   │   │ date            │
│ type (land)     │   │   │ early_entry     │
└─────────────────┘   │   │ open_time       │
                      │   │ close_time      │
                      │   └─────────────────┘
                      │
                      ▼
              ┌─────────────────┐
              │   wait_times    │
              ├─────────────────┤
              │ id (PK)         │
              │ attraction_id   │
              │ recorded_at     │
              │ wait_minutes    │
              │ status          │
              │ is_early_entry  │
              └─────────────────┘
```

---

## Notas Importantes

### Timezone
- **wait_times.recorded_at**: `TIMESTAMPTZ` em **UTC** (ex: `2026-01-10T14:00:00Z`)
- **park_schedules.date**: `DATE` no **horário de Orlando** (ex: `2026-01-10`)
- **park_schedules.early_entry/open_time/close_time**: `TIME` no **horário de Orlando** (ex: `09:00:00`)
- Orlando usa **America/New_York** (EST = UTC-5, EDT = UTC-4)
- O frontend converte automaticamente UTC → Orlando usando `toLocaleString` com timezone
- **Importante**: Ao buscar dados de uma data de Orlando, converter os limites para UTC:
  - Ex: Para buscar dados de 10/jan Orlando:
    - Início: `2026-01-10T05:00:00Z` (meia-noite Orlando = 05:00 UTC em EST)
    - Fim: `2026-01-11T05:00:00Z`

### Status das Atrações
- `OPERATING`: Funcionando normalmente
- `CLOSED`: Fechada (manutenção, horário, etc)
- `DOWN`: Quebrada/parada temporária

### Early Entry
- Disney oferece entrada antecipada para hóspedes de hotéis
- Campo `is_early_entry` indica se o dado foi coletado antes da abertura oficial
- Útil para análise separada desses horários

### Frequência de Coleta
- Workflow roda a cada **10 minutos** nos múltiplos de 10 (10:00, 10:10, 10:20...)
- Só coleta de parques **abertos** no momento
- Considera `early_entry` como horário de início

---

## Volume de Dados Estimado

| Tabela | Registros Atuais | Crescimento |
|--------|------------------|-------------|
| parks | 9 | Fixo |
| attractions | ~300 | Fixo |
| park_schedules | ~270 | +9/dia |
| wait_times | Crescendo | ~300 × 6/hora × 12h × 9 parques = ~194k/dia |

**Nota**: O Supabase free tier tem 500MB, suficiente para semanas de dados.

---

## Limites e Paginação do Supabase

### Limite de 1000 registros

O Supabase tem um limite padrão de **1000 registros por query**. Isso pode ser alterado no dashboard (Settings → API → Max Rows), mas para garantir robustez, o frontend implementa paginação.

### Paginação no Frontend

O hook `useWaitTimes` usa paginação automática para buscar todos os dados de um parque/dia:

```typescript
const PAGE_SIZE = 1000;
const allData: WaitTime[] = [];
let page = 0;
let hasMore = true;

while (hasMore) {
  const from = page * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data } = await supabase
    .from('wait_times')
    .select('*, attractions!inner(...)')
    .eq('attractions.park_id', parkId)
    .gte('recorded_at', startUTC)
    .lt('recorded_at', endUTC)
    .order('recorded_at')
    .range(from, to);  // Paginação

  allData.push(...data);
  hasMore = data.length === PAGE_SIZE;
  page++;
}
```

### Otimizações Implementadas

| Query | Problema | Solução |
|-------|----------|---------|
| Datas disponíveis | Trazia 40k+ registros para extrair ~3 datas | RPC `get_available_dates` com DISTINCT no banco |
| Wait times do dia | Podia passar de 1000 registros | Paginação automática com `.range()` |

### Funções RPC Disponíveis

| Função | Parâmetros | Retorno |
|--------|------------|---------|
| `get_available_dates` | `p_park_id: TEXT` | `TABLE(date TEXT)` - Datas únicas no timezone de Orlando |
