# PRD - Sistema de Gestão de Recursos Humanos Qualitec

## 📋 Informações do Documento

**Produto:** Sistema RH Qualitec  
**Versão:** 1.0.0  
**Data:** Fevereiro de 2026  
**Status:** Em Produção  
**Plataforma:** Web Application (Nuxt.js 4 + Supabase)  
**Deployment:** Vercel  

---

## 🎯 Visão Geral do Produto

### Propósito

Sistema web completo para gestão de recursos humanos da Qualitec Instrumentos, focado em automatizar processos de folha de pagamento, gestão de funcionários, geração de holerites e controle de benefícios.

### Problema que Resolve

- **Gestão Manual Ineficiente:** Eliminação de planilhas e processos manuais de RH
- **Falta de Transparência:** Funcionários têm acesso direto aos seus dados e holerites
- **Cálculos Complexos:** Automatização de cálculos de INSS, IRRF e benefícios
- **Comunicação Fragmentada:** Centralização de notificações e comunicados
- **Compliance Trabalhista:** Garantia de conformidade com legislação CLT

### Público-Alvo

**Primário:**
- Administradores de RH da Qualitec Instrumentos
- Gestores de departamento

**Secundário:**
- Funcionários CLT e PJ da empresa
- Contador externo (acesso a relatórios)

---

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

**Frontend:**
- Nuxt.js 4.2.2 (Vue 3.5.26)
- TailwindCSS 6.14.0
- TypeScript

**Backend:**
- Nuxt Server API (Nitro)
- Node.js 20.x
- Nodemailer 7.0.12 (envio de emails)
- PDFKit 0.17.2 (geração de PDFs)

**Banco de Dados:**
- Supabase (PostgreSQL)
- Row Level Security (RLS) habilitado
- Triggers e Functions automáticas

**Infraestrutura:**
- Vercel (hosting e serverless functions)
- Vercel Cron Jobs (tarefas agendadas)
- Gmail SMTP (envio de emails)

### Princípios Arquiteturais

1. **Segurança em Camadas:** Frontend → Backend API → Supabase
2. **Zero Trust:** Nenhuma credencial exposta no frontend
3. **API-First:** Toda lógica de negócio no backend
4. **Responsivo:** Mobile-first design
5. **SSR (Server-Side Rendering):** Performance e SEO otimizados

---

## 👥 Personas e Casos de Uso

### Persona 1: Silvana (Administradora de RH)

**Perfil:**
- 45 anos, responsável pelo RH da Qualitec
- Gerencia 50+ funcionários
- Precisa gerar folha de pagamento mensalmente
- Necessita controle total sobre dados e processos

**Necessidades:**
- Cadastrar e gerenciar funcionários
- Gerar holerites automaticamente
- Enviar holerites por email
- Monitorar atividades do sistema
- Gerenciar benefícios e jornadas

**Jornada:**
1. Login no sistema
2. Visualiza dashboard com métricas
3. Cadastra novos funcionários
4. Gera holerites do mês
5. Revisa e edita valores
6. Envia holerites por email
7. Monitora notificações de atividades

### Persona 2: João (Funcionário CLT)

**Perfil:**
- 32 anos, técnico de instrumentação
- Trabalha 42h45min semanais
- Precisa acessar seus holerites
- Quer atualizar dados pessoais

**Necessidades:**
- Visualizar holerites mensais
- Baixar comprovantes em PDF
- Atualizar dados pessoais
- Ver informações de benefícios
- Acessar de qualquer dispositivo

**Jornada:**
1. Recebe email com link de acesso
2. Faz login com CPF e senha
3. Visualiza dashboard pessoal
4. Acessa holerites disponíveis
5. Baixa PDF do holerite
6. Atualiza dados pessoais se necessário

---

## 🎨 Funcionalidades Principais

### 1. Gestão de Funcionários

**Descrição:** CRUD completo de funcionários com dados pessoais, profissionais e financeiros.

**Funcionalidades:**
- ✅ Cadastro com validação de CPF, PIS/PASEP, CNPJ (PJ)
- ✅ Upload de avatar personalizado
- ✅ Organização por empresa, departamento e cargo
- ✅ Configuração de jornada de trabalho
- ✅ Gestão de benefícios individuais
- ✅ Histórico de alterações
- ✅ Envio automático de credenciais de acesso

**Regras de Negócio:**
- CPF único no sistema
- Email único por funcionário
- Validação de PIS/PASEP (11 dígitos)
- Funcionários PJ não têm descontos de INSS/IRRF
- Apenas admin pode cadastrar/editar dados profissionais
- Funcionários podem editar apenas dados pessoais

**Campos Principais:**
- Dados Pessoais: Nome, CPF, RG, data nascimento, sexo, estado civil, endereço, telefone, email
- Dados Profissionais: Empresa, departamento, cargo, jornada, tipo contrato (CLT/PJ), data admissão
- Dados Financeiros: Salário base, forma pagamento, dados bancários, PIX
- Benefícios: Vale transporte, cesta básica, plano saúde, plano odontológico
- Dependentes: Nome, CPF, data nascimento, grau parentesco (para IRRF)
- Pensão Alimentícia: Valor fixo mensal (dedução IRRF)

### 2. Geração de Holerites

**Descrição:** Sistema automatizado de geração de contracheques com cálculos fiscais precisos.

**Tipos de Holerite:**
- **Folha Mensal:** Pagamento integral do mês (dia 5 do mês seguinte)
- **Adiantamento Salarial:** 40% do salário (dia 20 do mês vigente)

**Cálculos Automáticos:**

**INSS (Tabela Progressiva 2025):**
- Até R$ 1.518,00: 7,5%
- R$ 1.518,01 a R$ 2.793,88: 9%
- R$ 2.793,89 a R$ 4.190,83: 12%
- R$ 4.190,84 a R$ 8.157,41: 14%
- Teto máximo: R$ 908,85

**IRRF (Sistema Híbrido):**
- Isenção CLT: Base IRRF até R$ 5.000,00 → 0%
- Faixa de Transição: R$ 5.000,01 a R$ 7.350,00 → Redutor progressivo
- Tabela Normal: Acima de R$ 7.350,00 → Tabela oficial IR 2026
- Dedução por dependente: R$ 189,59
- Dedução pensão alimentícia: Valor integral

**Vale Transporte:**
- Tipos: Ônibus (R$ 5,30), Metrô (R$ 5,40), Integração
- Cálculo: Passagens/dia × Valor × Dias úteis (22)
- Desconto: Máximo 6% do salário base

**Funcionalidades:**
- ✅ Geração automática para todos funcionários ativos
- ✅ Edição individual de valores
- ✅ Itens personalizados (proventos/descontos extras)
- ✅ Visualização detalhada antes do envio
- ✅ Envio individual ou em lote por email
- ✅ Geração de PDF com layout profissional
- ✅ Histórico completo de holerites
- ✅ Filtros por período, empresa, status

**Regras de Negócio:**
- Não permite holerites duplicados (mesmo funcionário + período)
- Funcionários PJ: Sem descontos de INSS/IRRF
- Adiantamento: Sempre 40% do salário base
- Data disponibilização automática: Dia 5 (mensal) e dia 20 (adiantamento)
- Status: gerado → enviado → visualizado

### 3. Sistema de Notificações

**Descrição:** Sistema completo de notificações em tempo real para monitoramento de atividades.

**Tipos de Notificação:**

**Segurança:**
- Login de funcionários (info)
- Tentativas de login falhadas - 3+ tentativas (warning)
- Alteração de dados pessoais (warning)

**Operações Administrativas:**
- Novo funcionário cadastrado (success)
- Geração de holerites (success)
- Envio de email de holerite (success)

**Sistema:**
- Erros críticos (error)
- Aniversariantes do dia (info)

**Funcionalidades:**
- ✅ Badge com contador de não lidas
- ✅ Drawer lateral com lista completa
- ✅ Marcação individual como lida
- ✅ Filtros por tipo e importância
- ✅ Links diretos para ações relacionadas
- ✅ Ordenação por data (mais recentes primeiro)
- ✅ Retenção de 30 dias
- ✅ Paginação (50 por página)

**Campos:**
- Título, mensagem, tipo (info/success/warning/error)
- Origem, importante (boolean)
- Dados estruturados (JSON)
- URL de ação, data expiração
- Lida (boolean), data leitura

### 4. Jornadas de Trabalho

**Descrição:** Sistema flexível de configuração de cargas horárias personalizadas.

**Funcionalidades:**
- ✅ Criação de jornadas customizadas
- ✅ Configuração por dia da semana
- ✅ Horários de entrada, saída e intervalo
- ✅ Cálculo automático de horas (brutas, intervalo, líquidas)
- ✅ Totais semanais e mensais automáticos
- ✅ Jornada padrão para novos funcionários
- ✅ Visualização clara e organizada

**Jornada Padrão Implementada:**
- Segunda a Quinta: 07:30-17:30 (intervalo 12:00-13:15)
- Sexta: 07:30-16:30 (intervalo 12:00-13:15)
- Sábado e Domingo: Folga
- Total: 42h45min semanais / 185h15min mensais

**Regras de Negócio:**
- Entrada < Saída
- Intervalo dentro do horário de trabalho
- Apenas uma jornada padrão ativa
- Cálculo mensal: Semanal × 4,33

### 5. Dashboard e Métricas

**Descrição:** Painéis personalizados com métricas e indicadores relevantes.

**Dashboard Admin:**
- Total de funcionários ativos
- Total de empresas cadastradas
- Aniversariantes do mês (com tooltip interativo)
- Holerites gerados no mês
- Notificações não lidas
- Atividades recentes

**Dashboard Funcionário:**
- Dados pessoais resumidos
- Último holerite disponível
- Próximo pagamento
- Benefícios ativos
- Jornada de trabalho

**Funcionalidades:**
- ✅ Cards visuais com ícones
- ✅ Cores por categoria
- ✅ Links rápidos para ações
- ✅ Atualização em tempo real
- ✅ Responsivo mobile

### 6. Sistema de Aniversariantes

**Descrição:** Monitoramento e exibição de aniversariantes do mês.

**Funcionalidades:**
- ✅ Ícone de bolo no header (quando há aniversariantes)
- ✅ Badge com contador
- ✅ Tooltip com lista completa
- ✅ Indicador visual para aniversários de hoje
- ✅ Cálculo automático de idade
- ✅ Formatação de datas em português
- ✅ Cache inteligente (5 minutos)

**Exibição:**
- Desktop: Header do sidebar
- Mobile: Header mobile
- Dashboard: Card de estatísticas
- Tooltip: Avatar + nome + data + idade

### 7. Gestão de Empresas

**Descrição:** Cadastro e gerenciamento de empresas do grupo.

**Funcionalidades:**
- ✅ CRUD completo de empresas
- ✅ Consulta automática de CNPJ (ReceitaWS API)
- ✅ Preenchimento automático de dados
- ✅ Validação de CNPJ
- ✅ Múltiplas empresas por sistema

**Campos:**
- Razão social, nome fantasia, CNPJ
- Inscrição estadual, inscrição municipal
- Endereço completo
- Telefone, email, site
- Logo da empresa

### 8. Departamentos e Cargos

**Descrição:** Estrutura organizacional da empresa.

**Departamentos:**
- Nome, descrição
- Empresa vinculada
- Funcionários associados

**Cargos:**
- Nome, descrição
- Nível hierárquico
- Salário base sugerido
- Departamento vinculado

### 9. Sistema de Autenticação

**Descrição:** Controle de acesso seguro com diferentes níveis de permissão.

**Tipos de Usuário:**
- **Admin:** Acesso total ao sistema
- **Funcionário:** Acesso apenas aos próprios dados

**Funcionalidades:**
- ✅ Login com email e senha
- ✅ Senhas hasheadas (bcrypt)
- ✅ Sessão persistente
- ✅ Middleware de autenticação
- ✅ Middleware de autorização (admin)
- ✅ Logout seguro
- ✅ Validação de sessão em cada requisição

**Segurança:**
- Senhas nunca expostas em APIs
- Tokens de sessão seguros
- RLS (Row Level Security) no banco
- Validação em todas as rotas protegidas

### 10. Sistema de Email

**Descrição:** Envio automatizado de emails transacionais.

**Tipos de Email:**
- Credenciais de acesso (novo funcionário)
- Holerite disponível (com link)
- Notificações importantes
- Recuperação de senha (futuro)

**Configuração:**
- Gmail SMTP
- Templates HTML personalizados
- Anexos (PDFs)
- Rastreamento de envio

**Funcionalidades:**
- ✅ Envio individual ou em lote
- ✅ Templates responsivos
- ✅ Logo da empresa
- ✅ Links seguros
- ✅ Retry automático em caso de falha

---

## 🔐 Segurança e Compliance

### Segurança Implementada

**Arquitetura de Segurança:**
1. Frontend: Sem acesso direto ao banco
2. Backend API: Validação e autorização
3. Supabase: RLS e políticas de segurança

**Medidas de Proteção:**
- ✅ Senhas hasheadas com bcrypt
- ✅ Credenciais em variáveis de ambiente
- ✅ HTTPS obrigatório
- ✅ CORS configurado
- ✅ Validação de inputs
- ✅ Sanitização de dados
- ✅ Rate limiting (Vercel)
- ✅ Logs de auditoria

**Row Level Security (RLS):**
- Funcionários: Acesso apenas aos próprios dados
- Admins: Acesso total com validação
- Políticas por tabela
- Triggers de auditoria

### Compliance Trabalhista

**CLT - Consolidação das Leis do Trabalho:**
- ✅ Cálculo correto de INSS (tabela 2025)
- ✅ Cálculo correto de IRRF (tabela 2026)
- ✅ Vale transporte (máximo 6% desconto)
- ✅ Dependentes para IRRF
- ✅ Pensão alimentícia
- ✅ Jornadas de trabalho configuráveis
- ✅ Registro de admissão e demissão

**LGPD - Lei Geral de Proteção de Dados:**
- ✅ Dados pessoais protegidos
- ✅ Acesso controlado por permissão
- ✅ Logs de acesso e alterações
- ✅ Direito de acesso aos próprios dados
- ✅ Retenção de dados controlada

---

## 📊 Modelo de Dados

### Tabelas Principais

**funcionarios:**
- Dados pessoais, profissionais, financeiros
- Benefícios (JSONB)
- Dependentes (JSONB)
- Avatar, jornada, empresa, departamento, cargo
- Timestamps e auditoria

**empresas:**
- Razão social, CNPJ, endereço
- Contatos, logo
- Ativa/inativa

**departamentos:**
- Nome, descrição
- Empresa vinculada

**cargos:**
- Nome, nível, salário base
- Departamento vinculado

**jornadas_trabalho:**
- Nome, descrição
- Horas semanais/mensais
- Padrão, ativa

**jornada_horarios:**
- Dia da semana, horários
- Horas calculadas automaticamente

**holerites:**
- Funcionário, período, tipo
- Valores de proventos e descontos
- Totais calculados
- Status, datas

**itens_personalizados_holerite:**
- Funcionário, tipo (provento/desconto)
- Descrição, valor
- Recorrente ou único

**notificacoes:**
- Título, mensagem, tipo
- Origem, importante
- Dados (JSONB), ação URL
- Lida, data leitura

**contador_diario:**
- Data, contador
- Histórico de incrementos

### Relacionamentos

```
empresas (1) ─── (N) departamentos
departamentos (1) ─── (N) cargos
empresas (1) ─── (N) funcionarios
departamentos (1) ─── (N) funcionarios
cargos (1) ─── (N) funcionarios
jornadas_trabalho (1) ─── (N) funcionarios
funcionarios (1) ─── (N) holerites
funcionarios (1) ─── (N) itens_personalizados_holerite
funcionarios (1) ─── (N) notificacoes (via dados JSONB)
```

### Triggers e Functions

**Automações:**
- `calcular_horas_jornada()`: Calcula horas de jornada
- `atualizar_totais_jornada()`: Atualiza totais semanais/mensais
- `updated_at_trigger()`: Atualiza timestamp automaticamente
- `calcular_vale_transporte()`: Calcula valor do VT

**Views:**
- `vw_vale_transporte_funcionarios`: Dados de VT consolidados
- `vw_funcionarios_ativos`: Funcionários ativos com dados completos

---

## 🚀 Roadmap e Funcionalidades Futuras

### Versão 1.1 (Q2 2026)

**Melhorias de UX:**
- [ ] Modo escuro
- [ ] Personalização de tema
- [ ] Atalhos de teclado
- [ ] Tour guiado para novos usuários

**Relatórios:**
- [ ] Relatório de folha de pagamento
- [ ] Relatório de custos por departamento
- [ ] Relatório de benefícios
- [ ] Exportação para Excel/PDF

**Notificações:**
- [ ] Notificações por email (eventos críticos)
- [ ] Integração WhatsApp/Telegram
- [ ] Notificações push (PWA)
- [ ] Alertas personalizáveis

### Versão 1.2 (Q3 2026)

**Controle de Ponto:**
- [ ] Registro de ponto eletrônico
- [ ] Cálculo de horas extras
- [ ] Banco de horas
- [ ] Relatório de frequência
- [ ] Integração com biometria

**Férias:**
- [ ] Solicitação de férias
- [ ] Aprovação de férias
- [ ] Cálculo de férias
- [ ] Calendário de férias
- [ ] Abono pecuniário

**Documentos:**
- [ ] Upload de documentos
- [ ] Assinatura digital
- [ ] Contratos de trabalho
- [ ] Termos de confidencialidade
- [ ] Atestados médicos

### Versão 2.0 (Q4 2026)

**Recrutamento:**
- [ ] Portal de vagas
- [ ] Candidaturas online
- [ ] Triagem de currículos
- [ ] Agendamento de entrevistas
- [ ] Avaliação de candidatos

**Treinamentos:**
- [ ] Catálogo de treinamentos
- [ ] Inscrições
- [ ] Certificados
- [ ] Avaliações
- [ ] Histórico de capacitação

**Avaliação de Desempenho:**
- [ ] Ciclos de avaliação
- [ ] Autoavaliação
- [ ] Avaliação 360°
- [ ] Metas e objetivos
- [ ] PDI (Plano de Desenvolvimento Individual)

**Analytics:**
- [ ] Dashboard executivo
- [ ] Indicadores de RH (turnover, absenteísmo)
- [ ] Análise de custos
- [ ] Previsões e tendências
- [ ] Exportação de dados

---

## 📈 Métricas de Sucesso

### KPIs Principais

**Eficiência Operacional:**
- Tempo de geração de folha: < 5 minutos
- Tempo de cadastro de funcionário: < 10 minutos
- Taxa de erro em cálculos: 0%
- Uptime do sistema: > 99,5%

**Adoção:**
- Taxa de login de funcionários: > 80%
- Visualização de holerites: > 90%
- Atualização de dados pessoais: > 60%

**Satisfação:**
- NPS (Net Promoter Score): > 8
- Tickets de suporte: < 5/mês
- Tempo de resposta: < 24h

**Segurança:**
- Tentativas de acesso não autorizado: 0
- Vazamento de dados: 0
- Conformidade LGPD: 100%

---

## 🛠️ Manutenção e Suporte

### Atualizações de Tabelas Fiscais

**INSS:**
- Atualização anual (geralmente janeiro)
- Script SQL para nova tabela
- Validação de cálculos

**IRRF:**
- Atualização anual (geralmente janeiro)
- Ajuste de faixas e alíquotas
- Testes com cenários reais

**Vale Transporte:**
- Atualização conforme tarifas municipais
- Configuração por funcionário
- Validação de descontos

### Backup e Recuperação

**Backup Automático:**
- Supabase: Backup diário automático
- Retenção: 30 dias
- Point-in-time recovery

**Disaster Recovery:**
- RTO (Recovery Time Objective): 4 horas
- RPO (Recovery Point Objective): 24 horas
- Plano de contingência documentado

### Monitoramento

**Ferramentas:**
- Vercel Analytics
- Supabase Logs
- Error tracking (Sentry - futuro)

**Alertas:**
- Erros críticos
- Performance degradada
- Uso de recursos
- Tentativas de invasão

---

## 📞 Contatos e Responsabilidades

### Equipe do Projeto

**Product Owner:**
- Silvana (Administradora RH Qualitec)
- Decisões de produto e priorização

**Desenvolvimento:**
- Sistema desenvolvido com IA (Kiro)
- Manutenção e evolução contínua

**Infraestrutura:**
- Vercel (hosting)
- Supabase (banco de dados)
- Gmail (emails)

### Suporte

**Nível 1 (Usuários):**
- Email: rh@qualitec.com.br
- Horário: Segunda a sexta, 8h-18h
- SLA: 24 horas

**Nível 2 (Técnico):**
- Desenvolvimento e manutenção
- Atualizações e melhorias
- Resolução de bugs críticos

---

## 📝 Glossário

**CLT:** Consolidação das Leis do Trabalho  
**PJ:** Pessoa Jurídica (contrato de prestação de serviços)  
**INSS:** Instituto Nacional do Seguro Social  
**IRRF:** Imposto de Renda Retido na Fonte  
**RLS:** Row Level Security (segurança em nível de linha)  
**CRUD:** Create, Read, Update, Delete  
**SSR:** Server-Side Rendering  
**API:** Application Programming Interface  
**JWT:** JSON Web Token  
**LGPD:** Lei Geral de Proteção de Dados  
**NPS:** Net Promoter Score  
**KPI:** Key Performance Indicator  
**RTO:** Recovery Time Objective  
**RPO:** Recovery Point Objective  
**VT:** Vale Transporte  
**PDI:** Plano de Desenvolvimento Individual  

---

## 📚 Referências

**Legislação:**
- CLT - Decreto-Lei nº 5.452/1943
- LGPD - Lei nº 13.709/2018
- Tabela INSS 2025
- Tabela IRRF 2026

**Documentação Técnica:**
- Nuxt.js: https://nuxt.com
- Supabase: https://supabase.com
- Vercel: https://vercel.com
- TailwindCSS: https://tailwindcss.com

**APIs Externas:**
- ReceitaWS (consulta CNPJ): https://receitaws.com.br

---

## ✅ Status de Implementação

### Funcionalidades Implementadas (100%)

- ✅ Autenticação e autorização
- ✅ Gestão de funcionários (CRUD completo)
- ✅ Gestão de empresas
- ✅ Gestão de departamentos e cargos
- ✅ Jornadas de trabalho personalizadas
- ✅ Geração automática de holerites
- ✅ Cálculos de INSS e IRRF
- ✅ Vale transporte detalhado
- ✅ Sistema de notificações completo
- ✅ Dashboard admin e funcionário
- ✅ Sistema de aniversariantes
- ✅ Envio de emails
- ✅ Geração de PDFs
- ✅ Itens personalizados em holerites
- ✅ Contador diário (cron job)
- ✅ Segurança (RLS, bcrypt, validações)
- ✅ Deploy em produção (Vercel)

### Em Desenvolvimento (0%)

Nenhuma funcionalidade em desenvolvimento no momento.

### Planejadas (Roadmap)

Ver seção "Roadmap e Funcionalidades Futuras" acima.

---

**Documento mantido por:** Sistema RH Qualitec  
**Última atualização:** Fevereiro de 2026  
**Versão do documento:** 1.0  
**Status:** Aprovado e em Produção
