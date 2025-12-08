# Migration 17 - Sistema de Integrações

## Descrição
Esta migration cria o sistema completo de integrações com APIs externas, contabilidade, bancos, eSocial e mais.

## Tabelas Criadas

### 1. `configuracoes_integracoes`
Configurações de todas as integrações:
- Contabilidade (Domínio, Contábil, etc)
- eSocial
- Bancos/CNAB
- Ponto Eletrônico
- Email/SMTP
- WhatsApp/SMS
- Webhooks

### 2. `logs_sincronizacao`
Histórico de sincronizações:
- Tipo de integração
- Registros enviados/recebidos
- Status e mensagens
- Duração

### 3. `mapeamento_contas_contabeis`
Mapeamento de lançamentos contábeis:
- Tipo de lançamento (salário, INSS, FGTS, etc)
- Conta débito/crédito
- Centro de custo
- Histórico padrão

### 4. `arquivos_cnab`
Histórico de arquivos CNAB gerados:
- CNAB 240 ou 400
- Banco, valor total
- Status de processamento
- Conteúdo do arquivo

### 5. `eventos_esocial`
Eventos enviados ao eSocial:
- Tipo de evento (S-1000, S-2200, etc)
- XML de envio/retorno
- Status, recibo, protocolo
- Mensagens de erro

### 6. `templates_email`
Templates de emails:
- Código único
- Assunto e corpo HTML
- Variáveis disponíveis
- Anexos padrão

### 7. `historico_emails`
Histórico de emails enviados:
- Destinatário
- Template usado
- Status (enviado, aberto, clicado)
- Rastreamento

### 8. `webhooks`
Webhooks configurados:
- URL e método
- Eventos que disparam
- Autenticação
- Estatísticas

### 9. `logs_webhooks`
Logs de execução de webhooks:
- Payload enviado
- Resposta recebida
- Status e erros
- Tentativas

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `17_integracoes.sql`
4. Execute

## Dados Pré-configurados

### Mapeamentos Contábeis (11 tipos):
- Salários
- INSS Patronal e Colaborador
- FGTS
- IRRF
- Vale Transporte
- Vale Alimentação
- Plano de Saúde
- Férias
- 13º Salário
- Rescisão

### Templates de Email (3 templates):
- Envio de Holerite
- Boas-vindas (Admissão)
- Feliz Aniversário

## Integrações Disponíveis

### 1. Contabilidade
- Sincronização automática de lançamentos
- Mapeamento de contas contábeis
- Exportação de dados

### 2. eSocial
- Envio de eventos
- Certificado digital
- Ambiente produção/homologação

### 3. Bancos/CNAB
- Geração de CNAB 240/400
- Pagamento de salários
- Integração bancária

### 4. Ponto Eletrônico
- Sincronização automática
- Importação de registros
- APIs REP, Ahgora, etc

### 5. Email/SMTP
- Envio de emails
- Templates personalizados
- Rastreamento de abertura

### 6. WhatsApp/SMS
- Notificações por WhatsApp
- Envio de SMS
- APIs externas

### 7. Webhooks
- Notificações em tempo real
- Eventos customizados
- Retry automático

## Verificação

Após executar, verifique:
```sql
SELECT COUNT(*) FROM configuracoes_integracoes; -- Deve retornar 1
SELECT COUNT(*) FROM mapeamento_contas_contabeis; -- Deve retornar 11
SELECT COUNT(*) FROM templates_email; -- Deve retornar 3
```
