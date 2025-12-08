# Holerite Individual e Envio por Email

## ✅ Funcionalidade Implementada

Adicionada a capacidade de gerar holerites individuais e enviar por email diretamente da folha de pagamento.

## 🎯 Recursos

### 1. Gerar Holerite Individual
- Botão "Gerar" para cada colaborador na tabela
- Gera holerite apenas para o colaborador selecionado
- Cálculo automático de INSS, IRRF e FGTS
- Atualiza holerite se já existir para o período

### 2. Enviar por Email
- Botão "Email" para cada colaborador na tabela
- Envia holerite formatado em HTML
- Email profissional com resumo do pagamento
- Link para acessar o portal do funcionário

## 📁 Arquivos Criados

### APIs

**1. `server/api/holerites/gerar-individual.post.ts`**
- Gera holerite para um colaborador específico
- Calcula INSS progressivo (tabela 2024)
- Calcula IRRF progressivo (tabela 2024)
- Calcula FGTS (8%)
- Atualiza ou cria novo holerite

**2. `server/api/holerites/enviar-email.post.ts`**
- Envia holerite por email
- Template HTML profissional
- Resumo do pagamento
- Link para portal do funcionário

### Frontend

**Atualizado: `app/pages/folha-pagamento.vue`**
- Adicionados botões de ação individual
- Estados de loading por colaborador
- Funções de geração e envio

## 🎨 Interface

### Tabela de Colaboradores

Cada linha agora tem 3 botões:

```
┌─────────────────────────────────────────────────────────┐
│ Colaborador │ CPF │ Salário │ ... │ Ações              │
├─────────────────────────────────────────────────────────┤
│ João Silva  │ ... │ R$ 3k   │ ... │ [Editar] [Gerar] [Email] │
│ Maria Santos│ ... │ R$ 4k   │ ... │ [Editar] [Gerar] [Email] │
└─────────────────────────────────────────────────────────┘
```

### Botões

1. **[Editar]** - Abre modal de edição (já existia)
2. **[Gerar]** - Gera holerite individual
3. **[Email]** - Envia holerite por email

## 📧 Template de Email

O email enviado inclui:

- **Cabeçalho** com gradiente roxo
- **Saudação** personalizada
- **Resumo do Pagamento:**
  - Salário Base
  - Total Proventos
  - INSS
  - IRRF
  - Total Descontos
  - **Valor Líquido** (destaque)
- **Botão** para acessar portal
- **Rodapé** profissional

### Exemplo Visual

```
┌─────────────────────────────────────┐
│ 💰 Holerite Disponível              │
│ Dezembro/2025                       │
├─────────────────────────────────────┤
│ Olá, João Silva!                    │
│                                     │
│ Seu holerite está disponível.      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ Resumo do Pagamento             │ │
│ ├─────────────────────────────────┤ │
│ │ Salário Base:    R$ 3.015,64    │ │
│ │ Total Proventos: R$ 3.015,64    │ │
│ │ INSS:           -R$ 361,88      │ │
│ │ IRRF:           -R$ 40,63       │ │
│ │ Total Descontos: -R$ 402,51     │ │
│ │                                 │ │
│ │ Valor Líquido a Receber         │ │
│ │ R$ 2.717,76                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Acessar Portal]                    │
└─────────────────────────────────────┘
```

## 🔧 Como Usar

### 1. Gerar Holerite Individual

1. Acesse **Folha de Pagamento**
2. Calcule a folha para o mês desejado
3. Na tabela, clique em **[Gerar]** no colaborador
4. Confirme a geração
5. Aguarde a mensagem de sucesso

### 2. Enviar por Email

1. Certifique-se que o holerite foi gerado
2. Clique em **[Email]** no colaborador
3. Confirme o envio
4. Aguarde a mensagem de sucesso

**Requisitos:**
- Colaborador deve ter email cadastrado
- Configuração SMTP deve estar ativa
- Holerite deve estar gerado para o período

## 📊 Fluxo de Dados

### Gerar Holerite

```
┌──────────────┐
│ Usuário      │
│ clica Gerar  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ API gerar-individual │
├──────────────────────┤
│ 1. Busca colaborador │
│ 2. Calcula INSS      │
│ 3. Calcula IRRF      │
│ 4. Calcula FGTS      │
│ 5. Salva holerite    │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│ Sucesso!     │
│ Holerite     │
│ disponível   │
└──────────────┘
```

### Enviar Email

```
┌──────────────┐
│ Usuário      │
│ clica Email  │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│ API enviar-email     │
├──────────────────────┤
│ 1. Busca colaborador │
│ 2. Busca holerite    │
│ 3. Busca config SMTP │
│ 4. Monta HTML        │
│ 5. Envia email       │
└──────┬───────────────┘
       │
       ▼
┌──────────────┐
│ Email        │
│ enviado!     │
└──────────────┘
```

## ⚙️ Configuração Necessária

### 1. Email SMTP

Configure em **Configurações > Email**:

- Host SMTP
- Porta
- Usuário
- Senha
- Remetente

### 2. Email do Colaborador

Cadastre em **Colaboradores**:

- Email Corporativo (preferencial)
- Email Pessoal (alternativo)

## 🧪 Testes

### Testar Geração Individual

1. Acesse folha de pagamento
2. Calcule folha de dezembro/2025
3. Clique em "Gerar" para um colaborador
4. Verifique mensagem de sucesso
5. Acesse portal do funcionário
6. Verifique se holerite aparece

### Testar Envio de Email

1. Configure SMTP (Gmail recomendado)
2. Cadastre email do colaborador
3. Gere holerite individual
4. Clique em "Email"
5. Verifique caixa de entrada
6. Abra email e verifique formatação

## 🎯 Casos de Uso

### Caso 1: Colaborador Novo

```
Situação: Colaborador entrou no meio do mês
Solução:
1. Calcule folha normalmente
2. Edite valores do colaborador
3. Gere holerite individual
4. Envie por email
```

### Caso 2: Correção de Holerite

```
Situação: Erro no cálculo de um colaborador
Solução:
1. Edite valores na folha
2. Gere holerite individual novamente
3. Envie email atualizado
```

### Caso 3: Envio Urgente

```
Situação: Colaborador precisa do holerite urgente
Solução:
1. Gere holerite individual
2. Envie por email imediatamente
3. Colaborador recebe em segundos
```

## ⚠️ Tratamento de Erros

### Erro: Colaborador não encontrado
**Causa:** ID inválido
**Solução:** Verifique se colaborador existe

### Erro: Email não cadastrado
**Causa:** Colaborador sem email
**Solução:** Cadastre email do colaborador

### Erro: Configuração SMTP não encontrada
**Causa:** SMTP não configurado
**Solução:** Configure SMTP em Configurações > Email

### Erro: Holerite não encontrado
**Causa:** Holerite não foi gerado
**Solução:** Gere o holerite primeiro

### Erro: Falha ao enviar email
**Causa:** Credenciais SMTP inválidas
**Solução:** Verifique configuração SMTP

## 💡 Dicas

### Performance

- Gere holerites em lote primeiro
- Depois envie emails individuais
- Evite enviar muitos emails simultâneos

### Segurança

- Use senha de aplicativo (Gmail)
- Não compartilhe credenciais SMTP
- Verifique destinatário antes de enviar

### Usabilidade

- Confirme antes de enviar
- Verifique email do colaborador
- Teste com seu próprio email primeiro

## 📈 Melhorias Futuras

### Possíveis Adições

1. **Envio em Lote**
   - Selecionar múltiplos colaboradores
   - Enviar todos de uma vez

2. **Agendamento**
   - Agendar envio automático
   - Enviar todo dia 5 do mês

3. **Anexo PDF**
   - Gerar PDF do holerite
   - Anexar ao email

4. **Histórico de Envios**
   - Registrar quando foi enviado
   - Quem enviou
   - Status de entrega

5. **Templates Personalizados**
   - Criar templates de email
   - Personalizar cores e layout

## 📝 Observações

- Holerites são calculados com tabelas 2024
- INSS progressivo com teto de R$ 908,85
- IRRF com dedução por dependente
- FGTS fixo em 8%
- Consulte contador para cálculos oficiais

## ✅ Status

- ✅ API de geração individual
- ✅ API de envio por email
- ✅ Interface com botões
- ✅ Loading states
- ✅ Tratamento de erros
- ✅ Template HTML profissional
- ✅ Documentação completa

**Pronto para uso!**
