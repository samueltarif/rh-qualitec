# Correção do Cálculo de Horas Trabalhadas - Ponto Eletrônico

## Problema Identificado

Havia inconsistência entre o painel do funcionário e o painel admin no cálculo de horas trabalhadas:

- **Painel funcionário** mostrava apenas o período após o intervalo (ex: 12:00→13:15 = 1h15)
- **Painel admin** mostrava o total sem descontar intervalo (ex: 07:30→13:15 = 5h45)

## Solução Implementada

### 1. Utilitário Centralizado (`app/utils/pontoCalculos.ts`)

Criado um módulo compartilhado que implementa a lógica correta de cálculo seguindo estas regras:

#### Regras de Cálculo

**A. Intervalo Completo (ambos horários preenchidos)**
```
Horas Trabalhadas = (Saída Intervalo - Entrada) + (Saída Final - Retorno)
```
Exemplo: Entrada 07:30, Saída Int. 10:00, Retorno 10:30, Saída 17:00
- Período 1: 10:00 - 07:30 = 2h30
- Intervalo: 10:30 - 10:00 = 0h30
- Período 2: 17:00 - 10:30 = 6h30
- **Total: 2h30 + 6h30 = 9h00** (intervalo descontado)

**B. Sem Intervalo Registrado**
```
Horas Trabalhadas = Saída Final - Entrada
```
Exemplo: Entrada 07:30, Saída 13:15 (sem intervalo)
- **Total: 13:15 - 07:30 = 5h45**
- Aviso: "ℹ️ Nenhum intervalo registrado"

**C. Intervalo Incompleto (apenas um horário)**
```
Horas Trabalhadas = Último Horário - Entrada (SEM descontar intervalo)
```
Exemplo: Entrada 07:30, Retorno 12:00, Saída 13:15 (falta Saída Int.)
- **Total: 13:15 - 07:30 = 5h45**
- Aviso: "⚠️ Intervalo incompleto — falta horário de início do intervalo"

**D. Múltiplos Intervalos**
Suporta até 3 períodos (entrada_1/saida_1, entrada_2/saida_2, entrada_3/saida_3)

### 2. Funções Disponíveis

#### `calcularHorasTrabalhadas(registro)`
Retorna:
```typescript
{
  totalMinutos: number          // Total em minutos
  horasFormatadas: string       // Ex: "8h30"
  intervaloMinutos: number      // Intervalo em minutos
  intervaloFormatado: string    // Ex: "1h00" ou "não registrado"
  avisos: string[]              // Lista de avisos/alertas
  detalhes: string              // Explicação do cálculo
}
```

#### `calcularTotalRegistros(registros[])`
Calcula totais de múltiplos registros:
```typescript
{
  totalMinutos: number
  totalFormatado: string
  diasTrabalhados: number
  mediaHorasDia: string
}
```

#### `validarOrdemHorarios(registro)`
Valida se os horários estão em ordem cronológica:
```typescript
{
  valido: boolean
  erros: string[]
}
```

### 3. Avisos Implementados

Os avisos são exibidos como badges coloridos:

- 🟡 **Amarelo (⚠️)**: Avisos importantes
  - "Intervalo incompleto — falta horário de início/retorno"
  - "Intervalo muito longo (mais de 3 horas)"
  - "Jornada muito longa (mais de 12 horas)"

- 🔵 **Azul (ℹ️)**: Informações
  - "Nenhum intervalo registrado"
  - "Registro em andamento ou incompleto"

- 🔴 **Vermelho (❌)**: Erros
  - "Horários inválidos (duração negativa)"
  - "Intervalo com duração negativa"

### 4. Componentes Atualizados

#### `app/components/EmployeePontoTab.vue`
- Usa `calcularHorasTrabalhadas()` para cada registro
- Exibe avisos inline na coluna "Total"
- Tooltip com detalhes do cálculo ao passar o mouse

#### `app/pages/ponto.vue` (Admin)
- Usa a mesma lógica de cálculo
- Preview em tempo real no modal de edição
- Mostra cálculo detalhado com explicação passo a passo
- Validação ao alterar qualquer horário

### 5. Preview no Modal de Edição

Ao editar um registro, o modal mostra:
```
Preview do Cálculo:
Horas Trabalhadas: 8h00
Intervalo: 1h00

⚠️ Intervalo incompleto — falta horário de início

Ver detalhes do cálculo ▼
  Período 1: 07:30 → 10:00 = 2h30
  Intervalo: 10:00 → 10:30 = 0h30
  Período 2: 10:30 → 17:00 = 6h30
  Total: 8h00 (descontado 1h00 de intervalo)
```

## Casos de Teste

### Teste A: Nenhum Intervalo
```
Entrada: 07:30
Saída: 13:15
```
**Esperado**: 5h45 + aviso "Nenhum intervalo registrado"

### Teste B: Intervalo Completo
```
Entrada: 07:30
Saída Int.: 10:00
Retorno: 10:30
Saída: 17:00
```
**Esperado**: 9h00 (descontado 0h30 de intervalo)

### Teste C: Intervalo Incompleto (falta início)
```
Entrada: 07:30
Retorno: 12:00
Saída: 13:15
```
**Esperado**: 5h45 + aviso "Intervalo incompleto — falta horário de início"

### Teste D: Intervalo Incompleto (falta retorno)
```
Entrada: 07:30
Saída Int.: 10:00
Saída: 13:15
```
**Esperado**: 5h45 + aviso "Intervalo incompleto — falta horário de retorno"

### Teste E: Jornada Overnight (passa da meia-noite)
```
Entrada: 22:00
Saída Int.: 00:00 (dia seguinte)
Retorno: 01:00
Saída: 06:00
```
**Nota**: Requer ajuste adicional para suportar mudança de dia

### Teste F: Múltiplos Intervalos
```
Entrada: 07:00
Saída Int. 1: 10:00
Retorno 1: 10:30
Saída Int. 2: 14:00
Retorno 2: 14:30
Saída: 18:00
```
**Esperado**: 10h00 (descontado 1h00 de intervalos)

## Validações Implementadas

1. ✅ Horários em ordem cronológica
2. ✅ Duração não negativa
3. ✅ Intervalo não negativo
4. ✅ Alerta para intervalo > 3h
5. ✅ Alerta para jornada > 12h
6. ✅ Detecção de intervalo incompleto
7. ✅ Consistência entre painéis

## Como Testar

1. **Acesse o painel do funcionário** (`/employee`)
   - Vá para a aba "Ponto"
   - Verifique os registros existentes
   - Observe os avisos exibidos

2. **Acesse o painel admin** (`/ponto`)
   - Compare os mesmos registros
   - Valores devem ser idênticos
   - Clique em "Editar" em um registro

3. **No modal de edição**:
   - Altere os horários
   - Observe o preview atualizar em tempo real
   - Veja os avisos e detalhes do cálculo

4. **Teste os cenários**:
   - Crie um registro sem intervalo
   - Crie um registro com intervalo completo
   - Crie um registro com intervalo incompleto
   - Verifique que os avisos aparecem corretamente

## Melhorias Futuras

1. **Suporte a turnos overnight**: Calcular corretamente quando a saída é no dia seguinte
2. **Configuração de jornada**: Permitir definir jornada padrão por colaborador
3. **Cálculo automático de horas extras**: Baseado na jornada configurada
4. **Validação de horários**: Bloquear salvamento se houver erros críticos
5. **Histórico de ajustes**: Registrar quem e quando alterou um registro
6. **Notificações**: Alertar gestor sobre intervalos incompletos ou jornadas irregulares

## Arquivos Modificados

- ✅ `app/utils/pontoCalculos.ts` (NOVO)
- ✅ `app/components/EmployeePontoTab.vue`
- ✅ `app/pages/ponto.vue`

## Resultado

Agora ambos os painéis (funcionário e admin) mostram **exatamente o mesmo valor** para horas trabalhadas, seguindo a mesma lógica de cálculo e exibindo os mesmos avisos quando há inconsistências nos registros.
