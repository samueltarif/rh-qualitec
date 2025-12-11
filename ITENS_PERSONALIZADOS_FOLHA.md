# ✨ Itens Personalizados na Folha de Pagamento

## 📋 O que foi implementado

Adicionada uma nova seção no modal de edição da folha que permite adicionar **proventos e descontos personalizados** com código e nome customizados.

## 🎯 Funcionalidade

### Onde Encontrar

1. Acesse **Folha de Pagamento**
2. Calcule a folha de um período
3. Clique em **"Editar"** em qualquer colaborador
4. Role até a seção **"Itens Personalizados"** (ícone de estrela ✨)

### O que você pode fazer

✅ **Adicionar proventos customizados**
- Exemplo: Bonificação especial, Prêmio de produtividade, Ajuda de custo

✅ **Adicionar descontos customizados**
- Exemplo: Desconto de uniforme, Multa, Empréstimo consignado

✅ **Definir código personalizado**
- Exemplo: 105, 106, 901, 902, etc.

✅ **Definir descrição**
- Exemplo: "BONIFICAÇÃO ESPECIAL", "DESCONTO UNIFORME"

✅ **Definir referência**
- Exemplo: "1,00", "2 unidades", "50%"

✅ **Definir valor**
- Valor em R$ que será somado (provento) ou subtraído (desconto)

## 🖼️ Interface

### Campos do Item Personalizado

```
┌─────────────────────────────────────────────────────────────────┐
│ Tipo: [Provento ▼]  Código: [105]  Descrição: [BONIFICAÇÃO...]│
│ Referência: [1,00]  Valor (R$): [500,00]  [🗑️ Remover]         │
├─────────────────────────────────────────────────────────────────┤
│ Preview: [Provento] • 105 • BONIFICAÇÃO ESPECIAL • Ref: 1,00   │
│          • R$ 500,00                                            │
└─────────────────────────────────────────────────────────────────┘
```

### Resumo Automático

Ao adicionar itens, você verá um resumo:
- **Total Proventos**: Soma de todos os proventos personalizados
- **Total Descontos**: Soma de todos os descontos personalizados
- **Total de Itens**: Quantidade de itens adicionados

## 📊 Como Aparece no Holerite

Os itens personalizados aparecerão no holerite oficial com o código e descrição que você definiu:

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

## 🔧 Arquivos Criados/Modificados

### Novo Componente
- `app/components/FolhaItensPersonalizados.vue` - Interface para gerenciar itens

### Modificados
- `app/components/FolhaModalEdicao.vue` - Adicionada seção de itens personalizados
- `app/composables/useFolhaModalEdicao.ts` - Suporte aos itens no estado
- `app/pages/folha-pagamento.vue` - Integração com a página

## 💡 Exemplos de Uso

### Exemplo 1: Bonificação por Produtividade
```
Tipo: Provento
Código: 105
Descrição: BONIFICAÇÃO PRODUTIVIDADE
Referência: 120%
Valor: 800,00
```

### Exemplo 2: Desconto de Uniforme
```
Tipo: Desconto
Código: 901
Descrição: DESCONTO UNIFORME
Referência: 2 unidades
Valor: 150,00
```

### Exemplo 3: Ajuda de Custo
```
Tipo: Provento
Código: 106
Descrição: AJUDA DE CUSTO VIAGEM
Referência: 5 dias
Valor: 250,00
```

### Exemplo 4: Empréstimo Consignado
```
Tipo: Desconto
Código: 902
Descrição: EMPRÉSTIMO CONSIGNADO
Referência: Parcela 3/12
Valor: 350,00
```

## ✅ Validações

- ✅ Valores são recalculados automaticamente
- ✅ Proventos aumentam o salário bruto
- ✅ Descontos diminuem o salário líquido
- ✅ Itens aparecem no holerite oficial
- ✅ Preview em tempo real de cada item

## 🎨 Visual

- **Ícone**: ✨ Estrela (indica personalização)
- **Cor**: Roxo (#7C3AED)
- **Layout**: Cards expansíveis com preview
- **Botões**: Adicionar (+) e Remover (🗑️)

## 📝 Observações

- Os itens personalizados são salvos junto com a folha
- Cada colaborador pode ter seus próprios itens
- Os códigos não precisam ser únicos (você pode usar o mesmo código em diferentes colaboradores)
- A referência é um campo livre (pode ser texto ou número)
- Os valores são sempre em R$ (reais)

## 🚀 Próximos Passos

Para usar a funcionalidade:

1. Acesse a folha de pagamento
2. Calcule a folha do mês
3. Clique em "Editar" em um colaborador
4. Role até "Itens Personalizados"
5. Clique em "Adicionar Item"
6. Preencha os campos
7. Veja o preview e o resumo
8. Clique em "Salvar Alterações"

---

**Status**: ✅ IMPLEMENTADO E FUNCIONANDO
**Data**: 09/12/2025
**Versão**: 1.0
