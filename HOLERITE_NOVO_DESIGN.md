# 🎨 Novo Design do Holerite - Estilo Qualitec

## ✅ Alterações Implementadas

### 1. **Cabeçalho Profissional**
- Logo da Qualitec no topo esquerdo
- Dados completos da empresa (CNPJ, endereço, telefone)
- Título centralizado "DEMONSTRATIVO DE PAGAMENTO"
- Botão "Baixar PDF" no canto superior direito

### 2. **Dados do Colaborador**
Layout em duas colunas com:
- Nome do Colaborador
- CPF formatado
- Cargo
- Competência (mês/ano) destacada em azul
- Data de Pagamento
- Dias Trabalhados (para 13º salário)

### 3. **Tabela de Vencimentos e Descontos**
Formato profissional com colunas:
- **Cód.**: Código do item (001, 002, 901, 902, etc.)
- **Descrição**: Nome do item
- **Vencimentos (R$)**: Valores a receber
- **Descontos (R$)**: Valores descontados

**Proventos incluem:**
- Salário Base
- Horas Extras 50% e 100%
- Benefícios (VT e VA) marcados em roxo com "(pago pela empresa)"
- Outros proventos

**Descontos incluem:**
- INSS
- IRRF
- Faltas
- Atrasos
- Outros descontos

### 4. **Totalizadores**
- **Total Proventos**: Fundo verde claro
- **Total Descontos**: Fundo vermelho claro
- **Salário Líquido**: Destaque grande em verde com ícone de dinheiro

### 5. **Informações Adicionais**
Cards com:
- Base FGTS
- FGTS do Mês (8%)
- Total Benefícios (se houver)
- Tipo (Mensal ou 13º Salário)

### 6. **Observações**
- Fundo amarelo claro
- Borda esquerda laranja
- Suporta múltiplas linhas

### 7. **Rodapé**
- Texto informativo sobre o documento
- Data e hora de geração formatada

## 🎨 Cores Utilizadas

- **Verde**: Proventos e valor líquido (#16a34a)
- **Vermelho**: Descontos (#dc2626)
- **Roxo**: Benefícios pagos pela empresa (#9333ea)
- **Azul**: Competência e links (#2563eb)
- **Cinza**: Textos e bordas (#6b7280, #d1d5db)

## 📱 Responsividade

- Layout adaptável para diferentes tamanhos de tela
- Tabela com scroll horizontal se necessário
- Otimizado para impressão

## 🖨️ Impressão

Estilos específicos para impressão:
- Oculta botões e elementos interativos
- Mantém cores importantes (print-color-adjust)
- Evita quebras de página no meio da tabela
- Layout otimizado para A4

## 📄 Formato Similar ao Exemplo

O design segue o padrão do exemplo fornecido:
- Logo e dados da empresa no topo
- Tabela com códigos e descrições
- Valores alinhados à direita
- Totalizadores destacados
- Informações adicionais organizadas
- Rodapé com data de geração

## 🚀 Como Usar

1. Abra qualquer holerite no sistema
2. O novo design será exibido automaticamente
3. Use "Baixar PDF" para exportar
4. Use "Imprimir" para impressão direta

## 📝 Observações

- A logo está em `/public/images/logo.png`
- Os dados da empresa são carregados da API `/api/empresa`
- Valores são formatados em pt-BR
- Suporta holerites mensais e de 13º salário
