# Sistema de Integrações - RH Qualitec

## 📋 VISÃO GERAL

Sistema completo de integrações com APIs externas, contabilidade, bancos, eSocial e outros serviços essenciais para o RH.

---

## 🔌 INTEGRAÇÕES DISPONÍVEIS

### 1. **CONTABILIDADE** 💼

**O que faz:**
- Envia lançamentos contábeis automaticamente
- Sincroniza dados de folha de pagamento
- Exporta relatórios para sistemas contábeis

**Sistemas suportados:**
- Domínio Sistemas
- Contábil
- Outros (via API genérica)

**Configurações:**
- URL da API
- Chave de API / Usuário e Senha
- Sincronização automática (diária/semanal/mensal)

**Mapeamento de Contas:**
- Salários → Débito: 3.1.1.01 / Crédito: 1.1.1.01
- INSS Patronal → Débito: 3.2.1.01 / Crédito: 2.1.1.01
- INSS Colaborador → Débito: 1.1.1.01 / Crédito: 2.1.1.02
- FGTS → Débito: 3.2.1.02 / Crédito: 2.1.1.03
- IRRF → Débito: 1.1.1.01 / Crédito: 2.1.1.04
- Vale Transporte, Alimentação, Plano de Saúde
- Férias, 13º Salário, Rescisão

---

### 2. **eSocial** 📄

**O que faz:**
- Envia eventos obrigatórios ao governo
- Gerencia certificado digital
- Rastreia status de envios

**Eventos suportados:**
- S-1000: Informações do Empregador
- S-2200: Admissão de Trabalhador
- S-2299: Desligamento
- S-2230: Afastamento Temporário
- S-1200: Remuneração
- E mais...

**Configurações:**
- Certificado Digital (A1/A3)
- Senha do certificado
- Ambiente (Produção/Homologação)
- Envio automático

**Rastreamento:**
- Número de recibo
- Protocolo de processamento
- Mensagens de erro
- Status (Pendente/Enviado/Processado/Rejeitado)

---

### 3. **BANCOS / CNAB** 🏦

**O que faz:**
- Gera arquivos CNAB para pagamento
- Suporta CNAB 240 e CNAB 400
- Integração com APIs bancárias

**Funcionalidades:**
- Pagamento de salários
- Pagamento de fornecedores
- Geração automática de remessa
- Leitura de arquivo retorno

**Configurações:**
- Código do banco
- Agência e conta
- Tipo de conta (Corrente/Poupança)
- Layout (CNAB 240/400)
- API Key (se disponível)

**Histórico:**
- Arquivos gerados
- Valor total
- Data de pagamento
- Status de processamento

---

### 4. **PONTO ELETRÔNICO** ⏰

**O que faz:**
- Sincroniza registros de ponto
- Importa marcações automaticamente
- Calcula horas trabalhadas

**Sistemas suportados:**
- REP (Registrador Eletrônico de Ponto)
- Ahgora
- Outros via API

**Configurações:**
- URL da API
- Chave de API
- Sincronização automática
- Frequência (a cada X minutos)

**Dados sincronizados:**
- Entrada/Saída
- Horas extras
- Faltas e atrasos
- Justificativas

---

### 5. **EMAIL / SMTP** 📧

**O que faz:**
- Envia emails automáticos
- Templates personalizados
- Rastreamento de abertura

**Configurações:**
- Servidor SMTP (host e porta)
- Usuário e senha
- Segurança (TLS/SSL)
- Remetente padrão

**Templates disponíveis:**
- **Holerite**: Envio mensal de contracheque
- **Admissão**: Boas-vindas a novos colaboradores
- **Aniversário**: Mensagem de parabéns

**Variáveis:**
- `{{nome}}` - Nome do colaborador
- `{{cargo}}` - Cargo
- `{{salario}}` - Salário
- `{{mes}}` / `{{ano}}` - Período
- `{{empresa}}` - Nome da empresa
- `{{data_admissao}}` - Data de admissão

**Rastreamento:**
- Emails enviados
- Emails abertos
- Links clicados
- Taxa de abertura

---

### 6. **WhatsApp / SMS** 💬

**O que faz:**
- Envia notificações por WhatsApp
- Envia SMS
- Alertas importantes

**Casos de uso:**
- Lembrete de ponto
- Aviso de holerite disponível
- Confirmação de férias
- Alertas urgentes

**Configurações:**
- API Key do serviço
- Número de WhatsApp Business
- Provedor de SMS

---

### 7. **WEBHOOKS** 🔗

**O que faz:**
- Notifica sistemas externos em tempo real
- Dispara ações automáticas
- Integração bidirecional

**Eventos disponíveis:**
- `colaborador_criado`
- `colaborador_atualizado`
- `colaborador_desligado`
- `folha_processada`
- `ferias_aprovadas`
- `documento_vencendo`
- `ponto_registrado`

**Configurações:**
- URL de destino
- Método (POST/PUT)
- Autenticação (Bearer/Basic/API Key)
- Headers customizados
- Timeout e retries

**Exemplo de payload:**
```json
{
  "evento": "colaborador_criado",
  "timestamp": "2024-12-03T14:30:00Z",
  "dados": {
    "id": "uuid",
    "nome": "João Silva",
    "cargo": "Analista",
    "data_admissao": "2024-12-01"
  }
}
```

---

## 📊 LOGS E MONITORAMENTO

### Logs de Sincronização
- Tipo de integração
- Registros enviados/recebidos
- Status (Sucesso/Erro/Parcial)
- Mensagem de erro
- Duração

### Estatísticas
- Total de sincronizações (30 dias)
- Taxa de sucesso
- Arquivos CNAB gerados
- Eventos eSocial enviados
- Emails enviados e abertos

---

## 🔄 INTEGRAÇÃO AUTOMÁTICA

### Com Colaboradores
- Admissão → Envia evento S-2200 ao eSocial
- Desligamento → Envia evento S-2299 ao eSocial
- Alteração → Atualiza dados na contabilidade

### Com Folha de Pagamento
- Processamento → Gera lançamentos contábeis
- Pagamento → Gera arquivo CNAB
- Holerite → Envia email automático

### Com Documentos
- Vencimento → Envia alerta por email/WhatsApp
- Upload → Notifica via webhook

### Com Ponto
- Marcação → Sincroniza com sistema externo
- Fechamento → Envia para folha

---

## 🚀 COMO USAR

### 1. Configure as Integrações
- Acesse: Configurações > Integrações
- Ative as integrações desejadas
- Preencha as credenciais

### 2. Configure Mapeamentos
- Ajuste contas contábeis
- Personalize templates de email
- Configure webhooks

### 3. Teste
- Faça uma sincronização manual
- Verifique os logs
- Confirme recebimento

### 4. Ative Automação
- Habilite sincronização automática
- Defina frequência
- Configure notificações

---

## ⚠️ IMPORTANTE

### Segurança
- Credenciais são criptografadas
- Certificados digitais protegidos
- Logs de todas as ações

### Compliance
- eSocial obrigatório para empresas
- CNAB padrão bancário
- LGPD para dados pessoais

### Suporte
- Logs detalhados para debug
- Retry automático em caso de erro
- Notificações de falhas

---

## 📈 BENEFÍCIOS

✅ **Economia de Tempo**: Automação de tarefas repetitivas
✅ **Redução de Erros**: Menos digitação manual
✅ **Compliance**: Atende obrigações legais
✅ **Rastreabilidade**: Histórico completo
✅ **Escalabilidade**: Cresce com sua empresa

---

## 🔮 PRÓXIMOS PASSOS (Futuro)

- [ ] Integração com mais sistemas contábeis
- [ ] API pública do RH Qualitec
- [ ] Marketplace de integrações
- [ ] Webhooks bidirecionais
- [ ] Integração com folha de terceiros
- [ ] Importação de dados externos
- [ ] Sincronização com Google Calendar
- [ ] Integração com Slack/Teams

---

## 📞 SUPORTE

Para configurar integrações específicas ou resolver problemas:
1. Verifique os logs na aba "Logs"
2. Teste as credenciais
3. Consulte a documentação da API externa
4. Entre em contato com o suporte técnico
