# 🧪 Teste de Sincronização - Ponto Colaboradores

## 🎯 Objetivo
Verificar se colaboradores e gestores veem **exatamente os mesmos dados** de ponto.

---

## 📋 Pré-requisitos

### 1. Executar Correção SQL
```sql
-- Executar no Supabase SQL Editor
\i nuxt-app/FIX_URGENTE_SINCRONIZACAO_PONTO_COLABORADORES.sql
```

### 2. Reiniciar Servidor
```bash
# No terminal do projeto
npm run dev
# ou
yarn dev
```

---

## 🧪 Testes de Validação

### Teste 1: Verificar Registros do CORINTHIANS

**Como Gestor:**
1. Login como administrador
2. Ir para "Ponto" → "Registros"
3. Filtrar por colaborador "CORINTHIANS"
4. Verificar período dezembro/2025
5. **Anotar:** dias, horários e totais

**Como Colaborador:**
1. Login como CORINTHIANS
2. Ir para aba "Ponto"
3. Verificar mesmo período (dezembro/2025)
4. **Comparar:** deve ser IDÊNTICO ao que o gestor vê

**Resultado Esperado:**
- ✅ Mesmos dias trabalhados
- ✅ Mesmos horários (entrada, intervalo, saída)
- ✅ Mesmo total de horas
- ✅ Dia 18/12/2025 presente em ambos
- ✅ Dia 17/12/2025 com apenas entrada (07:35:00)

---

### Teste 2: Relatório HTML

**Como Gestor:**
1. Gerar relatório HTML do CORINTHIANS
2. Verificar estrutura e dados

**Como Colaborador:**
1. Baixar relatório HTML próprio
2. Comparar com o do gestor

**Resultado Esperado:**
- ✅ Estrutura idêntica
- ✅ Dados idênticos
- ✅ Totais idênticos

---

### Teste 3: Assinatura Digital

**Como Colaborador:**
1. Tentar assinar digitalmente o ponto
2. Verificar se funciona sem erro 404

**Resultado Esperado:**
- ✅ Assinatura funciona
- ✅ Dados corretos no arquivo gerado
- ✅ Hash de verificação criado

---

## 🔍 Diagnóstico SQL

### Verificar Registros Atuais
```sql
-- Ver registros do CORINTHIANS
SELECT 
    c.nome,
    rp.data,
    rp.entrada_1,
    rp.saida_1,
    rp.entrada_2,
    rp.saida_2,
    -- Calcular horas
    CASE 
        WHEN rp.entrada_1 IS NOT NULL AND rp.saida_2 IS NOT NULL THEN
            ROUND(
                EXTRACT(EPOCH FROM (
                    (rp.data + rp.saida_2) - (rp.data + rp.entrada_1) -
                    COALESCE(
                        CASE WHEN rp.saida_1 IS NOT NULL AND rp.entrada_2 IS NOT NULL 
                             THEN (rp.data + rp.entrada_2) - (rp.data + rp.saida_1)
                             ELSE INTERVAL '0'
                        END,
                        INTERVAL '0'
                    )
                )) / 3600, 2
            )
        ELSE 0
    END as horas_trabalhadas
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE c.nome ILIKE '%CORINTHIANS%'
  AND rp.data >= '2025-12-01'
ORDER BY rp.data DESC;
```

### Verificar Duplicatas
```sql
-- Verificar se há registros duplicados
SELECT 
    colaborador_id,
    data,
    COUNT(*) as total_registros
FROM registros_ponto
WHERE data >= '2025-12-01'
GROUP BY colaborador_id, data
HAVING COUNT(*) > 1;
```

### Verificar Vínculos
```sql
-- Verificar vínculos de usuários
SELECT 
    c.nome,
    c.auth_uid,
    au.nome as nome_app_user,
    au.email
FROM colaboradores c
LEFT JOIN app_users au ON c.auth_uid = au.auth_uid
WHERE c.nome ILIKE '%CORINTHIANS%';
```

---

## 🚨 Problemas Comuns

### Problema: Dados ainda divergentes
**Solução:**
1. Limpar cache do navegador (Ctrl+F5)
2. Verificar se o SQL foi executado
3. Reiniciar servidor

### Problema: Colaborador não consegue ver registros
**Solução:**
1. Verificar vínculo auth_uid
2. Executar SQL de correção de vínculos
3. Fazer logout/login

### Problema: Erro 404 na assinatura
**Solução:**
1. Executar `FIX_ASSINATURA_DIGITAL_VINCULOS_AGORA.sql`
2. Verificar se colaborador tem auth_uid

---

## ✅ Checklist de Validação

- [ ] SQL de correção executado
- [ ] Servidor reiniciado
- [ ] Registros do CORINTHIANS corretos
- [ ] Gestor vê dados corretos
- [ ] Colaborador vê mesmos dados do gestor
- [ ] Relatório HTML idêntico
- [ ] Assinatura digital funciona
- [ ] Dia 18/12/2025 presente
- [ ] Cálculo de horas correto
- [ ] Sem registros duplicados

---

## 🎯 Resultado Final Esperado

**ANTES (Problema):**
- Gestor vê: Registros completos com dia 18/12
- Colaborador vê: Dados divergentes, horários diferentes

**DEPOIS (Corrigido):**
- Gestor vê: Registros completos com dia 18/12
- Colaborador vê: **EXATAMENTE OS MESMOS DADOS**

---

## 📞 Suporte

Se algum teste falhar:

1. **Verificar logs do console** (F12 no navegador)
2. **Executar SQLs de diagnóstico** acima
3. **Limpar cache** e tentar novamente
4. **Verificar se o servidor foi reiniciado**

**Status:** ✅ Correção implementada e pronta para teste!