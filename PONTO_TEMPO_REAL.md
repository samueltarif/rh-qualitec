# ⏱️ Contagem de Horas em Tempo Real - Sistema de Ponto

## 🎯 Visão Geral

Implementação de contagem de horas trabalhadas em tempo real para registros de ponto em andamento. O sistema atualiza automaticamente a cada minuto enquanto o funcionário ainda não registrou a saída final.

---

## ✨ Funcionalidades Implementadas

### 1. Detecção Automática de Registro em Andamento

O sistema identifica automaticamente quando um registro está em andamento:
- ✅ Tem entrada registrada (`entrada_1`)
- ❌ Não tem saída final (`saida_2`)

### 2. Contagem em Tempo Real

Quando detectado registro em andamento:
- ⏱️ Atualiza a cada **60 segundos**
- 🔄 Usa hora atual como ponto de referência
- 📊 Calcula total considerando intervalos
- 🎨 Exibe com animação pulsante verde

### 3. Regras de Cálculo

#### Cenário A: Sem Intervalo
```
Entrada: 07:30
Hora Atual: 13:55
Cálculo: 13:55 - 07:30 = 6h25
Badge: ⏱️ Contagem em tempo real
```

#### Cenário B: Intervalo Completo
```
Entrada: 07:30
Saída Int.: 12:00
Retorno: 13:15
Hora Atual: 15:45
Cálculo: (12:00 - 07:30) + (15:45 - 13:15) = 4h30 + 2h30 = 7h00
Badge: ⏱️ Contagem em tempo real
```

#### Cenário C: Intervalo Incompleto (Pausado)
```
Entrada: 07:30
Saída Int.: 12:00
Hora Atual: 12:30
Cálculo: 12:00 - 07:30 = 4h30 (pausado no intervalo)
Badge: ⏱️ Contagem em tempo real
Badge: ⚠️ Intervalo incompleto
```

#### Cenário D: Intervalo Incompleto (Retornou)
```
Entrada: 07:30
Retorno: 13:15
Hora Atual: 15:45
Cálculo: 15:45 - 07:30 = 8h15 (sem descontar intervalo)
Badge: ⏱️ Contagem em tempo real
Badge: ⚠️ Intervalo incompleto — falta horário de início
```

### 4. Parada Automática

Quando o funcionário registra a saída final:
- ⏹️ Timer para automaticamente
- 🔒 Valor congela no total calculado
- ❌ Remove badge "Contagem em tempo real"
- ✅ Mantém outros avisos (se houver)

---

## 🔧 Arquitetura Técnica

### Arquivos Criados/Modificados

#### 1. `app/utils/pontoCalculos.ts` (Modificado)
Adicionadas funções:

```typescript
// Verifica se registro está em andamento
registroEmAndamento(registro): boolean

// Calcula horas usando hora atual como referência
calcularHorasTempoReal(registro, horaAtual?): ResultadoCalculo
```

#### 2. `app/composables/usePontoTempoReal.ts` (NOVO)
Composable para gerenciar timer e atualizações:

```typescript
// Para múltiplos registros
usePontoTempoReal(registros: Ref<any[]>)

// Para um único registro
usePontoTempoRealSingle(registro: Ref<any>)
```

**Retorna:**
- `horaAtual`: Ref com hora atual
- `calcularHoras()`: Função que usa tempo real se em andamento
- `temRegistroEmAndamento`: Computed indicando se há registros ativos
- `iniciarTimer()`: Inicia atualização automática
- `pararTimer()`: Para atualização

#### 3. `app/components/EmployeePontoTab.vue` (Modificado)
- Usa `usePontoTempoReal` composable
- Exibe horas com animação pulsante verde
- Badge "⏱️ Contagem em tempo real"

#### 4. `app/pages/ponto.vue` (Modificado)
- Usa `usePontoTempoReal` composable
- Mesma lógica do painel funcionário
- Consistência garantida

---

## 🎨 Interface do Usuário

### Painel do Funcionário

```
┌────────────────────────────────────────────────────────────┐
│ Data: 05/12/2024 (Sexta-feira)                            │
├────────────────────────────────────────────────────────────┤
│ Entrada: 07:30                                             │
│ Intervalo Entrada: 12:00                                   │
│ Intervalo Saída: 13:15                                     │
│ Saída: --:--                                               │
│                                                            │
│ ⏱️ Horas Trabalhadas: 5h10 (pulsando em verde)            │
│                                                            │
│ 🟢 ⏱️ Contagem em tempo real                               │
│                                                            │
│ [Atualiza automaticamente a cada minuto]                   │
└────────────────────────────────────────────────────────────┘
```

### Painel Admin

```
┌────────────────────────────────────────────────────────────┐
│ Colaborador: João Silva                                    │
│ Data: 05/12/2024                                           │
├────────────────────────────────────────────────────────────┤
│ Entrada: 07:30                                             │
│ Saída Int.: 12:00                                          │
│ Retorno: 13:15                                             │
│ Saída: --:--                                               │
│                                                            │
│ Total: 5h10 (pulsando em verde)                            │
│                                                            │
│ 🟢 ⏱️ Contagem em tempo real                               │
│                                                            │
│ [Atualiza automaticamente a cada minuto]                   │
└────────────────────────────────────────────────────────────┘
```

### Animação Visual

- **Cor**: Verde (`text-green-600`)
- **Efeito**: Pulsante (`animate-pulse`)
- **Badge**: Verde claro com ícone ⏱️
- **Atualização**: Suave, sem piscar

---

## 📊 Exemplos Práticos

### Exemplo 1: Jornada Normal em Andamento

**Situação:**
- Entrada: 08:00
- Saída Int.: 12:00
- Retorno: 13:00
- Hora Atual: 15:30

**Cálculo:**
```
Período 1: 12:00 - 08:00 = 4h00
Intervalo: 13:00 - 12:00 = 1h00
Período 2: 15:30 - 13:00 = 2h30
Total: 4h00 + 2h30 = 6h30
```

**Exibição:**
```
6h30 (verde pulsante)
🟢 ⏱️ Contagem em tempo real
```

### Exemplo 2: Pausado no Intervalo

**Situação:**
- Entrada: 07:30
- Saída Int.: 12:00
- Hora Atual: 12:45
- (Ainda não retornou)

**Cálculo:**
```
Período 1: 12:00 - 07:30 = 4h30
(Pausado - aguardando retorno)
Total: 4h30
```

**Exibição:**
```
4h30 (verde pulsante)
🟢 ⏱️ Contagem em tempo real
🟡 ⚠️ Intervalo incompleto — falta horário de retorno
```

### Exemplo 3: Sem Intervalo

**Situação:**
- Entrada: 08:00
- Hora Atual: 14:25
- (Sem intervalo registrado)

**Cálculo:**
```
Total: 14:25 - 08:00 = 6h25
```

**Exibição:**
```
6h25 (verde pulsante)
🟢 ⏱️ Contagem em tempo real
🔵 ℹ️ Nenhum intervalo registrado
```

### Exemplo 4: Após Registrar Saída

**Situação:**
- Entrada: 08:00
- Saída Int.: 12:00
- Retorno: 13:00
- Saída: 17:00 (acabou de registrar)

**Cálculo:**
```
Período 1: 12:00 - 08:00 = 4h00
Intervalo: 13:00 - 12:00 = 1h00
Período 2: 17:00 - 13:00 = 4h00
Total: 8h00 (FIXO)
```

**Exibição:**
```
8h00 (verde normal, sem pulsar)
(Sem badge de tempo real)
```

---

## 🔄 Fluxo de Funcionamento

### 1. Inicialização

```
Componente carrega
  ↓
Verifica se há registros em andamento
  ↓
Se SIM → Inicia timer (atualiza a cada 60s)
Se NÃO → Não inicia timer
```

### 2. Durante Execução

```
A cada 60 segundos:
  ↓
Atualiza horaAtual
  ↓
Para cada registro:
  ↓
  Se em andamento:
    → Calcula usando hora atual
    → Exibe com animação
  Se finalizado:
    → Usa cálculo fixo
    → Exibe normal
```

### 3. Ao Registrar Saída

```
Funcionário registra saída
  ↓
Registro atualizado no banco
  ↓
Componente detecta mudança
  ↓
Timer para automaticamente
  ↓
Valor congela
  ↓
Remove badge "tempo real"
```

---

## ⚙️ Configuração e Performance

### Intervalo de Atualização

**Padrão**: 60 segundos (60000ms)

**Por quê?**
- ✅ Suficiente para contagem de horas
- ✅ Baixo impacto na performance
- ✅ Não sobrecarrega o navegador
- ✅ Bateria amigável (mobile)

**Pode ser alterado em:**
```typescript
// usePontoTempoReal.ts
intervalId = setInterval(atualizarHora, 60000) // ← Alterar aqui
```

### Otimizações Implementadas

1. **Timer Condicional**
   - Só inicia se houver registros em andamento
   - Para automaticamente quando não há mais registros ativos

2. **Cleanup Automático**
   - Timer é limpo ao desmontar componente
   - Previne memory leaks

3. **Reatividade Eficiente**
   - Usa `computed` para detectar mudanças
   - Não recalcula desnecessariamente

4. **Watch Inteligente**
   - Monitora se há registros em andamento
   - Inicia/para timer automaticamente

---

## 🧪 Testes

### Teste 1: Contagem Básica

```
1. Registre entrada (ex: 08:00)
2. Aguarde 1 minuto
3. Verifique que o total aumentou
4. Aguarde mais 1 minuto
5. Verifique que aumentou novamente
```

**Esperado**: Total aumenta a cada minuto

### Teste 2: Com Intervalo

```
1. Registre entrada (ex: 08:00)
2. Registre saída para intervalo (ex: 12:00)
3. Aguarde 1 minuto
4. Verifique que total NÃO aumenta (pausado)
5. Registre retorno (ex: 13:00)
6. Aguarde 1 minuto
7. Verifique que total volta a aumentar
```

**Esperado**: Pausa durante intervalo, retoma após retorno

### Teste 3: Parada ao Registrar Saída

```
1. Registre entrada
2. Aguarde alguns minutos (total aumentando)
3. Anote o valor atual
4. Registre saída
5. Aguarde 1 minuto
6. Verifique que total NÃO mudou
```

**Esperado**: Total congela ao registrar saída

### Teste 4: Consistência entre Painéis

```
1. Registre entrada como funcionário
2. Veja o total no painel funcionário
3. Acesse painel admin
4. Veja o mesmo registro
5. Compare os valores
```

**Esperado**: Valores idênticos em ambos os painéis

### Teste 5: Múltiplos Registros

```
1. Crie 3 registros em andamento
2. Verifique que todos atualizam
3. Finalize 1 registro
4. Verifique que os outros 2 continuam atualizando
5. Finalize todos
6. Verifique que timer parou
```

**Esperado**: Timer gerencia múltiplos registros corretamente

---

## 📋 Checklist de Validação

- [ ] Contagem inicia automaticamente ao registrar entrada
- [ ] Atualiza a cada minuto
- [ ] Exibe badge "⏱️ Contagem em tempo real"
- [ ] Animação pulsante verde funciona
- [ ] Pausa durante intervalo (se saída int. registrada)
- [ ] Retoma após retorno do intervalo
- [ ] Para ao registrar saída final
- [ ] Remove badge ao finalizar
- [ ] Valores idênticos em ambos os painéis
- [ ] Timer para quando não há registros ativos
- [ ] Não há memory leaks
- [ ] Performance adequada com múltiplos registros

---

## 🐛 Troubleshooting

### Problema: Contagem não atualiza

**Possíveis causas:**
1. Timer não iniciou
2. Registro não detectado como "em andamento"
3. Componente não está reativo

**Solução:**
```javascript
// Verificar no console do navegador
console.log('Tem registro em andamento?', temRegistroEmAndamento.value)
console.log('Hora atual:', horaAtual.value)
```

### Problema: Valores diferentes entre painéis

**Causa:** Horários do sistema diferentes

**Solução:** Ambos usam `new Date()` local, deve ser idêntico

### Problema: Timer não para

**Causa:** Cleanup não executado

**Solução:** Verificar que `onUnmounted` está sendo chamado

---

## 🚀 Melhorias Futuras

1. **Notificação de Jornada Longa**
   - Alertar quando passar de 8h/10h/12h

2. **Previsão de Saída**
   - "Para completar 8h, saia às 17:00"

3. **Sincronização com Servidor**
   - Usar hora do servidor (evitar diferenças de fuso)

4. **Histórico de Tempo Real**
   - Gráfico mostrando evolução durante o dia

5. **Configuração de Intervalo**
   - Permitir admin configurar intervalo de atualização

---

## 📚 Referências

- **Utilitário**: `app/utils/pontoCalculos.ts`
- **Composable**: `app/composables/usePontoTempoReal.ts`
- **Componente Funcionário**: `app/components/EmployeePontoTab.vue`
- **Página Admin**: `app/pages/ponto.vue`

---

## ✅ Conclusão

A funcionalidade de contagem em tempo real foi implementada com sucesso:

- ✅ **Atualização automática** a cada minuto
- ✅ **Considera intervalos** corretamente
- ✅ **Para automaticamente** ao registrar saída
- ✅ **Consistência total** entre painéis
- ✅ **Performance otimizada**
- ✅ **Código mantível** e documentado

**Status**: Pronto para uso! 🎉

---

**Última atualização**: 05/12/2024  
**Versão**: 1.0.0  
**Autor**: Sistema de Gestão de RH
