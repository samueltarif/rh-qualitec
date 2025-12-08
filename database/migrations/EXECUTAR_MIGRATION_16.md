# Migration 16 - Sistema de Backup e Segurança

## Descrição
Esta migration cria o sistema completo de backup, segurança, logs e auditoria para o RH.

## Tabelas Criadas

### 1. `logs_acesso`
Registra todos os acessos ao sistema:
- Usuário, ação, recurso acessado
- IP, user agent, dispositivo
- Status (sucesso/erro)
- Duração da requisição

### 2. `auditoria`
Rastreamento de mudanças em dados:
- Quem fez a alteração
- Qual tabela e registro
- Dados antes e depois
- Campos alterados

### 3. `configuracoes_backup`
Configurações de backup automático:
- Frequência (diário, semanal, mensal)
- Horário de execução
- Retenção de backups
- O que incluir no backup
- Notificações

### 4. `historico_backups`
Histórico de backups realizados:
- Tipo (automático/manual)
- Status, tamanho, duração
- Tabelas incluídas
- URL do arquivo

### 5. `sessoes_ativas`
Controle de sessões de usuários:
- Token, IP, dispositivo
- Último acesso
- Data de expiração

### 6. `tentativas_login`
Registro de tentativas de login:
- Email, IP
- Sucesso/falha
- Motivo da falha
- Bloqueios temporários

### 7. `politicas_seguranca`
Políticas de segurança da empresa:
- Requisitos de senha
- Limites de tentativas de login
- Expiração de sessão
- Configurações de auditoria
- LGPD/Compliance

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `16_backup_seguranca.sql`
4. Execute

## Funcionalidades

### Backup
- Backup automático configurável
- Backup manual sob demanda
- Retenção automática de backups
- Criptografia de backups
- Notificações de sucesso/erro

### Segurança
- Políticas de senha fortes
- Bloqueio por tentativas de login
- Controle de sessões
- Logout automático por inatividade
- 2FA (preparado para futuro)

### Logs e Auditoria
- Registro de todos os acessos
- Rastreamento de mudanças em dados
- Histórico de ações por usuário
- Limpeza automática de logs antigos

### LGPD
- Termo de uso obrigatório
- Política de privacidade
- Controle de retenção de dados

## Integração Automática

O sistema se integra automaticamente com:
- **Todas as tabelas** - Auditoria de mudanças
- **Auth do Supabase** - Logs de login/logout
- **Colaboradores** - Incluído em backups
- **Documentos** - Incluído em backups
- **Folha** - Incluído em backups

## Função de Limpeza

A função `limpar_logs_antigos()` pode ser executada periodicamente para:
- Limpar logs de acesso com mais de 90 dias
- Limpar tentativas de login com mais de 30 dias
- Limpar sessões expiradas
- Limpar backups expirados

Execute manualmente:
```sql
SELECT limpar_logs_antigos();
```

Ou configure um cron job no Supabase.

## Verificação

Após executar, verifique:
```sql
SELECT COUNT(*) FROM configuracoes_backup; -- Deve retornar 1
SELECT COUNT(*) FROM politicas_seguranca; -- Deve retornar 1
```
