# ⚡ SOLUÇÃO RÁPIDA - Erro de Ponto

## 🎯 Execute estes 3 passos

### PASSO 1: Diagnóstico Rápido
Execute no **Supabase SQL Editor**:
```
nuxt-app/database/TESTE_RAPIDO_PONTO.sql
```

Isso vai mostrar:
- ✅ Se RLS está ativo
- ✅ Quais políticas existem
- ✅ Se usuários têm vínculos corretos

### PASSO 2: Aplicar Fix
Execute no **Supabase SQL Editor**:
```
nuxt-app/database/fixes/FIX_PONTO_SIMPLES.sql
```

Isso vai:
- 🔧 Remover políticas antigas
- 🔧 Criar políticas corretas
- 🔧 Ativar RLS
- 🔧 Mostrar verificação dos dados

### PASSO 3: Reiniciar Servidor
```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
cd nuxt-app
npm run dev
```

## 🧪 Testar

1. **Login como funcionário** → Clicar no card Ponto → Registrar ponto
2. **Login como admin** → Clicar no card Ponto → Ver registros

## ❌ Se ainda der erro

Verifique no resultado do PASSO 1:

### Problema: Usuário sem colaborador_id
```sql
-- Encontrar colaborador
SELECT id, nome FROM colaboradores WHERE email = 'email@usuario.com';

-- Vincular
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR'
WHERE email = 'email@usuario.com';
```

### Problema: Colaborador sem empresa_id
```sql
-- Encontrar empresa
SELECT id, nome_fantasia FROM empresas LIMIT 1;

-- Vincular
UPDATE colaboradores 
SET empresa_id = 'UUID_DA_EMPRESA'
WHERE id = 'UUID_DO_COLABORADOR';
```

## 📋 Checklist

- [ ] PASSO 1 executado - Diagnóstico OK
- [ ] PASSO 2 executado - Fix aplicado
- [ ] PASSO 3 executado - Servidor reiniciado
- [ ] Teste funcionário OK
- [ ] Teste admin OK

## 🆘 Suporte

Se o erro persistir, envie:
1. Screenshot do resultado do PASSO 1
2. Mensagem de erro completa do console do navegador
3. Logs do servidor (terminal onde roda `npm run dev`)
