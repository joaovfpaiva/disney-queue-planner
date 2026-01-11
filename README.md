# Disney Queue Planner 🏰

Sistema de visualização de tempos de fila de parques temáticos em Orlando. Acompanhe os dados coletados a cada 10 minutos e planeje seu roteiro de forma inteligente.

![Queue Planner Preview](https://img.shields.io/badge/status-live-brightgreen) ![Made with Love](https://img.shields.io/badge/made%20with-♥-red)

## 🎢 Parques Monitorados

| Grupo | Parques |
|-------|---------|
| 🏰 **Walt Disney World** | Magic Kingdom, EPCOT, Hollywood Studios, Animal Kingdom |
| 🎬 **Universal Orlando** | Universal Studios, Islands of Adventure, Epic Universe |
| 🐬 **Outros** | SeaWorld Orlando, Busch Gardens Tampa |

## ✨ Funcionalidades

- 📊 **Grid de Visualização** - Tempos de fila por atração × horário
- 🎨 **Gradiente de Cores** - Verde (baixo) → Vermelho (alto)
- 📅 **Histórico** - Consulte dados de dias anteriores
- ⏰ **Horários do Parque** - Early Entry, abertura e fechamento
- 📈 **Estatísticas** - Média, mínimo, máximo e melhores horários
- 🔄 **Auto-refresh** - Atualiza automaticamente para o dia atual
- 🌴 **Timezone Orlando** - Todos os horários em America/New_York

## 🛠️ Tech Stack

- **React 18** + TypeScript
- **Vite** - Build tool
- **TanStack Query** - Data fetching + caching
- **date-fns-tz** - Timezone handling
- **Supabase** - Backend (PostgreSQL)

## 🚀 Desenvolvimento Local

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/park-queue-planner.git
cd park-queue-planner

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp env.example .env.local
# Edite .env.local com suas credenciais do Supabase

# Iniciar servidor de desenvolvimento
npm run dev
```

O app estará disponível em `http://localhost:5173`

## 🚀 Deploy (Netlify)

1. Fork ou clone este repositório
2. Conecte ao Netlify:
   - Acesse [netlify.com](https://netlify.com)
   - "Add new site" → "Import an existing project"
   - Conecte seu GitHub
   - Selecione o repositório
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `dist`
3. Configure as variáveis de ambiente no Netlify:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

## ⚙️ Configuração do Supabase

**Onde encontrar as credenciais:**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings → API**
3. Copie **Project URL** e **anon/public key**

> ⚠️ **IMPORTANTE**: Use a chave `anon`, não a `service_role`!

## 📁 Estrutura de Arquivos

```
park-queue-planner/
├── src/
│   ├── components/          # Componentes React
│   │   ├── Header.tsx
│   │   ├── ScheduleBar.tsx
│   │   ├── QueueTable.tsx
│   │   └── StatsPanel.tsx
│   ├── hooks/               # React Query hooks
│   │   ├── useParks.ts
│   │   ├── useAvailableDates.ts
│   │   ├── useParkSchedule.ts
│   │   └── useWaitTimes.ts
│   ├── lib/                 # Utilitários
│   │   ├── supabase.ts
│   │   ├── orlando-timezone.ts
│   │   └── queue-utils.ts
│   ├── types/               # TypeScript types
│   ├── App.tsx
│   ├── App.css
│   └── main.tsx
├── legacy/                  # Versão antiga (vanilla JS)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── netlify.toml
├── BACKEND_DOCUMENTATION.md
├── ROADMAP.md               # Bugs e features planejadas
└── README.md
```

## 📊 Schema do Banco de Dados

```
parks (9 parques)
  └── attractions (~300 atrações)
        └── wait_times (dados a cada 10 min)
  └── park_schedules (horários diários)
```

Veja a documentação completa em [BACKEND_DOCUMENTATION.md](./BACKEND_DOCUMENTATION.md).

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Queue-Times    │     │     n8n         │     │    Supabase     │
│  (API externa)  │────▶│   (Railway)     │────▶│   (PostgreSQL)  │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                         │
                                                         ▼
                                                ┌─────────────────┐
                                                │  React + Vite   │
                                                │   (Netlify)     │
                                                └─────────────────┘
```

## 💡 Dicas de Uso

- **Filas verdes (≤20 min)**: Excelente hora para ir!
- **Filas amarelas (36-59 min)**: Aceitável, considere Lightning Lane
- **Filas vermelhas (≥80 min)**: Evite, procure outro horário
- **Early Entry**: Horários antes da abertura oficial (destacados)

## 💰 Custos

| Serviço | Plano | Custo |
|---------|-------|-------|
| Supabase | Free | $0 |
| Railway | Starter | ~$5/mês |
| Netlify | Free | $0 |
| **Total** | | **~$5/mês** |

## 🙏 Créditos

- Dados de tempo de fila: [Queue-Times.com](https://queue-times.com)
- Horários dos parques: [ThemeParks.wiki](https://themeparks.wiki)

## 📄 Licença

Este projeto é para uso pessoal. Os dados de tempo de fila são propriedade dos respectivos parques.

---

Feito com 🏰 para planejar a viagem perfeita!
