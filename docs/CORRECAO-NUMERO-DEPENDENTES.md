# 🔧 Correção: Campo numero_dependentes

## ❌ Problema Identificado

O campo `numero_dependentes` não estava sendo salvo quando alterado no formulário de funcionários.

## 🔍 Causa Raiz

O campo estava presente no formulário frontend, mas **não estava sendo processado** nas APIs do backend:

### APIs Afetadas:
1. `server/api/funcionarios/index.post.ts` - Criação de funcionários
2. `server/api/funcionarios/[id].patch.ts` - Edição de funcionários  
3. `server/api/funcionarios/meus-dados.patch.ts` - Funcionário editando próprios dados

## ✅ Correção Aplicada

### 1. API de Criação (`index.post.ts`)
```javascript
// ✅ ADICIONADO
numero_dependentes: cleanValue(body.numero_dependentes) || 0,
```

### 2. API de Edição (`[id].patch.ts`)
```javascript
// ✅ ADICIONADO
if (body.numero_dependentes !== undefined) dadosParaAtualizar.numero_dependentes = cleanValue(body.numero_dependentes) || 0
```

### 3. API Meus Dados (`meus-dados.patch.ts`)
```javascript
// ✅ ADICIONADO
numero_dependentes: body.numero_dependentes,
```

## 🧪 Teste Realizado

✅ **Campo funciona corretamente:**
- Coluna existe no banco de dados
- Dados são salvos e atualizados
- Funcionários podem editar seus próprios dependentes
- Admins podem editar dependentes de qualquer funcionário

## 📊 Impacto no IRRF

Agora o cálculo de IRRF 2026 funcionará corretamente considerando:
- **Dedução por dependente:** R$ 189,59 cada
- **Base IRRF correta:** Salário - INSS - (Dependentes × R$ 189,59)
- **Tributação adequada** conforme número real de dependentes

## 🎯 Resultado

O campo `numero_dependentes` agora é salvo corretamente em todas as operações:
- ✅ Criação de funcionário
- ✅ Edição pelo admin
- ✅ Edição pelo próprio funcionário
- ✅ Cálculo de IRRF preciso