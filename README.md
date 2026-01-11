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

## 🚀 Deploy

### Opção 1: Netlify (Recomendado)

1. Fork ou clone este repositório
2. Conecte ao Netlify:
   - Acesse [netlify.com](https://netlify.com)
   - "Add new site" → "Import an existing project"
   - Conecte seu GitHub
   - Selecione o repositório
   - Build settings:
     - Build command: (deixar vazio)
     - Publish directory: `.`
3. Configure as credenciais do Supabase na interface do app

### Opção 2: GitHub Pages

1. Vá em Settings → Pages
2. Selecione a branch `main` e pasta `/root`
3. O site estará disponível em `https://seu-usuario.github.io/disney-queue-planner`

## ⚙️ Configuração do Supabase

### Opção 1: Variáveis de Ambiente no Netlify (Recomendado)

As credenciais são configuradas no painel do Netlify, **nunca no código**:

1. No Netlify, vá em **Site settings → Environment variables**
2. Adicione as variáveis:
   - `SUPABASE_URL` = `https://xxxxx.supabase.co`
   - `SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Faça um novo deploy (Deploys → Trigger deploy)

**Onde encontrar as credenciais:**
1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **Settings → API**
3. Copie **Project URL** e **anon/public key**

> ⚠️ **IMPORTANTE**: Use a chave `anon`, não a `service_role`!

### Opção 2: Configuração Manual (Modal)

Se as variáveis de ambiente não estiverem configuradas, o app mostrará um modal pedindo as credenciais. Elas são salvas no localStorage do seu navegador.

### Desenvolvimento Local

Para rodar localmente, crie um arquivo `.env` baseado no `env.example`:

```bash
cp env.example .env
# Edite o .env com suas credenciais
```

Depois rode o build:
```bash
node build.js
```

> O arquivo `.env` está no `.gitignore` e **nunca será commitado**.

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
                                                │    Frontend     │
                                                │   (Netlify)     │
                                                └─────────────────┘
```

## 💡 Dicas de Uso

- **Filas verdes (0-30 min)**: Excelente hora para ir!
- **Filas amarelas (30-60 min)**: Aceitável, considere Lightning Lane
- **Filas vermelhas (60+ min)**: Evite, procure outro horário
- **Early Entry**: Horários antes da abertura oficial (destacados)

## 📁 Estrutura de Arquivos

```
disney-queue-planner/
├── index.html                    # App principal (HTML + CSS + JS)
├── config.js                     # Gerado pelo build (não commitado)
├── build.js                      # Script de build para Netlify
├── netlify.toml                  # Configuração do Netlify
├── env.example                   # Template de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados
├── disney-queue-visualizer.html  # Protótipo original (mock data)
├── BACKEND_DOCUMENTATION.md      # Documentação do schema
├── FRONTEND_BACKLOG.md           # Backlog de features
└── README.md                     # Este arquivo
```

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
