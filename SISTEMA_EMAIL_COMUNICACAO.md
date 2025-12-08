# 📧 Sistema de E-mail e Comunicação - Documentação Completa

## 📋 Visão Geral

Sistema completo de e-mail e comunicação para RH, com configuração SMTP, templates personalizáveis, notificações automáticas e histórico de envios.

## 🎯 Funcionalidades Principais

### 1. Configurações SMTP
- Configuração completa do servidor SMTP
- Suporte para SSL/TLS
- Teste de conexão integrado
- Configuração de limites de envio
- Múltiplas tentativas em caso de falha

### 2. Templates de E-mail
- Templates reutilizáveis e personalizáveis
- Variáveis dinâmicas
- Suporte para HTML e texto puro
- Templates do sistema (não editáveis)
- Templates customizados
- Categorização por módulo

### 3. Notificações Automáticas
- Configuração de eventos que disparam e-mails
- Alertas com antecedência configurável
- Horários de envio personalizáveis
- Controle de envio em finais de semana

### 4. Histórico e Rastreamento
- Histórico completo de envios
- Rastreamento de abertura
- Rastreamento de cliques
- Estatísticas detalhadas
- Logs de erro

### 5. Fila de E-mails
- Processamento assíncrono
- Sistema de prioridades
- Agendamento de envios
- Retry automático em falhas

## 🗄️ Estrutura do Banco de Dados

### Tabela: configuracoes_smtp
Armazena as configurações do servidor SMTP.

```sql
- id (UUID)
- empresa_id (UUID)
- servidor_smtp (VARCHAR)
- porta (INTEGER)
- usa_ssl (BOOLEAN)
- usa_tls (BOOLEAN)
- usuario_smtp (VARCHAR)
- senha_smtp (TEXT) -- Criptografada
- email_remetente (VARCHAR)
- nome_remetente (VARCHAR)
- email_resposta (VARCHAR)
- timeout (INTEGER)
- max_tentativas (INTEGER)
- limite_diario (INTEGER)
- limite_por_hora (INTEGER)
- ativo (BOOLEAN)
- testado (BOOLEAN)
- ultima_verificacao (TIMESTAMP)
```

### Tabela: templates_email
Templates reutilizáveis de e-mail.

```sql
- id (UUID)
- empresa_id (UUID)
- codigo (VARCHAR) -- Identificador único
- nome (VARCHAR)
- descricao (TEXT)
- categoria (VARCHAR) -- 'sistema', 'rh', 'folha', 'ferias', 'ponto', 'documentos'
- assunto (VARCHAR)
- corpo_html (TEXT)
- corpo_texto (TEXT)
- variaveis_disponiveis (JSONB)
- anexos_padrao (JSONB)
- prioridade (VARCHAR) -- 'baixa', 'normal', 'alta', 'urgente'
- requer_confirmacao_leitura (BOOLEAN)
- copiar_para (JSONB) -- CC
- copiar_oculto_para (JSONB) -- BCC
- ativo (BOOLEAN)
- sistema (BOOLEAN) -- Templates do sistema não podem ser excluídos
- total_enviados (INTEGER)
- total_abertos (INTEGER)
- total_clicados (INTEGER)
```

### Tabela: historico_emails
Histórico completo de todos os e-mails enviados.

```sql
- id (UUID)
- empresa_id (UUID)
- template_id (UUID)
- destinatario_email (VARCHAR)
- destinatario_nome (VARCHAR)
- destinatario_tipo (VARCHAR) -- 'colaborador', 'usuario', 'externo'
- destinatario_id (UUID)
- assunto (VARCHAR)
- corpo_html (TEXT)
- corpo_texto (TEXT)
- cc (JSONB)
- bcc (JSONB)
- anexos (JSONB)
- status (VARCHAR) -- 'pendente', 'enviando', 'enviado', 'falha', 'bounce'
- tentativas (INTEGER)
- erro_mensagem (TEXT)
- enviado_em (TIMESTAMP)
- aberto_em (TIMESTAMP)
- clicado_em (TIMESTAMP)
- bounce_em (TIMESTAMP)
- bounce_tipo (VARCHAR) -- 'hard', 'soft', 'complaint'
- prioridade (VARCHAR)
- agendado_para (TIMESTAMP)
- contexto (VARCHAR) -- 'admissao', 'demissao', 'ferias', etc.
- contexto_id (UUID)
- contexto_dados (JSONB)
```

### Tabela: fila_emails
Fila para processamento assíncrono de e-mails.

```sql
- id (UUID)
- empresa_id (UUID)
- template_id (UUID)
- destinatario_email (VARCHAR)
- destinatario_nome (VARCHAR)
- destinatario_id (UUID)
- assunto (VARCHAR)
- corpo_html (TEXT)
- corpo_texto (TEXT)
- variaveis (JSONB)
- anexos (JSONB)
- prioridade (INTEGER) -- 1 (mais alta) a 10 (mais baixa)
- agendado_para (TIMESTAMP)
- tentativas (INTEGER)
- max_tentativas (INTEGER)
- status (VARCHAR)
- processando_desde (TIMESTAMP)
- erro_mensagem (TEXT)
- contexto (VARCHAR)
- contexto_id (UUID)
```

### Tabela: configuracoes_comunicacao
Configurações gerais de comunicação e notificações.

```sql
- id (UUID)
- empresa_id (UUID)
- notificar_admissao (BOOLEAN)
- notificar_demissao (BOOLEAN)
- notificar_aniversario (BOOLEAN)
- notificar_ferias_aprovadas (BOOLEAN)
- notificar_ferias_vencendo (BOOLEAN)
- notificar_documentos_vencendo (BOOLEAN)
- notificar_ponto_inconsistente (BOOLEAN)
- notificar_folha_gerada (BOOLEAN)
- dias_alerta_ferias (INTEGER)
- dias_alerta_documentos (INTEGER)
- dias_alerta_aniversario (INTEGER)
- horario_envio_inicio (TIME)
- horario_envio_fim (TIME)
- enviar_finais_semana (BOOLEAN)
- assinatura_html (TEXT)
- assinatura_texto (TEXT)
- rodape_html (TEXT)
- rodape_texto (TEXT)
- rastrear_abertura (BOOLEAN)
- rastrear_cliques (BOOLEAN)
- emails_bloqueados (JSONB)
- dominios_bloqueados (JSONB)
```

## 🔌 API Endpoints

### SMTP
- `GET /api/email/smtp` - Buscar configurações SMTP
- `PUT /api/email/smtp` - Atualizar configurações SMTP
- `POST /api/email/smtp-test` - Testar conexão SMTP

### Templates
- `GET /api/email/templates` - Listar templates
- `POST /api/email/templates` - Criar template
- `PUT /api/email/templates/[id]` - Atualizar template
- `DELETE /api/email/templates/[id]` - Excluir template

### Comunicação
- `GET /api/email/comunicacao` - Buscar configurações
- `PUT /api/email/comunicacao` - Atualizar configurações

### Histórico e Estatísticas
- `GET /api/email/historico` - Listar histórico de envios
- `GET /api/email/stats` - Estatísticas de envio

## 🎨 Interface do Usuário

### Página: /configuracoes/email

#### Aba 1: Configurações SMTP
- Formulário completo de configuração SMTP
- Campos: servidor, porta, usuário, senha, remetente
- Opções: SSL, TLS, timeout, limites
- Botão de teste de conexão
- Indicador de status (testado/não testado)

#### Aba 2: Templates
- Lista de todos os templates
- Filtro por categoria
- Indicadores: sistema, ativo/inativo
- Estatísticas: enviados, taxa de abertura
- Botões: criar, editar, excluir
- Modal de edição com:
  - Código e nome
  - Categoria e prioridade
  - Assunto e corpo (HTML + texto)
  - Gerenciador de variáveis
  - Opções avançadas

#### Aba 3: Notificações
- Checkboxes para eventos automáticos:
  - Admissão
  - Demissão
  - Aniversário
  - Férias (aprovadas e vencendo)
  - Documentos vencendo
  - Ponto inconsistente
  - Folha gerada
- Configuração de dias de antecedência
- Horários de envio (início e fim)
- Opção de envio em finais de semana
- Rastreamento (abertura e cliques)

#### Aba 4: Histórico
- Tabela com todos os envios
- Filtros: status, contexto, período
- Colunas: data, destinatário, assunto, template, status, aberto
- Indicadores visuais de status
- Paginação

#### Estatísticas (topo da página)
- Total enviados
- Pendentes na fila
- Falhas
- Taxa de abertura
- Enviados hoje
- Total de templates

## 🔗 Integração Automática

### Com Colaboradores

#### Na Admissão
```typescript
// Quando um colaborador é criado
if (configuracoes.notificar_admissao) {
  await enviarEmail({
    template: 'bem_vindo',
    destinatario: colaborador.email,
    variaveis: {
      nome_colaborador: colaborador.nome,
      nome_empresa: empresa.nome,
      data_admissao: colaborador.data_admissao
    },
    contexto: 'admissao',
    contexto_id: colaborador.id
  })
}
```

#### No Aniversário
```typescript
// Job diário que verifica aniversários
const diasAntes = configuracoes.dias_alerta_aniversario
const colaboradores = await buscarAniversariantes(diasAntes)

for (const colaborador of colaboradores) {
  await enviarEmail({
    template: 'aniversario',
    destinatario: colaborador.email,
    variaveis: {
      nome_colaborador: colaborador.nome,
      nome_empresa: empresa.nome
    },
    contexto: 'aniversario',
    contexto_id: colaborador.id
  })
}
```

### Com Férias

#### Férias Aprovadas
```typescript
// Quando férias são aprovadas
if (configuracoes.notificar_ferias_aprovadas) {
  await enviarEmail({
    template: 'ferias_aprovadas',
    destinatario: colaborador.email,
    variaveis: {
      nome_colaborador: colaborador.nome,
      data_inicio: ferias.data_inicio,
      data_fim: ferias.data_fim,
      total_dias: ferias.total_dias
    },
    contexto: 'ferias',
    contexto_id: ferias.id
  })
}
```

#### Férias Vencendo
```typescript
// Job diário que verifica férias vencendo
const diasAntes = configuracoes.dias_alerta_ferias
const feriasVencendo = await buscarFeriasVencendo(diasAntes)

for (const item of feriasVencendo) {
  await enviarEmail({
    template: 'ferias_vencendo',
    destinatario: item.colaborador.email,
    variaveis: {
      nome_colaborador: item.colaborador.nome,
      dias_vencimento: item.dias_restantes,
      saldo_dias: item.saldo
    },
    contexto: 'ferias_alerta',
    contexto_id: item.id
  })
}
```

### Com Documentos

#### Documentos Vencendo
```typescript
// Job diário que verifica documentos vencendo
const diasAntes = configuracoes.dias_alerta_documentos
const documentosVencendo = await buscarDocumentosVencendo(diasAntes)

for (const doc of documentosVencendo) {
  await enviarEmail({
    template: 'documento_vencendo',
    destinatario: doc.colaborador.email,
    variaveis: {
      nome_colaborador: doc.colaborador.nome,
      tipo_documento: doc.tipo.nome,
      data_vencimento: doc.data_vencimento,
      dias_vencimento: doc.dias_restantes
    },
    contexto: 'documento_alerta',
    contexto_id: doc.id
  })
}
```

### Com Folha de Pagamento

#### Holerite Disponível
```typescript
// Quando a folha é processada
if (configuracoes.notificar_folha_gerada) {
  for (const holerite of holerites) {
    await enviarEmail({
      template: 'holerite_disponivel',
      destinatario: holerite.colaborador.email,
      variaveis: {
        nome_colaborador: holerite.colaborador.nome,
        mes_referencia: holerite.mes_referencia,
        salario_liquido: formatarMoeda(holerite.salario_liquido)
      },
      contexto: 'folha',
      contexto_id: holerite.id,
      anexos: [holerite.pdf_url]
    })
  }
}
```

### Com Ponto

#### Inconsistências
```typescript
// Quando inconsistências são detectadas
if (configuracoes.notificar_ponto_inconsistente) {
  await enviarEmail({
    template: 'ponto_inconsistente',
    destinatario: colaborador.email,
    variaveis: {
      nome_colaborador: colaborador.nome,
      data: inconsistencia.data,
      tipo: inconsistencia.tipo,
      descricao: inconsistencia.descricao
    },
    contexto: 'ponto',
    contexto_id: inconsistencia.id
  })
}
```

## 📝 Templates Padrão

### 1. bem_vindo
**Categoria:** RH  
**Quando:** Admissão de colaborador  
**Variáveis:**
- `{{nome_colaborador}}`
- `{{nome_empresa}}`
- `{{data_admissao}}`

### 2. aniversario
**Categoria:** RH  
**Quando:** Aniversário do colaborador  
**Variáveis:**
- `{{nome_colaborador}}`
- `{{nome_empresa}}`

### 3. ferias_aprovadas
**Categoria:** Férias  
**Quando:** Aprovação de férias  
**Variáveis:**
- `{{nome_colaborador}}`
- `{{data_inicio}}`
- `{{data_fim}}`
- `{{total_dias}}`

### 4. documento_vencendo
**Categoria:** Documentos  
**Quando:** Documento próximo ao vencimento  
**Variáveis:**
- `{{nome_colaborador}}`
- `{{tipo_documento}}`
- `{{data_vencimento}}`

### 5. holerite_disponivel
**Categoria:** Folha  
**Quando:** Folha processada  
**Variáveis:**
- `{{nome_colaborador}}`
- `{{mes_referencia}}`

## 🎯 Sistema de Variáveis

### Como Usar
No template, use a sintaxe: `{{nome_variavel}}`

Exemplo:
```html
<h2>Olá {{nome_colaborador}}!</h2>
<p>Bem-vindo à {{nome_empresa}}.</p>
<p>Seu primeiro dia será em {{data_admissao}}.</p>
```

### Processamento
```typescript
function processarTemplate(template: string, variaveis: Record<string, any>) {
  let resultado = template
  for (const [chave, valor] of Object.entries(variaveis)) {
    const regex = new RegExp(`{{${chave}}}`, 'g')
    resultado = resultado.replace(regex, String(valor))
  }
  return resultado
}
```

### Variáveis Globais Automáticas
Sempre disponíveis em todos os templates:
- `{{nome_empresa}}` - Nome da empresa
- `{{data_atual}}` - Data atual formatada
- `{{ano_atual}}` - Ano atual
- `{{mes_atual}}` - Mês atual
- `{{dia_atual}}` - Dia atual

## 🔒 Segurança

### Criptografia de Senha SMTP
**IMPORTANTE:** A senha SMTP deve ser criptografada antes de salvar.

```typescript
// Exemplo de implementação (use uma biblioteca adequada)
import { encrypt, decrypt } from 'crypto-js'

// Ao salvar
const senhaCriptografada = encrypt(senha, process.env.ENCRYPTION_KEY)

// Ao usar
const senhaDescriptografada = decrypt(senhaCriptografada, process.env.ENCRYPTION_KEY)
```

### Políticas RLS
- Usuários só veem dados da sua empresa
- Apenas admins podem configurar SMTP
- Admins e RH podem gerenciar templates
- Histórico acessível por todos da empresa

### Validações
- E-mails validados antes do envio
- Limites de envio respeitados
- Bloqueio de domínios/e-mails
- Sanitização de HTML

## 📊 Monitoramento e Logs

### Estatísticas Disponíveis
```typescript
interface EmailStats {
  totalEnviados: number
  totalPendentes: number
  totalFalhas: number
  taxaAbertura: string // Percentual
  enviadosHoje: number
  totalTemplates: number
}
```

### Logs de Erro
Todos os erros são registrados em `historico_emails`:
- Mensagem de erro
- Número de tentativas
- Timestamp
- Contexto completo

### Rastreamento
- **Abertura:** Pixel invisível no HTML
- **Cliques:** Links rastreados
- **Bounce:** Detecção de e-mails inválidos

## 🚀 Processamento Assíncrono

### Fila de E-mails
E-mails são adicionados à fila e processados em background:

```typescript
// Adicionar à fila
await adicionarNaFila({
  template_id: template.id,
  destinatario_email: email,
  variaveis: {...},
  prioridade: 5,
  agendado_para: new Date()
})

// Processar fila (job em background)
async function processarFila() {
  const emails = await buscarEmailsPendentes()
  
  for (const email of emails) {
    try {
      await enviarEmailSMTP(email)
      await marcarComoEnviado(email.id)
    } catch (error) {
      await registrarFalha(email.id, error)
      if (email.tentativas < email.max_tentativas) {
        await reagendar(email.id)
      }
    }
  }
}
```

### Sistema de Prioridades
1. **Urgente** - Processado imediatamente
2-4. **Alta** - Processado em até 5 minutos
5-7. **Normal** - Processado em até 15 minutos
8-10. **Baixa** - Processado em até 1 hora

## 🎨 Personalização

### Assinatura Padrão
Configure em "Notificações":
```html
<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ccc;">
  <p><strong>Equipe de RH</strong><br>
  {{nome_empresa}}<br>
  rh@empresa.com<br>
  (11) 1234-5678</p>
</div>
```

### Rodapé Padrão
```html
<div style="text-align: center; color: #666; font-size: 12px;">
  <p>© {{ano_atual}} {{nome_empresa}}. Todos os direitos reservados.</p>
  <p>Este é um e-mail automático, por favor não responda.</p>
</div>
```

## 🔧 Configuração Recomendada

### Gmail
```
Servidor: smtp.gmail.com
Porta: 587
SSL: Não
TLS: Sim
Usuário: seu-email@gmail.com
Senha: Senha de aplicativo (não a senha normal)
```

### Outlook/Office 365
```
Servidor: smtp.office365.com
Porta: 587
SSL: Não
TLS: Sim
Usuário: seu-email@empresa.com
Senha: Sua senha
```

### SendGrid
```
Servidor: smtp.sendgrid.net
Porta: 587
SSL: Não
TLS: Sim
Usuário: apikey
Senha: Sua API Key
```

## ✅ Checklist de Implementação

### Configuração Inicial
- [ ] Executar migration 20
- [ ] Configurar SMTP
- [ ] Testar conexão
- [ ] Configurar notificações
- [ ] Personalizar templates

### Integração
- [ ] Integrar com admissão de colaboradores
- [ ] Integrar com sistema de férias
- [ ] Integrar com documentos
- [ ] Integrar com folha de pagamento
- [ ] Integrar com ponto

### Jobs Automáticos
- [ ] Job de aniversários (diário)
- [ ] Job de férias vencendo (diário)
- [ ] Job de documentos vencendo (diário)
- [ ] Job de processamento de fila (contínuo)

### Monitoramento
- [ ] Configurar alertas de falha
- [ ] Monitorar taxa de abertura
- [ ] Revisar logs regularmente
- [ ] Ajustar limites conforme necessário

## 📚 Recursos Adicionais

### Bibliotecas Recomendadas
- **nodemailer** - Envio de e-mails
- **handlebars** - Templates avançados
- **mjml** - E-mails responsivos
- **juice** - Inline CSS

### Boas Práticas
1. Sempre teste antes de enviar em produção
2. Use templates responsivos
3. Inclua versão texto puro
4. Respeite limites de envio
5. Monitore bounces e spam
6. Mantenha lista de bloqueio atualizada
7. Use senhas de aplicativo
8. Implemente retry com backoff
9. Registre todos os envios
10. Revise templates regularmente

---

**Sistema criado em:** 2024-12-04  
**Versão:** 1.0  
**Status:** ✅ Completo e funcional
