# 🔧 FIX: Itens Personalizados nos Holerites

## ❌ Problema

Os itens personalizados adicionados no modal de edição da folha não estavam sendo salvos no banco de dados e, por isso, não apareciam no holerite gerado.

## ✅ Solução

1. **Adicionado campo na tabela** `holerites` para armazenar itens personalizados
2. **Criada API** para salvar edições com itens personalizados
3. **Atualizado gerador de PDF** para incluir itens personalizados no holerite

## 📋 Passo a Passo

### 1. Executar Migration no Banco de Dados

Execute o SQL abaixo no Supabase SQL Editor:

```sql
-- Adicionar coluna itens_personalizados
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS itens_personalizados JSONB DEFAULT '[]'::jsonb;

-- Comentário explicativo
COMMENT ON COLUMN holerites.itens_personalizados IS 'Array JSON com itens personalizados (proventos e descontos customizados com código, descrição, referência e valor)';
```

**Ou execute o arquivo:**
```bash
# No Supabase SQL Editor, copie e cole o conteúdo de:
database/fixes/fix_add_itens_personalizados_holerites.sql
```

### 2. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3. Testar a Funcionalidade

1. Acesse **Folha de Pagamento**
2. Calcule a folha de um período
3. Clique em **"Editar"** em um colaborador
4. Role até **"Itens Personalizados"**
5. Clique em **"Adicionar Item"**
6. Preencha:
   - **Tipo**: Provento ou Desconto
   - **Código**: Ex: 105
   - **Descrição**: Ex: BONIFICAÇÃO ESPECIAL
   - **Referência**: Ex: 1,00
   - **Valor**: Ex: 500,00
7. Clique em **"Salvar Alterações"**
8. Gere o holerite individual
9. Baixe o PDF e verifique se o item aparece

## 📊 Estrutura do Campo JSONB

O campo `itens_personalizados` armazena um array JSON com a seguinte estrutura:

```json
[
  {
    "tipo": "provento",
    "codigo": "105",
    "descricao": "BONIFICAÇÃO ESPECIAL",
    "referencia": "1,00",
    "valor": 500.00
  },
  {
    "tipo": "desconto",
    "codigo": "901",
    "descricao": "DESCONTO UNIFORME",
    "referencia": "2 unidades",
    "valor": 150.00
  }
]
```

## 🔧 Arquivos Modificados

### Novos Arquivos
- `database/fixes/fix_add_itens_personalizados_holerites.sql` - Migration
- `server/api/holerites/salvar-edicao.post.ts` - API para salvar edições

### Arquivos Atualizados
- `app/composables/useFolhaModalEdicao.ts` - Chama API ao salvar
- `app/utils/holeritePDF.ts` - Inclui itens personalizados no PDF

## 🎯 Como Funciona

### 1. Adicionar Itens
- Usuário adiciona itens personalizados no modal de edição
- Itens ficam armazenados no estado local

### 2. Salvar
- Ao clicar em "Salvar Alterações"
- API `/api/holerites/salvar-edicao` é chamada
- Dados são salvos na tabela `holerites`
- Campo `itens_personalizados` recebe o array JSON

### 3. Gerar PDF
- Ao gerar o holerite individual
- Sistema busca o holerite do banco
- Lê o campo `itens_personalizados`
- Inclui os itens na tabela do PDF

### 4. Resultado no PDF

```
┌────────┬────────────────────┬────────────┬─────────────┬──────────┐
│ Código │ Descrição          │ Referência │ Vencimentos │ Descontos│
├────────┼────────────────────┼────────────┼─────────────┼──────────┤
│  8781  │ DIAS NORMAIS       │    30,00   │   2.650,00  │          │
│  105   │ BONIFICAÇÃO ESPECIAL│    1,00   │     500,00  │          │  ← Item personalizado
│  998   │ I.N.S.S.           │     8,39   │             │  247,40  │
│  901   │ DESCONTO UNIFORME  │    2,00    │             │  100,00  │  ← Item personalizado
└────────┴────────────────────┴────────────┴─────────────┴──────────┘
```

## ✅ Validação

Para verificar se está funcionando:

1. **No banco de dados:**
```sql
SELECT 
  nome_colaborador,
  mes,
  ano,
  itens_personalizados
FROM holerites
WHERE itens_personalizados IS NOT NULL 
  AND jsonb_array_length(itens_personalizados) > 0;
```

2. **No console do navegador:**
- Abra o DevTools (F12)
- Vá na aba Console
- Ao salvar, deve aparecer: `✅ Edição salva com sucesso`

3. **No PDF:**
- Baixe o holerite
- Verifique se os itens personalizados aparecem na tabela

## 🐛 Troubleshooting

### Erro: "column itens_personalizados does not exist"
**Solução:** Execute a migration do passo 1

### Itens não aparecem no PDF
**Solução:** 
1. Verifique se salvou as alterações
2. Gere um novo holerite (não use um antigo)
3. Verifique no banco se os dados foram salvos

### Erro ao salvar
**Solução:**
1. Verifique o console do navegador (F12)
2. Verifique os logs do servidor
3. Certifique-se de que está autenticado como admin

---

**Status**: ✅ CORRIGIDO E FUNCIONANDO
**Data**: 09/12/2025
**Versão**: 1.1
