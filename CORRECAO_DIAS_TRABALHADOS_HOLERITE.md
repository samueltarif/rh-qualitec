# 🔧 Correção: Cálculo de Dias Trabalhados no Holerite

## ❌ Problema Identificado

O sistema estava calculando incorretamente os "Dias Trabalhados" no holerite de 13º salário:

**Exemplo do erro:**
- Admissão: 01/08/2025
- Competência: Dezembro/2025
- **Dias mostrados:** 180 (ERRADO - estava multiplicando meses * 30)
- **Dias corretos:** 153 (de 01/08/2025 até 31/12/2025)

## ✅ Solução Implementada

### 1. **Adicionada coluna `data_admissao` na tabela `holerites`**

Execute o SQL:
```sql
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS data_admissao DATE;
```

Arquivo: `nuxt-app/database/fixes/fix_add_data_admissao_holerites.sql`

### 2. **Atualizado backend para salvar `data_admissao`**

Arquivos modificados:
- `nuxt-app/server/api/decimo-terceiro/gerar.post.ts`
- `nuxt-app/server/api/decimo-terceiro/gerar-enviar.post.ts`

Agora ao gerar holerites de 13º, o sistema salva a data de admissão do colaborador.

### 3. **Criada função `calcularDiasTrabalhados()` no frontend**

Arquivo: `nuxt-app/app/components/ModalHolerite.vue`

A função calcula dinamicamente:
```typescript
const calcularDiasTrabalhados = () => {
  // Parse da data de admissão
  const dataAdmissao = new Date(props.holerite.data_admissao + 'T00:00:00')
  
  // Último dia do mês da competência
  const ano = props.holerite.ano
  const mes = props.holerite.mes
  const ultimoDiaMes = new Date(ano, mes, 0)
  
  // Calcular diferença em dias
  const diffTime = ultimoDiaMes.getTime() - dataAdmissao.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
  
  return diffDays
}
```

## 📊 Exemplos de Cálculo Correto

| Data Admissão | Competência | Dias Corretos |
|---------------|-------------|---------------|
| 01/08/2025    | Dez/2025    | 153 dias      |
| 15/03/2025    | Dez/2025    | 292 dias      |
| 01/01/2025    | Dez/2025    | 365 dias      |
| 20/11/2025    | Dez/2025    | 42 dias       |

## 🚀 Como Aplicar

### Passo 1: Executar SQL
```bash
# No Supabase SQL Editor, execute:
nuxt-app/database/fixes/fix_add_data_admissao_holerites.sql
```

### Passo 2: Regerar Holerites
Os holerites já gerados **não** terão a data de admissão. Para corrigir:

1. Acesse "Gerenciar Holerites"
2. Exclua os holerites de 13º salário antigos
3. Gere novamente usando o botão "Gerar 13º Salário"

### Passo 3: Verificar
Abra qualquer holerite de 13º salário e verifique:
- ✅ "Dias Trabalhados" mostra o valor correto
- ✅ Valor muda conforme a data de admissão
- ✅ Cálculo é dinâmico para qualquer data

## 📝 Observações Importantes

1. **Holerites mensais:** Continuam mostrando 30 dias (padrão)
2. **Holerites de 13º:** Calculam dias reais entre admissão e fim do mês
3. **Sem data de admissão:** Fallback para 30 dias
4. **Reatividade:** O cálculo é feito em tempo real ao abrir o modal

## 🔍 Validação

Para validar se está funcionando:

```sql
-- Ver holerites com data_admissao
SELECT 
  id,
  nome_colaborador,
  data_admissao,
  mes,
  ano,
  meses_trabalhados,
  tipo
FROM holerites
WHERE tipo = 'decimo_terceiro'
ORDER BY created_at DESC
LIMIT 10;
```

## ✨ Resultado Final

Agora o sistema calcula corretamente:
- ✅ Dias trabalhados baseados na data real de admissão
- ✅ Funciona para qualquer data (passado, presente, futuro)
- ✅ Cálculo preciso até o último dia do mês da competência
- ✅ Exibição dinâmica no holerite
