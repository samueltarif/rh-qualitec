# Testes de Validação - Cálculo de Ponto

## Como Executar os Testes

Você pode testar manualmente através da interface ou executar os testes abaixo no console do navegador.

### Teste via Console do Navegador

1. Abra o DevTools (F12)
2. Vá para a aba Console
3. Cole e execute os testes abaixo

```javascript
// Importar a função (se estiver na página de ponto)
// const { calcularHorasTrabalhadas } = await import('~/utils/pontoCalculos')

// Teste A: Nenhum intervalo registrado
console.log('=== TESTE A: Nenhum Intervalo ===')
const testeA = {
  entrada_1: '07:30',
  saida_2: '13:15'
}
console.log('Input:', testeA)
console.log('Esperado: 5h45 + aviso "Nenhum intervalo registrado"')
// Resultado será exibido na interface

// Teste B: Intervalo completo
console.log('\n=== TESTE B: Intervalo Completo ===')
const testeB = {
  entrada_1: '07:30',
  saida_1: '10:00',
  entrada_2: '10:30',
  saida_2: '17:00'
}
console.log('Input:', testeB)
console.log('Esperado: 9h00 (2h30 + 6h30, descontado 0h30)')

// Teste C: Intervalo incompleto (falta início)
console.log('\n=== TESTE C: Intervalo Incompleto (falta início) ===')
const testeC = {
  entrada_1: '07:30',
  entrada_2: '12:00',
  saida_2: '13:15'
}
console.log('Input:', testeC)
console.log('Esperado: 5h45 + aviso "Intervalo incompleto — falta horário de início"')

// Teste D: Intervalo incompleto (falta retorno)
console.log('\n=== TESTE D: Intervalo Incompleto (falta retorno) ===')
const testeD = {
  entrada_1: '07:30',
  saida_1: '10:00',
  saida_2: '13:15'
}
console.log('Input:', testeD)
console.log('Esperado: 5h45 + aviso "Intervalo incompleto — falta horário de retorno"')

// Teste E: Jornada de 8 horas com 1h de intervalo
console.log('\n=== TESTE E: Jornada Padrão 8h ===')
const testeE = {
  entrada_1: '08:00',
  saida_1: '12:00',
  entrada_2: '13:00',
  saida_2: '17:00'
}
console.log('Input:', testeE)
console.log('Esperado: 8h00 (4h00 + 4h00, descontado 1h00)')

// Teste F: Apenas meio período
console.log('\n=== TESTE F: Apenas Meio Período ===')
const testeF = {
  entrada_1: '08:00',
  saida_1: '12:00'
}
console.log('Input:', testeF)
console.log('Esperado: 4h00')
```

## Testes Manuais na Interface

### 1. Teste no Painel Admin

1. Acesse `/ponto`
2. Clique em "Novo Registro"
3. Preencha os dados:

#### Cenário 1: Sem Intervalo
```
Colaborador: [Selecione um]
Data: [Hoje]
Entrada: 07:30
Saída Int.: [vazio]
Retorno: [vazio]
Saída: 13:15
```

**Resultado Esperado**:
- Preview mostra: "Horas Trabalhadas: 5h45"
- Aviso: "ℹ️ Nenhum intervalo registrado"
- Detalhes: "Entrada (07:30) → Saída (13:15)"

#### Cenário 2: Intervalo Completo
```
Entrada: 07:30
Saída Int.: 10:00
Retorno: 10:30
Saída: 17:00
```

**Resultado Esperado**:
- Preview mostra: "Horas Trabalhadas: 9h00"
- Intervalo: "0h30"
- Detalhes mostra os 3 períodos calculados

#### Cenário 3: Intervalo Incompleto
```
Entrada: 07:30
Saída Int.: [vazio]
Retorno: 12:00
Saída: 13:15
```

**Resultado Esperado**:
- Preview mostra: "Horas Trabalhadas: 5h45"
- Aviso: "⚠️ Intervalo incompleto — falta horário de início do intervalo"

### 2. Teste no Painel do Funcionário

1. Acesse `/employee`
2. Vá para a aba "Ponto"
3. Verifique os registros existentes
4. Compare com os mesmos registros no painel admin

**Resultado Esperado**:
- Os valores de "Total" devem ser **idênticos** em ambos os painéis
- Os avisos devem aparecer em ambos os painéis
- Ao passar o mouse sobre os avisos, deve mostrar os detalhes

### 3. Teste de Consistência

1. Crie um registro no painel admin com intervalo incompleto
2. Anote o valor de "Horas Trabalhadas"
3. Faça login como o funcionário desse registro
4. Acesse o painel do funcionário
5. Verifique o mesmo registro

**Resultado Esperado**:
- Valores **idênticos** em ambos os painéis
- Mesmos avisos em ambos os painéis

## Casos de Borda

### Caso 1: Horários Inválidos (ordem errada)
```
Entrada: 17:00
Saída: 08:00
```
**Esperado**: Aviso de erro "❌ ERRO: Horários inválidos (duração negativa)"

### Caso 2: Intervalo Muito Longo
```
Entrada: 08:00
Saída Int.: 12:00
Retorno: 16:00  (4 horas de intervalo)
Saída: 18:00
```
**Esperado**: Aviso "⚠️ Intervalo muito longo (mais de 3 horas)"

### Caso 3: Jornada Muito Longa
```
Entrada: 06:00
Saída Int.: 12:00
Retorno: 13:00
Saída: 22:00  (15 horas total)
```
**Esperado**: Aviso "⚠️ Jornada muito longa (mais de 12 horas)"

### Caso 4: Apenas Entrada (registro incompleto)
```
Entrada: 08:00
[Todos os outros campos vazios]
```
**Esperado**: 
- Horas: "--:--"
- Aviso: "⏱️ Registro em andamento ou incompleto"

## Checklist de Validação

- [ ] Teste A: Sem intervalo = 5h45 ✓
- [ ] Teste B: Intervalo completo = 9h00 ✓
- [ ] Teste C: Intervalo incompleto (falta início) = 5h45 + aviso ✓
- [ ] Teste D: Intervalo incompleto (falta retorno) = 5h45 + aviso ✓
- [ ] Teste E: Jornada padrão 8h = 8h00 ✓
- [ ] Teste F: Meio período = 4h00 ✓
- [ ] Consistência entre painéis (admin vs funcionário) ✓
- [ ] Preview em tempo real no modal de edição ✓
- [ ] Avisos exibidos corretamente ✓
- [ ] Detalhes do cálculo disponíveis ✓
- [ ] Validação de horários em ordem ✓
- [ ] Alerta para intervalo > 3h ✓
- [ ] Alerta para jornada > 12h ✓

## Exemplo de Saída Esperada

### Registro com Intervalo Completo
```
Entrada: 07:30
Saída Int.: 10:00
Retorno: 10:30
Saída: 17:00

Horas Trabalhadas: 9h00
Intervalo: 0h30

Detalhes:
Período 1: 07:30 → 10:00 = 2h30
Intervalo: 10:00 → 10:30 = 0h30
Período 2: 10:30 → 17:00 = 6h30
Total: 9h00 (descontado 0h30 de intervalo)
```

### Registro com Intervalo Incompleto
```
Entrada: 07:30
Retorno: 12:00
Saída: 13:15

Horas Trabalhadas: 5h45
Intervalo: não registrado

⚠️ Intervalo incompleto — falta horário de início do intervalo

Detalhes:
Entrada (07:30) → Último registro
Cálculo sem desconto de intervalo: 5h45
⚠️ Intervalo não descontado (incompleto)
```

## Relatório de Bugs

Se encontrar alguma inconsistência, documente:

1. **Cenário**: Descreva os horários inseridos
2. **Esperado**: O que deveria acontecer
3. **Obtido**: O que realmente aconteceu
4. **Painel**: Admin ou Funcionário
5. **Screenshot**: Se possível

Exemplo:
```
Cenário: Entrada 07:30, Retorno 12:00, Saída 13:15 (sem Saída Int.)
Esperado: 5h45 + aviso de intervalo incompleto
Obtido: 1h15 (apenas período 12:00→13:15)
Painel: Funcionário
```

## Próximos Passos

Após validar todos os testes:

1. ✅ Verificar que ambos os painéis mostram valores idênticos
2. ✅ Confirmar que avisos aparecem corretamente
3. ✅ Testar com dados reais de colaboradores
4. ✅ Validar cálculo de totais mensais
5. ✅ Verificar exportação de relatórios
