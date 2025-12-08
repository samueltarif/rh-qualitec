# Modal de Edição de Folha de Pagamento

## ✅ Implementado

### 1. Botão "Editar" na Tabela
- Adicionado botão "Editar" em cada linha da tabela de colaboradores
- Ao clicar, abre um modal com os dados do colaborador

### 2. Dados Pré-preenchidos (Não Editáveis)
O modal exibe automaticamente:
- ✅ Nome do colaborador
- ✅ CPF
- ✅ Cargo
- ✅ Salário base
- ✅ Dependentes
- ✅ Horas contratadas (padrão: 220h/mês)

### 3. Campos Editáveis

#### 📈 Proventos (Adições)
- Horas extras 50%
- Horas extras 100%
- Bônus / Gratificações
- Comissões
- Adicional Insalubridade (%)
- Adicional Periculosidade (%)
- Adicional Noturno
- Outros Proventos (personalizado)

#### 📉 Descontos
- Adiantamento salarial
- Empréstimos / Consignados
- Faltas (horas) - calcula automaticamente o desconto
- Atrasos (horas) - calcula automaticamente o desconto
- Vale Transporte
- Vale Refeição
- Vale Alimentação
- Outros Descontos (personalizado)

#### 🎁 Benefícios (Aparecem no Holerite)
- Plano de Saúde
- Plano Odontológico
- Seguro de Vida
- Auxílio Creche
- Auxílio Educação
- Auxílio Combustível
- Outros Benefícios (personalizado)
- **Nota**: Benefícios são pagos pela empresa e aparecem no holerite, mas não afetam o salário líquido

#### 💰 Impostos (Editáveis com Override)
- INSS - calculado automaticamente, mas pode ser editado manualmente
- IRRF - calculado automaticamente, mas pode ser editado manualmente
- Mostra o valor calculado abaixo do campo para referência

### 4. Resumo em Tempo Real

Um painel lateral mostra o recálculo instantâneo:
- 💵 Salário Base
- ➕ Total Proventos
- 💰 Salário Bruto
- ➖ INSS
- ➖ IRRF
- ➖ Outros Descontos
- 🟰 Total Descontos
- ✅ **Salário Líquido** (destaque)
- 🏦 FGTS (8% - pago pela empresa)
- 🎁 Total Benefícios (quando aplicável)

### 5. Cálculos Automáticos

#### INSS (Tabela 2024)
- Até R$ 1.412,00: 7,5%
- De R$ 1.412,01 a R$ 2.666,68: 9%
- De R$ 2.666,69 a R$ 4.000,03: 12%
- De R$ 4.000,04 a R$ 7.786,02: 14%
- Teto: R$ 908,85

#### IRRF (Tabela 2024)
- Até R$ 2.259,20: Isento
- De R$ 2.259,21 a R$ 2.826,65: 7,5% - R$ 169,44
- De R$ 2.826,66 a R$ 3.751,05: 15% - R$ 381,44
- De R$ 3.751,06 a R$ 4.664,68: 22,5% - R$ 662,77
- Acima de R$ 4.664,68: 27,5% - R$ 896,00
- Dedução por dependente: R$ 189,59

#### Outros Cálculos
- **Horas Extras 50%**: Valor hora × 1,5 × quantidade de horas
- **Horas Extras 100%**: Valor hora × 2 × quantidade de horas
- **Valor Hora**: Salário base ÷ horas contratadas
- **Faltas/Atrasos**: Valor hora × quantidade de horas
- **FGTS**: 8% do salário bruto (pago pela empresa)

## 🎨 Interface

### Layout
- **Modal grande (xl)** com 2 colunas:
  - Esquerda (2/3): Formulário de edição
  - Direita (1/3): Resumo em tempo real (sticky)

### Cores e Organização
- 🟢 Verde: Proventos
- 🔴 Vermelho: Descontos
- 🔵 Azul: Impostos
- 🟣 Roxo: Resumo

### Responsividade
- Desktop: Layout de 2 colunas
- Mobile: Colunas empilhadas

## 🔧 Próximos Passos

Para completar a funcionalidade:

1. **Implementar API de Salvamento**
   - Criar endpoint `/api/folha/editar-colaborador`
   - Salvar ajustes no banco de dados
   - Recalcular totais da folha

2. **Persistir Dados**
   - Criar tabela `folha_ajustes` para armazenar edições
   - Vincular com `colaborador_id`, `mes`, `ano`
   - Manter histórico de alterações

3. **Integração com Holerites**
   - Ao gerar holerites, considerar os ajustes salvos
   - Exibir detalhamento de proventos e descontos no PDF

4. **Auditoria**
   - Registrar quem fez a alteração
   - Registrar data/hora da alteração
   - Log de atividades

## 📝 Estrutura de Dados Sugerida

```sql
CREATE TABLE folha_ajustes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  colaborador_id UUID REFERENCES colaboradores(id),
  mes INTEGER NOT NULL,
  ano INTEGER NOT NULL,
  
  -- Proventos
  horas_extras_50 DECIMAL(10,2) DEFAULT 0,
  horas_extras_100 DECIMAL(10,2) DEFAULT 0,
  bonus DECIMAL(10,2) DEFAULT 0,
  comissoes DECIMAL(10,2) DEFAULT 0,
  adicional_insalubridade DECIMAL(5,2) DEFAULT 0,
  adicional_periculosidade DECIMAL(5,2) DEFAULT 0,
  adicional_noturno DECIMAL(10,2) DEFAULT 0,
  outros_proventos DECIMAL(10,2) DEFAULT 0,
  
  -- Descontos
  adiantamento DECIMAL(10,2) DEFAULT 0,
  emprestimos DECIMAL(10,2) DEFAULT 0,
  faltas_horas DECIMAL(10,2) DEFAULT 0,
  atrasos_horas DECIMAL(10,2) DEFAULT 0,
  vale_transporte DECIMAL(10,2) DEFAULT 0,
  vale_refeicao DECIMAL(10,2) DEFAULT 0,
  vale_alimentacao DECIMAL(10,2) DEFAULT 0,
  outros_descontos DECIMAL(10,2) DEFAULT 0,
  
  -- Benefícios (aparecem no holerite, pagos pela empresa)
  plano_saude DECIMAL(10,2) DEFAULT 0,
  plano_odontologico DECIMAL(10,2) DEFAULT 0,
  seguro_vida DECIMAL(10,2) DEFAULT 0,
  auxilio_creche DECIMAL(10,2) DEFAULT 0,
  auxilio_educacao DECIMAL(10,2) DEFAULT 0,
  auxilio_combustivel DECIMAL(10,2) DEFAULT 0,
  outros_beneficios DECIMAL(10,2) DEFAULT 0,
  
  -- Impostos manuais (null = usar cálculo automático)
  inss_manual DECIMAL(10,2),
  irrf_manual DECIMAL(10,2),
  
  -- Auditoria
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP DEFAULT NOW(),
  atualizado_em TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(colaborador_id, mes, ano)
);
```

## 🎯 Como Usar

1. Acesse a página **Folha de Pagamento**
2. Selecione o mês e ano
3. Clique em **Calcular Folha**
4. Na tabela de colaboradores, clique em **Editar**
5. Preencha os campos desejados
6. Observe o resumo sendo atualizado em tempo real
7. Clique em **Salvar Alterações**

## 💡 Dicas

- Deixe os campos de impostos vazios para usar o cálculo automático
- Use "Outros Proventos" e "Outros Descontos" para valores personalizados
- O resumo lateral mostra o impacto de cada alteração instantaneamente
- Faltas e atrasos são convertidos automaticamente em valores monetários
