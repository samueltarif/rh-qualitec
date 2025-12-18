# 🔍 DEBUG - Modal de Rescisão Não Abre

## Problema
O botão "Simular Rescisão" não abre o modal.

## Checklist de Verificação

### 1. Verificar Console do Navegador
Abra o console (F12) e clique no botão. Deve aparecer:
```
Abrindo modal de rescisão...
mostrarModalRescisao: true
```

### 2. Verificar se o Componente UIModal Existe
O modal usa `<UIModal>`. Verificar se existe em:
- `nuxt-app/app/components/UIModal.vue`

### 3. Verificar Importação Automática
O Nuxt deve importar automaticamente os componentes de `app/components/`.

### 4. Possíveis Causas

#### Causa 1: Componente UIModal não encontrado
**Solução:** Verificar se o arquivo existe

#### Causa 2: Props do UIModal diferentes
**Solução:** Verificar props aceitas pelo UIModal

#### Causa 3: Z-index ou CSS
**Solução:** Modal pode estar atrás de outros elementos

#### Causa 4: Erro de compilação
**Solução:** Verificar erros no terminal

## Solução Rápida

Vou criar uma versão simplificada do modal para testar.
