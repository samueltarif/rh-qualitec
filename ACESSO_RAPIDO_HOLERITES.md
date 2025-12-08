# 🚀 Acesso Rápido - Gerenciar Holerites

## 📍 Como Acessar

### Opção 1: Pelo Botão (Recomendado)
1. Vá para `/folha-pagamento`
2. Clique no botão **"Gerenciar Holerites"** no header (canto superior direito)

### Opção 2: URL Direta
Digite na barra de endereço:
```
http://localhost:3000/folha-pagamento/holerites
```

## ⚠️ Se a Página Não Carregar

### Erro 1: Página em Branco
**Causa:** Componentes não encontrados
**Solução:** Verifique o console do navegador (F12)

### Erro 2: "Cannot read property..."
**Causa:** Composable não importado
**Solução:** Reinicie o servidor Nuxt

### Erro 3: "404 Not Found"
**Causa:** Rota não registrada
**Solução:** Verifique se o arquivo existe em `app/pages/folha-pagamento/holerites.vue`

## 🔧 Verificação Rápida

Execute no terminal:

```bash
# Verificar se o arquivo existe
dir app\pages\folha-pagamento\holerites.vue

# Verificar componentes
dir app\components\Holerite*.vue

# Verificar composable
dir app\composables\useHolerites.ts
```

## 🔄 Reiniciar Servidor

Se nada funcionar, reinicie o servidor:

```bash
# Parar o servidor (Ctrl+C)
# Depois iniciar novamente
npm run dev
```

## 📝 Checklist

- [ ] Arquivo `holerites.vue` existe
- [ ] Componentes `HoleriteCard`, `HoleritesList`, `ModalConfirmarExclusao` existem
- [ ] Composable `useHolerites` existe
- [ ] API `/api/holerites/[id].delete.ts` existe
- [ ] Servidor Nuxt está rodando
- [ ] Não há erros no console do navegador

## 🆘 Debug

Abra o console do navegador (F12) e procure por:
- ❌ Erros em vermelho
- ⚠️ Avisos em amarelo
- 🔵 Requisições falhadas na aba Network

**Me envie o erro que aparece no console!**
