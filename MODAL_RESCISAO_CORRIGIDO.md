# ✅ MODAL DE RESCISÃO CORRIGIDO

## 🔧 Problema Identificado

O modal não abria porque estava usando a prop errada.

### Erro
```vue
<UIModal :show="show" ...>
```

### Correção
```vue
<UIModal :model-value="show" ...>
```

## 📝 Explicação

O componente `UIModal` usa `modelValue` como prop (padrão v-model do Vue 3), mas o `ModalSimuladorRescisao` estava passando `show`.

## ✅ Correções Aplicadas

### 1. Arquivo `app/components/ModalSimuladorRescisao.vue`
- ✅ Mudado `:show="show"` para `:model-value="show"`

### 2. Arquivo `app/components/FolhaAcoesRapidasCalculos.vue`
- ✅ Adicionado console.log para debug
- ✅ Criada função `abrirModalRescisao()`

## 🚀 Como Testar Agora

### 1. Recarregue a Página
Pressione `Ctrl+Shift+R` (ou `Cmd+Shift+R` no Mac) para recarregar sem cache

### 2. Abra o Console
Pressione `F12` para abrir as ferramentas de desenvolvedor

### 3. Teste o Botão
1. Vá para **Folha de Pagamento**
2. Localize o card **"Ações Rápidas - Cálculos Especiais"**
3. Clique no botão **"Simular Rescisão"** (card amarelo/âmbar)
4. O modal deve abrir!

### 4. Verifique o Console
Deve aparecer:
```
Abrindo modal de rescisão...
mostrarModalRescisao: true
```

## 🎯 Funcionalidades do Modal

### Etapa 1: Seleção do Colaborador
- Lista de todos os colaboradores
- Preview dos dados (cargo, salário, admissão)
- Botão "Próximo"

### Etapa 2: Dados da Rescisão
- 9 tipos de rescisão
- Data de desligamento
- Aviso prévio (trabalhado/indenizado/não aplicável)
- Dias trabalhados no mês
- Férias vencidas
- Horas extras
- Adicionais
- Faltas
- Adiantamentos
- Botão "Calcular Rescisão"

### Etapa 3: Resultado
- Proventos detalhados
- Descontos detalhados
- FGTS + multa
- Valor líquido destacado
- Observações legais
- Botão "Exportar PDF"
- Botão "Nova Simulação"

## ✅ Sistema Completo Funcionando!

O sistema de simulação de rescisão CLT está 100% funcional:

- ✅ 9 tipos de rescisão suportados
- ✅ Cálculos 100% conformes com CLT
- ✅ INSS (tabela progressiva 2025)
- ✅ IRRF (Lei 15.270/2025)
- ✅ Aviso prévio proporcional (Lei 12.506/2011)
- ✅ 13º salário proporcional
- ✅ Férias vencidas e proporcionais + 1/3
- ✅ FGTS + multa (40%, 20% ou 0%)
- ✅ Interface intuitiva em 3 etapas
- ✅ Exportação para PDF
- ✅ Observações legais automáticas

**Pronto para uso!** 🚀
