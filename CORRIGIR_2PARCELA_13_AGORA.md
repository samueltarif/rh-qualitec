# 🔧 CORRIGIR 2ª PARCELA DO 13º SALÁRIO - ERRO nome_colaborador NULL

## ❌ Problema
```
null value in column "nome_colaborador" of relation "holerites" violates not-null constraint
Erro ao gerar 13º para colaborador 3e37b565-9ce3-4917-851f-7d50e2669e6c: Colaborador não encontrado
```

## 🎯 Causa
O colaborador não está sendo encontrado pela API, provavelmente por:
1. RLS (Row Level Security) bloqueando o acesso
2. ID do colaborador incorreto
3. Colaborador com status inativo

## ✅ SOLUÇÃO RÁPIDA

### ⚠️ IMPORTANTE: O status é "Ativo" com A MAIÚSCULO!

### PASSO 1: Verificar o Colaborador no Supabase

Abra o **Supabase SQL Editor** e execute:

```sql
-- Ver TODOS os colaboradores ativos (ATENÇÃO: "Ativo" com A maiúsculo!)
SELECT 
  c.id,
  c.nome,
  c.cpf,
  c.salario,
  car.nome as cargo_nome,
  dep.nome as departamento_nome,
  c.status
FROM colaboradores c
LEFT JOIN cargos car ON c.cargo_id = car.id
LEFT JOIN departamentos dep ON c.departamento_id = dep.id
WHERE c.status = 'Ativo'  -- ⚠️ É "Ativo" com A maiúsculo!
ORDER BY c.nome;
```

**Anote o ID correto do colaborador que você quer gerar a 2ª parcela.**

---

### PASSO 2: Corrigir RLS (Se necessário)

Se o colaborador não aparecer, execute:

```sql
-- Garantir acesso total para authenticated users
DROP POLICY IF EXISTS "authenticated_select_colaboradores" ON colaboradores;
CREATE POLICY "authenticated_select_colaboradores"
ON colaboradores
FOR SELECT
TO authenticated
USING (true);
```

---

### PASSO 3: Gerar 2ª Parcela Manualmente

**Substitua o ID** no script abaixo pelo ID correto encontrado no PASSO 1:

```sql
DO $$
DECLARE
  v_colaborador_id UUID := 'COLE_O_ID_AQUI'; -- ⚠️ AJUSTE AQUI
  v_colaborador RECORD;
  v_salario_base NUMERIC;
  v_meses_trabalhados INTEGER;
  v_valor_13 NUMERIC;
  v_inss NUMERIC;
  v_irrf NUMERIC;
  v_liquido NUMERIC;
BEGIN
  -- Buscar colaborador
  SELECT 
    c.*,
    car.nome as cargo_nome,
    dep.nome as departamento_nome
  INTO v_colaborador
  FROM colaboradores c
  LEFT JOIN cargos car ON c.cargo_id = car.id
  LEFT JOIN departamentos dep ON c.departamento_id = dep.id
  WHERE c.id = v_colaborador_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Colaborador % não encontrado', v_colaborador_id;
  END IF;

  -- Calcular valores
  v_salario_base := COALESCE(v_colaborador.salario, 0);
  v_meses_trabalhados := 12;
  v_valor_13 := (v_salario_base / 12) * v_meses_trabalhados;
  v_inss := LEAST(v_valor_13 * 0.14, 908.85);
  v_irrf := GREATEST((v_valor_13 - v_inss) * 0.15 - 381.44, 0);
  v_liquido := (v_valor_13 / 2) - v_inss - v_irrf;

  -- Inserir holerite da 2ª parcela
  INSERT INTO holerites (
    colaborador_id,
    mes,
    ano,
    tipo,
    parcela_13,
    nome_colaborador,
    cpf,
    cargo,
    departamento,
    salario_base,
    salario_bruto,
    total_proventos,
    inss,
    irrf,
    total_descontos,
    salario_liquido,
    fgts,
    meses_trabalhados,
    observacoes,
    status
  ) VALUES (
    v_colaborador_id,
    12,
    2025,
    'decimo_terceiro',
    '2',
    v_colaborador.nome,
    v_colaborador.cpf,
    COALESCE(v_colaborador.cargo_nome, 'Não informado'),
    COALESCE(v_colaborador.departamento_nome, 'Não informado'),
    v_salario_base,
    v_valor_13,
    v_valor_13 / 2,
    v_inss,
    v_irrf,
    v_inss + v_irrf,
    v_liquido,
    v_valor_13 * 0.08,
    v_meses_trabalhados,
    '13º Salário - 2ª Parcela (Com Descontos) - 2025',
    'gerado'
  )
  ON CONFLICT (colaborador_id, mes, ano) 
  DO UPDATE SET
    tipo = EXCLUDED.tipo,
    parcela_13 = EXCLUDED.parcela_13,
    nome_colaborador = EXCLUDED.nome_colaborador,
    cpf = EXCLUDED.cpf,
    cargo = EXCLUDED.cargo,
    departamento = EXCLUDED.departamento,
    salario_base = EXCLUDED.salario_base,
    salario_bruto = EXCLUDED.salario_bruto,
    total_proventos = EXCLUDED.total_proventos,
    inss = EXCLUDED.inss,
    irrf = EXCLUDED.irrf,
    total_descontos = EXCLUDED.total_descontos,
    salario_liquido = EXCLUDED.salario_liquido,
    fgts = EXCLUDED.fgts,
    meses_trabalhados = EXCLUDED.meses_trabalhados,
    observacoes = EXCLUDED.observacoes,
    updated_at = NOW();

  RAISE NOTICE 'Holerite da 2ª parcela gerado com sucesso para %', v_colaborador.nome;
END $$;
```

---

### PASSO 4: Verificar Resultado

```sql
SELECT 
  h.id,
  h.nome_colaborador,
  h.mes,
  h.ano,
  h.tipo,
  h.parcela_13,
  h.salario_base,
  h.total_proventos,
  h.total_descontos,
  h.salario_liquido,
  h.status
FROM holerites h
WHERE h.ano = 2025
  AND h.tipo = 'decimo_terceiro'
ORDER BY h.nome_colaborador, h.mes;
```

---

## 🔍 ALTERNATIVA: Usar a Interface

Se preferir usar a interface do sistema:

1. Vá em **Folha de Pagamento** > **13º Salário**
2. Clique em **Gerar 2ª Parcela**
3. **Selecione APENAS os colaboradores que aparecem na lista**
4. Se algum colaborador não aparecer, é porque:
   - Está inativo
   - Não tem salário cadastrado
   - Tem problema de RLS

---

## 📋 Checklist

- [ ] Executei PASSO 1 e encontrei o ID correto
- [ ] Executei PASSO 2 (se necessário)
- [ ] Ajustei o ID no script do PASSO 3
- [ ] Executei o script do PASSO 3
- [ ] Verifiquei o resultado no PASSO 4
- [ ] Holerite da 2ª parcela foi gerado com sucesso

---

## 🆘 Se Ainda Não Funcionar

Execute este diagnóstico completo:

```sql
-- Ver estrutura da tabela colaboradores
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'colaboradores'
ORDER BY ordinal_position;

-- Ver políticas RLS
SELECT policyname, cmd, qual
FROM pg_policies
WHERE tablename = 'colaboradores';

-- Ver se RLS está habilitado
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'colaboradores';
```

E me envie o resultado para análise.
