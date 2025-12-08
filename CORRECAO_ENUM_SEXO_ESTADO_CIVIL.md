# ✅ Correção: Enum Sexo e Estado Civil

## 🔴 Problema

Ao tentar alterar sexo ou estado civil no perfil do funcionário, ocorria erro:
```
invalid input value for enum tipo_sexo: "Masculino"
invalid input value for enum tipo_sexo: "Feminino"
```

## 🎯 Causa

O enum `tipo_sexo` no banco de dados aceita apenas:
- `'M'` (Masculino)
- `'F'` (Feminino)
- `'Outro'`

O enum `estado_civil` aceita apenas:
- `'Solteiro'`
- `'Casado'`
- `'Divorciado'`
- `'Viuvo'`
- `'Uniao_Estavel'`

Mas o formulário estava enviando valores diferentes.

## ✅ Correções Aplicadas

### 1. EmployeeEditDadosPessoaisModal.vue

**Antes:**
```vue
<option value="Masculino">Masculino</option>
<option value="Feminino">Feminino</option>
<option value="Solteiro(a)">Solteiro(a)</option>
<option value="Casado(a)">Casado(a)</option>
```

**Depois:**
```vue
<option value="M">Masculino</option>
<option value="F">Feminino</option>
<option value="Solteiro">Solteiro(a)</option>
<option value="Casado">Casado(a)</option>
<option value="Divorciado">Divorciado(a)</option>
<option value="Viuvo">Viúvo(a)</option>
<option value="Uniao_Estavel">União Estável</option>
```

### 2. EmployeePerfilTab.vue

Adicionadas funções para formatar a exibição:

```typescript
const formatSexo = (sexo: string) => {
  const map: Record<string, string> = {
    'M': 'Masculino',
    'F': 'Feminino',
    'Outro': 'Outro'
  }
  return map[sexo] || '-'
}

const formatEstadoCivil = (estado: string) => {
  const map: Record<string, string> = {
    'Solteiro': 'Solteiro(a)',
    'Casado': 'Casado(a)',
    'Divorciado': 'Divorciado(a)',
    'Viuvo': 'Viúvo(a)',
    'Uniao_Estavel': 'União Estável'
  }
  return map[estado] || '-'
}
```

## 📋 Valores Corretos dos Enums

### tipo_sexo
| Valor no Banco | Exibição |
|----------------|----------|
| `M` | Masculino |
| `F` | Feminino |
| `Outro` | Outro |

### estado_civil
| Valor no Banco | Exibição |
|----------------|----------|
| `Solteiro` | Solteiro(a) |
| `Casado` | Casado(a) |
| `Divorciado` | Divorciado(a) |
| `Viuvo` | Viúvo(a) |
| `Uniao_Estavel` | União Estável |

## ✅ Resultado

Agora o funcionário pode alterar sexo e estado civil sem erros! Os valores são:
- ✅ Salvos corretamente no banco (valores do enum)
- ✅ Exibidos de forma amigável na interface (labels formatados)

## 🧪 Testar

1. Acesse o portal do funcionário
2. Vá em "Perfil"
3. Clique em "Editar" nos Dados Pessoais
4. Altere o Sexo e Estado Civil
5. Salve
6. ✅ Deve funcionar sem erros!
