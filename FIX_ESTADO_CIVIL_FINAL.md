# ✅ Correção Final: Estado Civil

## 🔴 Problema

Erro ao salvar estado civil:
```
invalid input value for enum estado_civil: "Solteiro"
```

## 🎯 Causa Raiz

O script `fix_todos_enums_COMPLETO.sql` foi executado anteriormente e alterou o enum `estado_civil` para aceitar valores com parênteses e acentos:

```sql
CREATE TYPE estado_civil AS ENUM (
  'Solteiro(a)',
  'Casado(a)',
  'Divorciado(a)',
  'Viúvo(a)',
  'União Estável'
);
```

Mas o modal estava enviando valores sem parênteses (`'Solteiro'`, `'Casado'`, etc).

## ✅ Correção Aplicada

### EmployeeEditDadosPessoaisModal.vue

**Antes:**
```vue
<option value="Solteiro">Solteiro(a)</option>
<option value="Casado">Casado(a)</option>
<option value="Divorciado">Divorciado(a)</option>
<option value="Viuvo">Viúvo(a)</option>
<option value="Uniao_Estavel">União Estável</option>
```

**Depois:**
```vue
<option value="Solteiro(a)">Solteiro(a)</option>
<option value="Casado(a)">Casado(a)</option>
<option value="Divorciado(a)">Divorciado(a)</option>
<option value="Viúvo(a)">Viúvo(a)</option>
<option value="União Estável">União Estável</option>
```

### EmployeePerfilTab.vue

Simplificada a função `formatEstadoCivil()` pois o enum já está no formato correto:

```typescript
const formatEstadoCivil = (estado: string) => {
  // O enum já está no formato correto com parênteses
  return estado || '-'
}
```

## 📋 Valores Corretos dos Enums (Após fix_todos_enums_COMPLETO.sql)

### tipo_sexo
| Valor no Banco | Exibição |
|----------------|----------|
| `M` | Masculino |
| `F` | Feminino |
| `Outro` | Outro |

### estado_civil
| Valor no Banco | Exibição |
|----------------|----------|
| `Solteiro(a)` | Solteiro(a) |
| `Casado(a)` | Casado(a) |
| `Divorciado(a)` | Divorciado(a) |
| `Viúvo(a)` | Viúvo(a) |
| `União Estável` | União Estável |

### tipo_conta_bancaria
| Valor no Banco | Exibição |
|----------------|----------|
| `corrente` | Corrente |
| `poupanca` | Poupança |
| `salario` | Salário |

## ✅ Resultado

Agora o funcionário pode alterar sexo e estado civil sem erros! Os valores são salvos e exibidos corretamente.

## 🧪 Testar

1. Acesse o portal do funcionário
2. Vá em "Perfil"
3. Clique em "Editar" nos Dados Pessoais
4. Altere o Sexo e Estado Civil
5. Salve
6. ✅ Deve funcionar perfeitamente!

## 📝 Nota Importante

Se você executou o script `fix_todos_enums_COMPLETO.sql`, os enums foram alterados para ter valores mais amigáveis (com parênteses e acentos). Esta correção alinha o frontend com essas mudanças.

Se você NÃO executou esse script, os enums originais são:
- `'Solteiro'`, `'Casado'`, `'Divorciado'`, `'Viuvo'`, `'Uniao_Estavel'`

Neste caso, você deve usar os valores sem parênteses no modal.
