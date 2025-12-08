# 🚀 Setup do Sistema RH Qualitec

## ✅ Configuração Concluída

As seguintes configurações foram realizadas:

### 1. Variáveis de Ambiente
- ✅ `.env` criado com credenciais do Supabase
- ✅ `.env.example` criado como template
- ✅ `.gitignore` já configurado para ignorar `.env`

### 2. Configuração do Nuxt
- ✅ `nuxt.config.ts` atualizado com módulo Supabase
- ✅ Runtime config configurado
- ✅ Redirecionamentos configurados

### 3. Tailwind CSS
- ✅ `tailwind.config.ts` criado
- ✅ `app/assets/css/tailwind.css` criado com variáveis customizadas
- ✅ Cores do tema Admin (vermelho) e Employee (azul) configuradas

### 4. Dependências Adicionadas
- ✅ `@nuxtjs/supabase` - Integração Supabase
- ✅ `@supabase/supabase-js` - Cliente Supabase
- ✅ `nuxt-icon` - Ícones Heroicons
- ✅ `@playwright/test` - Testes E2E

---

## 📦 Próximos Passos

### 1. Instalar Dependências
```bash
cd nuxt-app
npm install
```

### 2. Verificar Conexão com Supabase
As credenciais já estão configuradas no `.env`:
- URL: https://utuxefswedolrninwgvs.supabase.co
- Anon Key: Configurada ✅
- Service Role Key: Configurada ✅

### 3. Executar Migrations no Supabase
Você precisará executar os seguintes arquivos SQL no Supabase (na ordem):
1. `00_schema.sql` - Estrutura de tabelas
2. `01_rls_policies.sql` - Políticas de segurança
3. `02_functions_triggers.sql` - Funções e triggers
4. `03_indexes_views.sql` - Índices e views
5. `04_seed.sql` - Dados de exemplo
6. `05_app_users_auth.sql` - Sistema de usuários
7. `06_seed_admin.sql` - Criar admin inicial

### 4. Iniciar Servidor de Desenvolvimento
```bash
npm run dev
```

O servidor estará disponível em: http://localhost:3000

---

## 🔐 Credenciais do Admin

Após executar as migrations, você poderá fazer login com:
- **Email:** silvana@qualitec.ind.br
- **Senha:** qualitec25

---

## 📁 Estrutura Criada

```
nuxt-app/
├── .env                          ✅ Credenciais (não commitado)
├── .env.example                  ✅ Template
├── nuxt.config.ts                ✅ Configuração Nuxt + Supabase
├── tailwind.config.ts            ✅ Configuração Tailwind
├── package.json                  ✅ Dependências atualizadas
├── app/
│   └── assets/
│       └── css/
│           └── tailwind.css      ✅ Estilos customizados
└── SETUP.md                      ✅ Este arquivo
```

---

## 🎨 Variáveis CSS Disponíveis

### Admin (Vermelho)
- `--admin-primary: #b91c1c`
- `--admin-secondary: #991b1b`
- `--admin-accent: #dc2626`

### Employee (Azul)
- `--employee-primary: #1e3a8a`
- `--employee-secondary: #1e40af`
- `--employee-accent: #2563eb`

### Status
- `--success: #10b981`
- `--warning: #f59e0b`
- `--error: #ef4444`
- `--info: #3b82f6`

---

## 🛠️ Classes Tailwind Customizadas

### Botões Admin
- `.admin-btn-primary` - Botão primário vermelho
- `.admin-btn-secondary` - Botão secundário vermelho

### Botões Employee
- `.employee-btn-primary` - Botão primário azul
- `.employee-btn-secondary` - Botão secundário azul

### Componentes
- `.card` - Card padrão
- `.input` - Input padrão
- `.badge` - Badge base
- `.badge-success` - Badge verde
- `.badge-warning` - Badge amarelo
- `.badge-error` - Badge vermelho
- `.badge-info` - Badge azul

---

## ⚠️ Importante

1. **Nunca commite o arquivo `.env`** - Ele contém credenciais sensíveis
2. **DATABASE_URL** - Você precisa substituir `[YOUR-PASSWORD]` pela senha real do banco
3. **Migrations** - Execute as migrations antes de iniciar o desenvolvimento

---

## 🐛 Troubleshooting

### Erro: "Module not found: @nuxtjs/supabase"
```bash
npm install
```

### Erro: "Invalid Supabase URL"
Verifique se as variáveis no `.env` estão corretas.

### Erro: "Failed to fetch"
Verifique se o projeto Supabase está ativo e acessível.

---

**Status:** ✅ Configuração de ambiente concluída
**Próximo passo:** Instalar dependências com `npm install`
