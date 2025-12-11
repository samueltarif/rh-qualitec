---
inclusion: always
---

# Geração de Holerite Oficial - Formato Padrão da Empresa

## Missão
Gerar holerites completos e detalhados no mesmo modelo oficial usado no painel do funcionário, painel do administrador e enviado por e-mail.

## Estrutura Obrigatória do Holerite

### 1. Cabeçalho
```
SPEED GESTÃO E SERVIÇOS ADMINISTRATIVOS LTDA
CNPJ: 46.732.564/0001-10                    CC: GERAL              Folha Mensal
                                             Mensalista             Novembro de 2025
```

### 2. Bloco do Colaborador
```
Código    Nome do Funcionário                                    CBO         Departamento    Mat
8         SAMUEL BARRETOS TARIF                                  354125      1               1
          AUX COMERCIAL                                          Admissão:   01/08/2025
```

### 3. Tabela Principal (5 colunas obrigatórias)
| Código | Descrição | Referência | Vencimentos | Descontos |
|--------|-----------|------------|-------------|-----------|

### 4. Linhas de Proventos (exemplos)
- 8781 | DIAS NORMAIS | 30,00 | 2.650,00 | -
- 19 | DIFERENÇA DE SALÁRIOS | 300,00 | 300,00 | -

### 5. Linhas de Descontos (exemplos)
- 998 | I.N.S.S. | 8,39 | - | 247,40
- 981 | DESC.ADIANT.SALARIAL | 1.060,00 | - | 1.060,00

### 6. Totais
```
Total de Vencimentos: 2.950,00
Total de Descontos: 1.307,40
Valor Líquido: 1.642,60
```

### 7. Rodapé Técnico
```
Salário Base    Sal. Contr. INSS    Base Cálc. FGTS    F.G.T.S do Mês    Base Cálc. IRRF    Faixa IRRF
2.650,00        2.950,00            2.950,00           236,00            2.342,80           0,00
```

### 8. Assinatura Digital
```
Assinado de forma digital por SILVANA APARECIDA BARDUCHI:04487488869
Dados: 2025.12.08 10:13:07 -03'00'
```

## Fontes de Dados

### Dados Cadastrais
- Arquivo: `app/components/ColaboradorFormModal.vue`
- Campos: nome, CPF, código, cargo, CBO, departamento, filial

### Dados Contratuais
- Aba: Profissionais
- Campos: salário base, data admissão, tipo contrato

### Benefícios
- Arquivo: `app/components/FolhaBeneficiosSection.vue`
- Campos: vale-transporte, vale-refeição, plano saúde, odontológico

### Regras de Cálculo
- Arquivo: `app/pages/configuracoes/folha.vue`
- INSS: tabela progressiva 2025
- IRRF: após desconto INSS
- FGTS: 8% sobre base

## Códigos Padrão

### Proventos
- 8781: DIAS NORMAIS
- 19: DIFERENÇA DE SALÁRIOS
- 101: HORAS EXTRAS 50%
- 102: HORAS EXTRAS 100%
- 103: ADICIONAL NOTURNO
- 104: COMISSÕES
- 105: BONIFICAÇÕES

### Descontos
- 998: I.N.S.S.
- 999: I.R.R.F.
- 981: DESC.ADIANT.SALARIAL
- 201: PLANO DE SAÚDE
- 202: ODONTOLÓGICO
- 203: PENSÃO ALIMENTÍCIA

### IMPORTANTE
Vale-transporte e vale-refeição/alimentação NÃO têm desconto no sistema.

## Estrutura JSON de Retorno

```json
{
  "empresa": {
    "razao_social": "SPEED GESTÃO E SERVIÇOS ADMINISTRATIVOS LTDA",
    "cnpj": "46.732.564/0001-10",
    "centro_custo": "GERAL"
  },
  "folha": {
    "tipo": "Folha Mensal",
    "regime": "Mensalista",
    "competencia": "Novembro de 2025"
  },
  "colaborador": {
    "codigo": "8",
    "nome": "SAMUEL BARRETOS TARIF",
    "cargo": "AUX COMERCIAL",
    "cbo": "354125",
    "departamento": "1",
    "matricula": "1",
    "data_admissao": "01/08/2025"
  },
  "tabela": {
    "proventos": [
      {
        "codigo": "8781",
        "descricao": "DIAS NORMAIS",
        "referencia": "30,00",
        "valor": 2650.00
      }
    ],
    "descontos": [
      {
        "codigo": "998",
        "descricao": "I.N.S.S.",
        "referencia": "8,39",
        "valor": 247.40
      }
    ]
  },
  "totais": {
    "vencimentos": 2950.00,
    "descontos": 1307.40,
    "liquido": 1642.60
  },
  "rodape": {
    "salario_base": 2650.00,
    "base_inss": 2950.00,
    "base_fgts": 2950.00,
    "fgts_mes": 236.00,
    "base_irrf": 2342.80,
    "faixa_irrf": 0.00
  },
  "assinatura": {
    "responsavel": "SILVANA APARECIDA BARDUCHI",
    "cpf": "04487488869",
    "data_hora": "2025.12.08 10:13:07 -03'00'"
  }
}
```

## Regras de Validação

1. ✅ Todos os campos obrigatórios preenchidos
2. ✅ Cálculos corretos conforme tabela oficial
3. ✅ Totais consistentes (vencimentos - descontos = líquido)
4. ✅ Nenhum valor negativo (exceto se permitido por lei)
5. ✅ INSS calculado progressivamente
6. ✅ IRRF calculado após desconto INSS
7. ✅ FGTS sempre 8% da base
8. ✅ Formato de datas: DD/MM/YYYY
9. ✅ Formato de valores: 0.000,00

## Tipos de Folha

- **Mensal**: folha normal do mês
- **Adiantamento**: 40% do salário base
- **13º Salário - 1ª Parcela**: 50% do salário (sem descontos)
- **13º Salário - 2ª Parcela**: 50% restante (com descontos INSS/IRRF)
- **Férias**: salário + 1/3 constitucional

## Observações Automáticas

### 13º Salário
```
Cálculo: (Salário Base / 12) × Meses Trabalhados
Meses trabalhados: [X] meses
Base de cálculo: R$ [valor]
```

### Adiantamento
```
Adiantamento salarial referente ao período [mês/ano]
Valor: 40% do salário base
Desconto será aplicado na folha do mês
```

## Arquivo de Geração
- Utilitário: `app/utils/holeritePDF.ts`
- API: `server/api/holerites/gerar.post.ts`
- Componente: `app/components/ModalHolerite.vue`

## Nunca Simplificar

Sempre retornar:
- ✅ Completo
- ✅ Detalhado
- ✅ Igual ao PDF real
- ✅ Com rodapé técnico
- ✅ Em JSON estruturado
- ✅ Pronto para renderização
