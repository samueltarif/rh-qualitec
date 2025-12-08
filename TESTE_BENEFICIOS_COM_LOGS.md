# 🔍 TESTE COM LOGS DE DEBUG

## O que foi adicionado

Adicionei logs detalhados para identificar onde está o problema:

```javascript
console.log('=== DEBUG BENEFÍCIOS ===')
console.log('recebe_vt:', response.recebe_vt, 'valor_vt:', response.valor_vt)
console.log('recebe_vr:', response.recebe_vr, 'valor_vr:', response.valor_vr)
console.log('recebe_va:', response.recebe_va, 'valor_va:', response.valor_va)
console.log('Benefícios calculados:', beneficiosColaborador)
console.log('modalEdicao.edicao após atribuição:', modalEdicao.value.edicao)
console.log('vale_transporte final:', modalEdicao.value.edicao.vale_transporte)
console.log('vale_alimentacao final:', modalEdicao.value.edicao.vale_alimentacao)
```

## 🧪 Como Testar AGORA

### 1. Recarregue a página
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### 2. Abra o Console (F12)
- Vá para a aba "Console"
- Limpe o console (ícone 🚫 ou Ctrl+L)

### 3. Calcule a Folha
- Selecione o mês
- Clique em "Calcular Folha"

### 4. Clique em "Editar"
- Encontre o colaborador SAMUEL BARRETOS TARIF
- Clique no botão "Editar"

### 5. Verifique os Logs no Console

Você deve ver algo assim:

```
=== DEBUG BENEFÍCIOS ===
recebe_vt: true valor_vt: 220
recebe_vr: false valor_vr: 0
recebe_va: true valor_va: 280

Benefícios calculados: {
  vale_transporte: 220,
  vale_refeicao: 0,
  vale_alimentacao: 280,
  plano_saude: 0,
  plano_odontologico: 0
}

modalEdicao.edicao após atribuição: {
  horas_extras_50: 0,
  ...
  vale_transporte: 220,
  vale_refeicao: 0,
  vale_alimentacao: 280,
  ...
}

vale_transporte final: 220
vale_alimentacao final: 280
```

## ✅ O que Esperar

Se os logs mostrarem os valores corretos (220 e 280), mas os campos ainda aparecerem com 0, o problema é no v-model do Vue.

## 🔧 Possíveis Problemas

### Problema 1: Valores são `undefined` ou `null`
```
recebe_vt: undefined valor_vt: undefined
```
**Solução**: A API não está retornando os campos. Verifique as políticas RLS.

### Problema 2: Valores são corretos nos logs, mas campos mostram 0
```
vale_transporte final: 220  ← Correto no log
Campo no modal: 0           ← Errado na tela
```
**Solução**: Problema com v-model. Pode ser reatividade do Vue.

### Problema 3: `recebe_vt` é `false` mesmo tendo valor
```
recebe_vt: false valor_vt: 220
```
**Solução**: Atualizar o campo `recebe_vt` no banco para `true`.

## 📸 Me Envie

Tire um print do console mostrando todos os logs e me envie para eu identificar o problema exato!

---

**Tempo estimado**: 1 minuto
**Importante**: NÃO feche o console antes de ver os logs!
