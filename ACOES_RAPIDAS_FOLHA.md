# Ações Rápidas - Folha de Pagamento

## ✅ Funcionalidade Implementada

Adicionado card de "Ações Rápidas" na página de folha de pagamento com atalhos para cálculos especiais.

## 🎯 Recursos

### Card de Ações Rápidas

Localizado entre o resumo da folha e a tabela de colaboradores, o card oferece acesso rápido a:

1. **Gerar Férias** 🌞
   - Link direto para página de férias
   - Calcular férias individuais ou em lote
   - Gerenciar períodos de férias

2. **Gerar 13º Salário** 🎁
   - Calcular 1ª parcela (até 30/11)
   - Calcular 2ª parcela (até 20/12)
   - Gerar holerites de 13º
   - (Em desenvolvimento)

3. **Simular Rescisão** 📋
   - Simular diferentes tipos de rescisão
   - Calcular verbas rescisórias
   - Gerar termo de rescisão
   - (Em desenvolvimento)

## 🎨 Visual do Card

```
┌─────────────────────────────────────────────────────────────┐
│ ⚡ Ações Rápidas - Cálculos Especiais                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│ │ 🌞 Férias    │  │ 🎁 13º       │  │ 📋 Rescisão  │      │
│ │              │  │              │  │              │      │
│ │ Calcule      │  │ Calcule 13º  │  │ Simule       │      │
│ │ férias       │  │ salário      │  │ rescisão     │      │
│ │              │  │              │  │              │      │
│ │ [Acessar]    │  │ [Calcular]   │  │ [Simular]    │      │
│ └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                             │
│ ℹ️  Dica: Use estas ferramentas para cálculos especiais    │
└─────────────────────────────────────────────────────────────┘
```

### Características Visuais

- **Gradiente:** Roxo para rosa
- **Borda:** Roxa destacada
- **Cards internos:** Brancos com bordas coloridas
  - Verde para Férias
  - Azul para 13º
  - Amarelo para Rescisão
- **Hover:** Bordas ficam mais escuras e sombra aparece
- **Ícones:** Representativos de cada ação

## 📝 Detalhes de Cada Ação

### 1. Gerar Férias

**Status:** ✅ Funcional

**Funcionalidade:**
- Redireciona para `/ferias`
- Página completa de gestão de férias
- Já implementada e funcionando

**Recursos disponíveis:**
- Solicitar férias
- Aprovar/rejeitar solicitações
- Visualizar calendário
- Calcular valores
- Gerar recibo de férias

### 2. Gerar 13º Salário

**Status:** 🚧 Em desenvolvimento

**Funcionalidade planejada:**
- Modal de cálculo de 13º
- Seleção de colaboradores
- Escolha de parcela (1ª ou 2ª)
- Cálculo automático
- Geração de holerite

**Regras de cálculo:**

**1ª Parcela (até 30/11):**
```
Valor = (Salário Base / 12) × Meses Trabalhados × 50%
```

**2ª Parcela (até 20/12):**
```
Valor Bruto = (Salário Base / 12) × Meses Trabalhados
Valor 1ª Parcela = já pago
INSS = calculado sobre valor bruto
IRRF = calculado sobre (valor bruto - INSS)
Valor Líquido = Valor Bruto - 1ª Parcela - INSS - IRRF
```

**Exemplo:**
```
Salário: R$ 3.000,00
Meses trabalhados: 12

1ª Parcela:
R$ 3.000 / 12 × 12 × 50% = R$ 1.500,00

2ª Parcela:
Bruto: R$ 3.000,00
1ª Parcela: -R$ 1.500,00
INSS: -R$ 360,00
IRRF: -R$ 40,00
Líquido: R$ 1.100,00
```

### 3. Simular Rescisão

**Status:** 🚧 Em desenvolvimento

**Funcionalidade planejada:**
- Modal de simulação
- Seleção de colaborador
- Tipo de rescisão
- Data de desligamento
- Cálculo automático de verbas

**Tipos de rescisão:**

1. **Sem Justa Causa (Empresa demite)**
   - Saldo de salário
   - Aviso prévio (trabalhado ou indenizado)
   - Férias vencidas + 1/3
   - Férias proporcionais + 1/3
   - 13º proporcional
   - Multa FGTS 40%
   - Saque FGTS
   - Seguro-desemprego

2. **Com Justa Causa**
   - Saldo de salário
   - Férias vencidas + 1/3

3. **Pedido de Demissão**
   - Saldo de salário
   - Férias vencidas + 1/3
   - Férias proporcionais + 1/3
   - 13º proporcional

4. **Acordo Trabalhista**
   - Saldo de salário
   - Aviso prévio 50%
   - Férias vencidas + 1/3
   - Férias proporcionais + 1/3
   - 13º proporcional
   - Multa FGTS 20%
   - Saque FGTS 80%

**Exemplo de cálculo:**
```
Colaborador: João Silva
Salário: R$ 3.000,00
Admissão: 01/01/2024
Demissão: 31/12/2024
Tipo: Sem Justa Causa

Verbas:
- Saldo salário (31 dias): R$ 3.000,00
- Aviso prévio (30 dias): R$ 3.000,00
- Férias proporcionais (12/12): R$ 3.000,00
- 1/3 férias: R$ 1.000,00
- 13º proporcional (12/12): R$ 3.000,00

Subtotal: R$ 13.000,00

Descontos:
- INSS: -R$ 908,85
- IRRF: -R$ 1.200,00

Total Líquido: R$ 10.891,15

FGTS:
- Saldo FGTS: R$ 2.880,00 (8% × 12 meses)
- Multa 40%: R$ 1.152,00
- Total FGTS: R$ 4.032,00

TOTAL GERAL: R$ 14.923,15
```

## 🔧 Implementação Técnica

### Estrutura do Card

```vue
<div class="card bg-gradient-to-r from-purple-50 to-pink-50">
  <h3>Ações Rápidas - Cálculos Especiais</h3>
  
  <div class="grid md:grid-cols-3 gap-4">
    <!-- Card Férias -->
    <div class="bg-white rounded-lg border-2 border-green-200">
      <Icon name="heroicons:sun" />
      <h4>Gerar Férias</h4>
      <NuxtLink to="/ferias">
        <UIButton>Acessar Férias</UIButton>
      </NuxtLink>
    </div>

    <!-- Card 13º -->
    <div class="bg-white rounded-lg border-2 border-blue-200">
      <Icon name="heroicons:gift" />
      <h4>Gerar 13º Salário</h4>
      <UIButton @click="abrirModal13Salario">
        Calcular 13º
      </UIButton>
    </div>

    <!-- Card Rescisão -->
    <div class="bg-white rounded-lg border-2 border-amber-200">
      <Icon name="heroicons:document-minus" />
      <h4>Simular Rescisão</h4>
      <UIButton @click="abrirModalRescisao">
        Simular Rescisão
      </UIButton>
    </div>
  </div>
</div>
```

### Funções

```typescript
// Modal de 13º salário
const abrirModal13Salario = () => {
  // Mostrar mensagem de desenvolvimento
  alert('Funcionalidade em desenvolvimento!')
}

// Modal de rescisão
const abrirModalRescisao = () => {
  // Mostrar mensagem de desenvolvimento
  alert('Funcionalidade em desenvolvimento!')
}
```

## 📊 Localização na Página

```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Filtros (Mês/Ano)                   │
│ [Calcular Folha] [Gerar Holerites]  │
├─────────────────────────────────────┤
│ Cards de Totais                     │
│ (Colaboradores, Bruto, Descontos)   │
├─────────────────────────────────────┤
│ Resumo da Folha                     │
│ (Detalhamento completo)             │
├─────────────────────────────────────┤
│ ⚡ AÇÕES RÁPIDAS ← NOVO!            │
│ [Férias] [13º] [Rescisão]           │
├─────────────────────────────────────┤
│ Tabela de Colaboradores             │
│ (Com botões Editar/Gerar/Email)     │
└─────────────────────────────────────┘
```

## 🎯 Casos de Uso

### Caso 1: Calcular Férias

**Situação:** Colaborador vai tirar férias

**Fluxo:**
1. Acesse Folha de Pagamento
2. Clique em "Acessar Férias" no card
3. Solicite ou aprove férias
4. Sistema calcula automaticamente

### Caso 2: Calcular 13º (Futuro)

**Situação:** Chegou novembro, precisa pagar 1ª parcela

**Fluxo:**
1. Acesse Folha de Pagamento
2. Clique em "Calcular 13º"
3. Selecione "1ª Parcela"
4. Escolha colaboradores
5. Sistema calcula 50% do 13º
6. Gere holerites
7. Envie por email

### Caso 3: Simular Rescisão (Futuro)

**Situação:** Colaborador será desligado

**Fluxo:**
1. Acesse Folha de Pagamento
2. Clique em "Simular Rescisão"
3. Selecione colaborador
4. Escolha tipo de rescisão
5. Informe data de desligamento
6. Sistema calcula todas as verbas
7. Gere termo de rescisão
8. Imprima ou envie por email

## 💡 Benefícios

### Para o RH

- ✅ Acesso rápido a cálculos especiais
- ✅ Tudo em um só lugar
- ✅ Não precisa navegar entre páginas
- ✅ Visual intuitivo

### Para a Empresa

- ✅ Reduz erros de cálculo
- ✅ Agiliza processos
- ✅ Padroniza procedimentos
- ✅ Facilita auditoria

## 🚀 Próximos Passos

### Curto Prazo

1. **Implementar Modal de 13º**
   - Criar componente ModalDecimo.vue
   - API de cálculo de 13º
   - Geração de holerite de 13º

2. **Implementar Modal de Rescisão**
   - Criar componente ModalRescisao.vue
   - API de cálculo de rescisão
   - Geração de termo de rescisão

### Médio Prazo

3. **Adicionar Mais Ações**
   - Adiantamento salarial
   - Horas extras em lote
   - Ajuste de salário
   - Promoções

4. **Histórico de Cálculos**
   - Registrar todos os cálculos
   - Auditoria completa
   - Relatórios

### Longo Prazo

5. **Automação**
   - Calcular 13º automaticamente
   - Alertas de vencimento
   - Integração com contabilidade

## 📝 Checklist de Implementação

### Fase 1: Card de Ações (Atual)
- [x] Card visual criado
- [x] Ícones e cores
- [x] Link para férias
- [x] Botões de 13º e rescisão
- [x] Mensagens de desenvolvimento
- [x] Documentação

### Fase 2: 13º Salário (Próxima)
- [ ] Modal de cálculo
- [ ] API de cálculo
- [ ] Seleção de parcela
- [ ] Geração de holerite
- [ ] Envio por email
- [ ] Testes

### Fase 3: Rescisão (Futura)
- [ ] Modal de simulação
- [ ] API de cálculo
- [ ] Tipos de rescisão
- [ ] Cálculo de verbas
- [ ] Termo de rescisão
- [ ] Testes

## ✅ Status Atual

- ✅ Card de ações rápidas implementado
- ✅ Link para férias funcionando
- ✅ Botões de 13º e rescisão com mensagens
- ✅ Visual profissional e intuitivo
- ✅ Documentação completa
- 🚧 Modais de 13º e rescisão em desenvolvimento

## 📚 Referências

- Página de Férias: `/ferias`
- Componentes UI: `UIButton`, `UIModal`
- Ícones: Heroicons
- Cores: Tailwind CSS

---

**Desenvolvido para:** Qualitec Instrumentos de Medição  
**Data:** Dezembro 2025  
**Versão:** 1.0.0
