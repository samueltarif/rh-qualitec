# Correção: Benefícios e Cargo na Folha de Pagamento

## Problemas Identificados

1. **Benefícios não preenchendo**: Os campos de benefícios não estavam sendo carregados do cadastro do colaborador
2. **Cargo não aparecendo**: O campo cargo não estava sendo exibido corretamente

## Correções Realizadas

### 1. API de Colaboradores (`server/api/colaboradores/[id].get.ts`)

**Antes:**
- Tentava buscar relacionamentos com tabelas `cargos` e `departamentos` que podem não existir
- Não garantia valores padrão para campos de benefícios
- Falhava se os relacionamentos não existissem

**Depois:**
- Tenta buscar com relacionamentos primeiro
- Se falhar, busca sem relacionamentos (fallback)
- Usa o campo `cargo` direto se o relacionamento não existir
- Garante valores padrão para todos os campos de benefícios:
  - `recebe_vt`, `valor_vt`
  - `recebe_vr`, `valor_vr`
  - `recebe_va`, `valor_va`
  - `recebe_va_vr`, `valor_va_vr`
  - `plano_saude`, `plano_odonto`

### 2. Página de Folha de Pagamento (`app/pages/folha-pagamento.vue`)

**Melhorias:**
- Adicionado logs detalhados para debug
- Corrigido o uso do campo `cargo` (usa `cargo_nome` ou `cargo` direto)
- Adicionado valores exemplo para plano de saúde e odontológico quando o colaborador tem esses benefícios marcados

## Como Testar

### 1. Verificar Dados do Colaborador

Execute no Supabase SQL Editor:

```sql
SELECT
  id,
  nome,
  cargo,
  salario,
  recebe_vt,
  valor_vt,
  recebe_vr,
  valor_vr,
  recebe_va,
  valor_va,
  plano_saude,
  plano_odonto
FROM colaboradores
WHERE nome ILIKE '%samuel%'
LIMIT 1;
```

### 2. Testar no Sistema

1. Acesse a página de **Folha de Pagamento**
2. Selecione o mês e ano
3. Clique em **Calcular Folha**
4. Clique em **Editar** em qualquer colaborador
5. Abra o **Console do Navegador** (F12)
6. Verifique os logs:
   - `=== ABRINDO MODAL EDIÇÃO ===`
   - `=== RESPOSTA DA API ===`
   - `=== DEBUG BENEFÍCIOS ===`

### 3. Verificar o Modal

No modal de edição, verifique:

**Seção "Dados do Colaborador":**
- ✅ Nome aparece
- ✅ CPF aparece
- ✅ **Cargo aparece** (não mais "-")
- ✅ Salário Base aparece

**Seção "Benefícios (Proventos)":**
- ✅ Vale Transporte pré-preenchido (se colaborador recebe)
- ✅ Vale Refeição pré-preenchido (se colaborador recebe)
- ✅ Vale Alimentação pré-preenchido (se colaborador recebe)
- ✅ Plano de Saúde pré-preenchido (se colaborador tem)
- ✅ Plano Odontológico pré-preenchido (se colaborador tem)

**Resumo do Holerite (coluna direita):**
- ✅ Total Benefícios aparece se houver benefícios

## Estrutura de Campos Esperada

A tabela `colaboradores` deve ter os seguintes campos:

```sql
-- Campos de benefícios
recebe_vt BOOLEAN DEFAULT false
valor_vt NUMERIC(10,2) DEFAULT 0
recebe_vr BOOLEAN DEFAULT false
valor_vr NUMERIC(10,2) DEFAULT 0
recebe_va BOOLEAN DEFAULT false
valor_va NUMERIC(10,2) DEFAULT 0
recebe_va_vr BOOLEAN DEFAULT false
valor_va_vr NUMERIC(10,2) DEFAULT 0
plano_saude BOOLEAN DEFAULT false
plano_odonto BOOLEAN DEFAULT false

-- Campo de cargo
cargo TEXT  -- ou relacionamento com tabela cargos
```

## Próximos Passos

Se os benefícios ainda não aparecerem:

1. **Verificar se os campos existem na tabela:**
   ```sql
   SELECT column_name, data_type
   FROM information_schema.columns 
   WHERE table_name = 'colaboradores'
     AND column_name LIKE '%v%'
   ORDER BY column_name;
   ```

2. **Adicionar campos se não existirem:**
   Execute o script `database/ADICIONAR_CAMPOS_BENEFICIOS.sql`

3. **Cadastrar benefícios para o colaborador:**
   - Vá em Colaboradores
   - Edite o colaborador
   - Marque os benefícios que ele recebe
   - Informe os valores

## Observações Importantes

- Os benefícios são **proventos** (não descontos)
- Eles aparecem no holerite mas não afetam o salário líquido
- São pagos pela empresa
- Os valores podem ser ajustados no modal para cada mês específico
- O cargo agora aparece corretamente, seja de um relacionamento ou campo direto

## Debug

Se ainda houver problemas, verifique no console:

```javascript
// Deve aparecer algo como:
=== RESPOSTA DA API ===
{
  id: 1,
  nome: "SAMUEL BARRETOS TARIF",
  cargo: "Desenvolvedor",
  cargo_nome: "Desenvolvedor",
  recebe_vt: true,
  valor_vt: 200,
  recebe_vr: true,
  valor_vr: 500,
  // ...
}

=== DEBUG BENEFÍCIOS ===
recebe_vt: true valor_vt: 200
recebe_vr: true valor_vr: 500
recebe_va: true valor_va: 300

Benefícios calculados: {
  vale_transporte: 200,
  vale_refeicao: 500,
  vale_alimentacao: 300,
  plano_saude: 150,
  plano_odontologico: 50
}
```

Se os valores aparecerem como `undefined` ou `null`, significa que os campos não existem na tabela ou não estão preenchidos no cadastro do colaborador.
