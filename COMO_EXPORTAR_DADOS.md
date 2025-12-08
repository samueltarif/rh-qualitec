# 📤 Como Exportar Todas as Informações

## Sistema de Exportação Disponível

Você já tem um sistema de exportação implementado! Acesse:

**Configurações → Importação/Exportação → Aba "Exportar"**

## Dados que Podem Ser Exportados

1. **Colaboradores** - Todos os dados dos funcionários
2. **Ponto** - Registros de ponto
3. **Férias** - Solicitações e períodos de férias
4. **Holerites** - Folhas de pagamento
5. **Documentos** - Documentos RH
6. **Solicitações** - Solicitações dos funcionários

## Formatos Disponíveis

- **CSV** - Arquivo de texto separado por vírgulas
- **Excel** - Planilha Excel (.xlsx)
- **JSON** - Formato JSON para integração

## Como Usar

### Passo 1: Acessar a Página
```
http://localhost:3000/configuracoes/importacao-exportacao
```

### Passo 2: Ir na Aba "Exportar"

### Passo 3: Selecionar
- **Tipo de Entidade**: Escolha o que quer exportar (Colaboradores, Ponto, etc)
- **Formato**: CSV, Excel ou JSON
- **Filtros** (opcional):
  - Data início/fim
  - Status (Ativo/Inativo)
  - Incluir inativos

### Passo 4: Clicar em "Exportar"

O arquivo será gerado e você poderá baixá-lo.

## Exportação via SQL (Alternativa)

Se preferir exportar direto do banco de dados:

### Exportar Todos os Colaboradores
```sql
SELECT * FROM colaboradores;
```

### Exportar Registros de Ponto
```sql
SELECT 
  c.nome,
  rp.data,
  rp.entrada_1,
  rp.saida_1,
  rp.entrada_2,
  rp.saida_2,
  rp.total_horas
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
ORDER BY rp.data DESC;
```

### Exportar Holerites
```sql
SELECT 
  nome_colaborador,
  mes,
  ano,
  salario_base,
  total_proventos,
  total_descontos,
  salario_liquido,
  status
FROM holerites
ORDER BY ano DESC, mes DESC;
```

### Exportar Férias
```sql
SELECT 
  c.nome,
  f.data_inicio,
  f.data_fim,
  f.dias_corridos,
  f.status,
  f.observacoes
FROM ferias f
JOIN colaboradores c ON c.id = f.colaborador_id
ORDER BY f.data_inicio DESC;
```

## Exportar do Supabase

No Supabase SQL Editor, você pode:

1. Executar a query
2. Clicar em "Download CSV" no resultado
3. Abrir no Excel

## Melhorias Futuras

Posso implementar:
- ✅ Exportação automática agendada
- ✅ Envio por email
- ✅ Backup automático diário
- ✅ Exportação de múltiplas tabelas de uma vez
- ✅ Relatórios personalizados

Quer que eu implemente alguma dessas melhorias?
