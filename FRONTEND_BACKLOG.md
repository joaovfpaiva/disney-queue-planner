# Disney Queue Planner - Backlog do Frontend

## Objetivo

Criar uma interface web para visualizar os tempos de fila coletados, ajudando no planejamento de roteiros nos parques.

---

## Stack Recomendada

- **HTML/CSS/JS** puro (já existe um protótipo)
- **Hospedagem**: Netlify (free tier)
- **Dados**: Supabase REST API

---

## Tarefas

### 1. ✅ Protótipo Visual (FEITO)

Arquivo `disney-queue-visualizer.html` com:
- Layout dark theme
- Grid de visualização (atração × horário)
- Gradiente de cores para wait times
- Dados simulados (mock)

---

### 2. 🔄 Integrar com Supabase (PRINCIPAL)

Substituir dados mock por dados reais do Supabase.

#### 2.1 Configurar conexão

Configurar variáveis de ambiente `SUPABASE_URL` e `SUPABASE_ANON_KEY` no Netlify.

#### 2.2 Carregar lista de parques

```javascript
async function loadParks() {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/parks?select=id,name&order=name`,
        { headers }
    );
    return response.json();
}
```

Popular o dropdown de seleção de parques.

#### 2.3 Carregar datas disponíveis

Quando selecionar um parque, buscar datas que têm dados:

```javascript
async function loadAvailableDates(parkId) {
    // Buscar park_schedules com dados
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/park_schedules?park_id=eq.${parkId}&select=date&order=date.desc`,
        { headers }
    );
    return response.json();
}
```

#### 2.4 Carregar wait times

Quando selecionar parque + data:

```javascript
async function loadWaitTimes(parkId, date) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/wait_times?select=*,attractions!inner(id,name,type)&attractions.park_id=eq.${parkId}&recorded_at=gte.${date}T00:00:00Z&recorded_at=lt.${date}T23:59:59Z&order=recorded_at`,
        { headers }
    );
    return response.json();
}
```

#### 2.5 Transformar dados para o grid

```javascript
function transformToGrid(rawData) {
    const grid = {};
    const timeSlots = new Set();
    
    rawData.forEach(record => {
        const attractionName = record.attractions.name;
        const time = record.recorded_at.substring(11, 16); // HH:MM UTC
        
        if (!grid[attractionName]) {
            grid[attractionName] = {
                name: attractionName,
                land: record.attractions.type,
                times: {}
            };
        }
        
        grid[attractionName].times[time] = {
            wait: record.wait_minutes,
            status: record.status
        };
        
        timeSlots.add(time);
    });
    
    return {
        attractions: Object.values(grid),
        timeSlots: [...timeSlots].sort()
    };
}
```

#### 2.6 Carregar horários do parque

Para mostrar early_entry, open_time, close_time:

```javascript
async function loadParkSchedule(parkId, date) {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/park_schedules?park_id=eq.${parkId}&date=eq.${date}&select=*`,
        { headers }
    );
    const data = await response.json();
    return data[0]; // Retorna o primeiro (único) registro
}
```

---

### 3. 🔄 Melhorias de UX

#### 3.1 Loading states
- Mostrar spinner enquanto carrega dados
- Desabilitar controles durante loading

#### 3.2 Empty states
- Mensagem quando não há dados para a data selecionada
- Sugestão de datas com dados disponíveis

#### 3.3 Error handling
- Mostrar mensagem amigável se API falhar
- Retry automático

#### 3.4 Conversão de timezone
- Dados vêm em UTC
- Converter para horário de Orlando (EST/EDT)

```javascript
function utcToOrlando(utcString) {
    const date = new Date(utcString);
    return date.toLocaleTimeString('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    });
}
```

---

### 4. 🔄 Features Adicionais

#### 4.1 Filtro por área (land)
- Checkbox para filtrar atrações por área
- Ex: mostrar só Fantasyland

#### 4.2 Destaque Early Entry
- Visual diferente para horários de Early Entry
- Usar campo `is_early_entry` ou comparar com `open_time`

#### 4.3 Estatísticas
- Média de espera por atração
- Melhor horário do dia (menor média geral)
- Pico de movimento

#### 4.4 Comparação de dias
- Selecionar múltiplas datas
- Comparar padrões (ex: sábado vs terça)

#### 4.5 Auto-refresh
- Atualizar dados automaticamente a cada 10 min
- Indicador de "última atualização"

```javascript
setInterval(() => {
    if (isToday(selectedDate)) {
        loadWaitTimes(selectedPark, selectedDate);
    }
}, 10 * 60 * 1000); // 10 minutos
```

---

### 5. 🔄 Deploy no Netlify

#### 5.1 Preparar arquivos
- `index.html` (ou renomear o visualizer)
- Verificar se todas as dependências são CDN

#### 5.2 Criar repositório GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/seu-usuario/disney-queue-planner.git
git push -u origin main
```

#### 5.3 Conectar Netlify
1. Acessar netlify.com
2. "Add new site" → "Import an existing project"
3. Conectar GitHub
4. Selecionar o repositório
5. Build settings:
   - Build command: (deixar vazio)
   - Publish directory: `/` ou `.`
6. Deploy

#### 5.4 Configurar domínio (opcional)
- Netlify oferece subdomínio gratuito: `seu-site.netlify.app`
- Pode conectar domínio próprio se tiver

---

## Estrutura de Arquivos Sugerida

```
disney-queue-planner/
├── index.html          # Página principal
├── css/
│   └── styles.css      # Estilos (extrair do HTML)
├── js/
│   ├── config.js       # Configurações Supabase
│   ├── api.js          # Funções de fetch
│   ├── utils.js        # Helpers (timezone, formatação)
│   └── app.js          # Lógica principal
└── README.md           # Documentação
```

**Alternativa**: Manter tudo em um único HTML se preferir simplicidade.

---

## Prioridades

| Prioridade | Tarefa | Esforço |
|------------|--------|---------|
| 🔴 Alta | Integrar Supabase (buscar dados reais) | 2h |
| 🔴 Alta | Popular dropdowns dinamicamente | 1h |
| 🔴 Alta | Renderizar grid com dados reais | 2h |
| 🟡 Média | Loading/error states | 1h |
| 🟡 Média | Conversão timezone | 30min |
| 🟡 Média | Deploy Netlify | 30min |
| 🟢 Baixa | Filtro por área | 1h |
| 🟢 Baixa | Estatísticas | 2h |
| 🟢 Baixa | Auto-refresh | 30min |
| 🟢 Baixa | Comparação de dias | 3h |

---

## Credenciais Necessárias

Para o frontend funcionar, configure as variáveis de ambiente no Netlify:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

**Onde encontrar**:
1. Acesse o Supabase Dashboard
2. Settings → API
3. Copie Project URL e anon/public key (NÃO a service_role!)

---

## Referência: Cores do Grid

O protótipo usa esse gradiente para tempos de espera:

| Minutos | Cor | Hex |
|---------|-----|-----|
| 0-14 | Verde | `#10b981` |
| 15-29 | Verde claro | `#22c55e` |
| 30-44 | Lima | `#84cc16` |
| 45-59 | Amarelo | `#eab308` |
| 60-74 | Laranja | `#f97316` |
| 75-89 | Vermelho | `#ef4444` |
| 90-119 | Vermelho escuro | `#dc2626` |
| 120+ | Vermelho muito escuro | `#991b1b` |

```javascript
function getWaitTimeColor(minutes) {
    if (minutes === null) return '#333'; // Fechado
    if (minutes < 15) return '#10b981';
    if (minutes < 30) return '#22c55e';
    if (minutes < 45) return '#84cc16';
    if (minutes < 60) return '#eab308';
    if (minutes < 75) return '#f97316';
    if (minutes < 90) return '#ef4444';
    if (minutes < 120) return '#dc2626';
    return '#991b1b';
}
```
