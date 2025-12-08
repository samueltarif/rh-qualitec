# Executar Migration 20 - Sistema de E-mail e Comunicação

## ⚠️ IMPORTANTE
Execute esta migration no Supabase SQL Editor para criar o sistema completo de e-mail e comunicação.

## 📋 Pré-requisitos
- Migration 19 (Relatórios) deve estar executada
- Tabela `empresa` deve existir
- Tabela `users` deve existir

## 🚀 Como Executar

### 1. Acesse o Supabase Dashboard
- Vá para: https://supabase.com/dashboard
- Selecione seu projeto
- Clique em "SQL Editor" no menu lateral

### 2. Execute a Migration
- Clique em "New Query"
- Copie TODO o conteúdo do arquivo `20_email_comunicacao.sql`
- Cole no editor
- Clique em "Run" ou pressione Ctrl+Enter

### 3. Verifique a Execução
Execute este comando para verificar se as tabelas foram criadas:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'configuracoes_smtp',
  'templates_email',
  'historico_emails',
  'fila_emails',
  'configuracoes_comunicacao'
)
ORDER BY table_name;
```

Deve retornar 5 tabelas.

### 4. Verifique os Templates Padrão
```sql
SELECT codigo, nome, categoria, sistema
FROM templates_email
WHERE sistema = true
ORDER BY codigo;
```

Deve retornar 5 templates do sistema:
- aniversario
- bem_vindo
- documento_vencendo
- ferias_aprovadas
- holerite_disponivel

## 📊 Estrutura Criada

### Tabelas
1. **configuracoes_smtp** - Configurações do servidor SMTP
2. **templates_email** - Templates reutilizáveis de e-mail
3. **historico_emails** - Histórico completo de envios
4. **fila_emails** - Fila para processamento assíncrono
5. **configuracoes_comunicacao** - Configurações de notificações

### Índices
- Índices para performance em todas as tabelas
- Índices compostos para consultas complexas

### Políticas RLS
- Políticas de segurança configuradas
- Acesso baseado em empresa_id
- Permissões por role (admin, rh)

## 🔧 Configuração Pós-Migration

### 1. Configure o SMTP
Acesse: `/configuracoes/email` → aba "Configurações SMTP"

Preencha:
- Servidor SMTP (ex: smtp.gmail.com)
- Porta (587 para TLS, 465 para SSL)
- Usuário e senha
- E-mail remetente
- Nome remetente

### 2. Teste a Conexão
Clique em "Testar Conexão" para validar as configurações.

### 3. Configure Notificações
Aba "Notificações":
- Ative os eventos que devem disparar e-mails
- Configure dias de antecedência para alertas
- Defina horários de envio

### 4. Personalize Templates
Aba "Templates":
- Edite os templates padrão (exceto os do sistema)
- Crie novos templates personalizados
- Use variáveis dinâmicas: {{nome_variavel}}

## 🔗 Integração Automática

O sistema está preparado para integração automática com:

### ✅ Colaboradores
- E-mail de boas-vindas na admissão
- Notificação de aniversário
- Alertas de documentos vencendo

### ✅ Férias
- Notificação de aprovação
- Alerta de férias vencendo
- Lembretes automáticos

### ✅ Documentos
- Alerta de vencimento próximo
- Notificação de documento vencido
- Solicitação de renovação

### ✅ Folha de Pagamento
- Holerite disponível
- Notificações de processamento
- Alertas de inconsistências

### ✅ Ponto
- Alertas de inconsistências
- Notificações de ajustes necessários

## 📧 Variáveis Disponíveis

### Variáveis Globais (disponíveis em todos os templates)
- `{{nome_empresa}}` - Nome da empresa
- `{{data_atual}}` - Data atual
- `{{ano_atual}}` - Ano atual

### Variáveis de Colaborador
- `{{nome_colaborador}}` - Nome completo
- `{{email_colaborador}}` - E-mail
- `{{cargo}}` - Cargo
- `{{departamento}}` - Departamento
- `{{data_admissao}}` - Data de admissão

### Variáveis de Férias
- `{{data_inicio}}` - Data de início
- `{{data_fim}}` - Data de fim
- `{{total_dias}}` - Total de dias
- `{{saldo_dias}}` - Saldo restante

### Variáveis de Documentos
- `{{tipo_documento}}` - Tipo do documento
- `{{numero_documento}}` - Número
- `{{data_vencimento}}` - Data de vencimento
- `{{dias_vencimento}}` - Dias até vencer

### Variáveis de Folha
- `{{mes_referencia}}` - Mês de referência
- `{{salario_bruto}}` - Salário bruto
- `{{salario_liquido}}` - Salário líquido
- `{{data_pagamento}}` - Data de pagamento

## 🎨 Exemplo de Template HTML

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .header { background: #4F46E5; color: white; padding: 20px; }
    .content { padding: 20px; }
    .footer { background: #F3F4F6; padding: 15px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>{{nome_empresa}}</h1>
  </div>
  <div class="content">
    <h2>Olá {{nome_colaborador}}!</h2>
    <p>Conteúdo do e-mail aqui...</p>
  </div>
  <div class="footer">
    <p>© {{ano_atual}} {{nome_empresa}}. Todos os direitos reservados.</p>
  </div>
</body>
</html>
```

## 🔒 Segurança

### Senha SMTP
- A senha é armazenada no banco
- **IMPORTANTE**: Implemente criptografia na aplicação
- Use variáveis de ambiente para produção

### Recomendações
1. Use senhas de aplicativo (não a senha principal)
2. Configure autenticação de dois fatores
3. Limite o acesso às configurações SMTP
4. Monitore logs de envio
5. Configure limites de envio

## 📊 Monitoramento

### Estatísticas Disponíveis
- Total de e-mails enviados
- Taxa de abertura
- Taxa de cliques
- E-mails com falha
- E-mails pendentes

### Logs
- Histórico completo de envios
- Rastreamento de abertura
- Rastreamento de cliques
- Registro de erros

## 🚨 Troubleshooting

### Erro: "relation already exists"
A tabela já foi criada. Verifique se a migration já foi executada.

### Erro: "permission denied"
Verifique se você tem permissões de admin no Supabase.

### Templates não aparecem
Verifique se a empresa_id está correta:
```sql
SELECT * FROM templates_email WHERE empresa_id = 'seu-empresa-id';
```

### SMTP não conecta
1. Verifique servidor e porta
2. Confirme usuário e senha
3. Verifique se SSL/TLS está correto
4. Teste com outro cliente de e-mail

## ✅ Checklist de Validação

- [ ] 5 tabelas criadas
- [ ] 5 templates padrão inseridos
- [ ] Índices criados
- [ ] Políticas RLS ativas
- [ ] Triggers funcionando
- [ ] SMTP configurado
- [ ] Conexão SMTP testada
- [ ] Notificações configuradas
- [ ] Templates personalizados (opcional)

## 📝 Próximos Passos

1. Configure o SMTP da sua empresa
2. Teste o envio de e-mails
3. Personalize os templates
4. Configure as notificações automáticas
5. Monitore os envios no histórico

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs do Supabase
2. Confirme as permissões RLS
3. Teste as queries manualmente
4. Verifique a documentação do Supabase

---

**Migration criada em:** 2024-12-04
**Versão:** 20
**Status:** ✅ Pronta para execução
