# Correção: Data de Aniversário Mostrando Um Dia Antes

## Problema

O widget de aniversariantes estava mostrando o dia errado - sempre um dia antes do aniversário real.

Exemplo:
- Aniversário real: 29/12/1995
- Mostrava: dia 28

## Causa

Problema clássico de timezone em JavaScript!

Quando você cria um `Date` a partir de uma string no formato `YYYY-MM-DD`:

```javascript
new Date('1995-12-29')  // Interpreta como UTC 00:00:00
```

O JavaScript interpreta como **UTC midnight** e depois converte para o timezone local. Se você está em um timezone negativo (como Brasil UTC-3), a data é ajustada para o dia anterior.

```javascript
// Timezone: America/Sao_Paulo (UTC-3)
new Date('1995-12-29')  // Vira 1995-12-28 21:00:00 (horário local)
.getDate()              // Retorna 28 ❌
```

## Solução

Adicionar `T00:00:00` à string da data para forçar interpretação como horário local:

```javascript
new Date('1995-12-29T00:00:00')  // Interpreta como local 00:00:00
.getDate()                        // Retorna 29 ✅
```

## Código Corrigido

### Antes (Errado):
```typescript
dia: new Date(c.data_nascimento).getDate()
```

### Depois (Correto):
```typescript
dia: new Date(c.data_nascimento + 'T00:00:00').getDate()
```

## Arquivo Modificado

- `nuxt-app/server/api/dashboard/stats.get.ts`

## Como Testar

1. Recarregue a página do dashboard admin
2. Verifique o widget "Aniversariantes de [Mês]"
3. ✅ O dia deve corresponder ao dia real do aniversário

## Exemplo

Se o Samuel nasceu em 29/12/1995:
- ❌ Antes: Mostrava "dia 28"
- ✅ Agora: Mostra "dia 29"

## Nota Técnica

Esta é uma boa prática sempre que trabalhar com datas em JavaScript:
- Para datas sem hora (apenas dia/mês/ano), sempre adicione `T00:00:00`
- Ou use bibliotecas como `date-fns` ou `dayjs` que lidam melhor com timezones
- Ou extraia o dia diretamente da string: `parseInt(data.split('-')[2])`
