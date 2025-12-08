# 📧 Guia de Configuração de E-mail - Passo a Passo

## 🎯 O que você precisa configurar

O sistema de e-mail tem 4 áreas principais:

### 1️⃣ **Configurações SMTP** (Obrigatório)
É aqui que você configura o servidor de e-mail que vai enviar as mensagens.

### 2️⃣ **Templates** 
Modelos de e-mail prontos para usar (boas-vindas, aniversário, etc.)

### 3️⃣ **Notificações**
Define quando o sistema envia e-mails automaticamente

### 4️⃣ **Histórico**
Veja todos os e-mails enviados

---

## 📝 PASSO 1: Configurar SMTP (Gmail)

### O que você precisa ter:
- ✅ Uma conta Gmail (ex: qualitecinstrumentosdemedicao@gmail.com)
- ✅ Uma senha de app do Gmail (não é a senha normal!)

### Como preencher:

```
Servidor SMTP: smtp.gmail.com
Porta: 587
Usuário SMTP: qualitecinstrumentosdemedicao@gmail.com
Senha SMTP: [sua senha de app - 16 caracteres]
E-mail Remetente: qualitecinstrumentosdemedicao@gmail.com
Nome Remetente: RH Qualitec
E-mail Resposta: vendas2@qualitec.ind.br (opcional)
Timeout: 30

☑️ Usar TLS (deixe marcado)
☐ Usar SSL (deixe desmarcado)
☑️ Ativo (deixe marcado)
```

### 🔑 Como conseguir a Senha de App do Gmail:

1. Acesse: https://myaccount.google.com/security
2. Ative a "Verificação em duas etapas" (se ainda não tiver)
3. Procure por "Senhas de app"
4. Crie uma nova senha de app
5. Escolha "Outro (nome personalizado)" → digite "Sistema RH"
6. Copie a senha de 16 caracteres gerada
7. Cole no campo "Senha SMTP"

### ✅ Testar a configuração:

Depois de preencher, clique em **"Testar Conexão"**. Se aparecer "Conexão bem-sucedida", está tudo certo!

---

## 📋 PASSO 2: Criar Templates de E-mail

Templates são modelos prontos que o sistema usa para enviar e-mails.

### Exemplo: Template de Boas-vindas

```
Código: bem_vindo
Nome: Boas-vindas
Descrição: E-mail enviado quando um novo colaborador é admitido
Categoria: RH
Prioridade: Normal

Assunto: Bem-vindo à {{nome_empresa}}!

Corpo HTML:
<h2>Olá {{nome_colaborador}}!</h2>
<p>Seja bem-vindo(a) à equipe da {{nome_empresa}}!</p>
<p>Estamos felizes em tê-lo(a) conosco.</p>
<p>Seu primeiro dia será em {{data_admissao}}.</p>
<br>
<p>Atenciosamente,<br>Equipe RH</p>

Corpo Texto (opcional):
Olá {{nome_colaborador}}!
Seja bem-vindo(a) à equipe da {{nome_empresa}}!
```

### 🔤 Variáveis Disponíveis

As variáveis são substituídas automaticamente pelo sistema:

- `{{nome_colaborador}}` → Nome do funcionário
- `{{nome_empresa}}` → Nome da empresa
- `{{data_admissao}}` → Data de admissão
- `{{cargo}}` → Cargo do funcionário
- `{{departamento}}` → Departamento

**Dica:** Clique em "Adicionar Variável" para documentar quais variáveis você está usando.

---

## 🔔 PASSO 3: Configurar Notificações Automáticas

Aqui você define quando o sistema envia e-mails sozinho.

### Eventos que disparam e-mails:

```
☑️ Admissão de colaborador → Envia boas-vindas
☑️ Demissão de colaborador → Envia despedida
☑️ Aniversário de colaborador → Envia parabéns
☑️ Férias aprovadas → Confirma aprovação
☑️ Férias vencendo → Alerta 30 dias antes
☑️ Documentos vencendo → Alerta 15 dias antes
☑️ Ponto inconsistente → Alerta sobre problemas
☑️ Folha de pagamento gerada → Notifica disponibilidade
```

### Configurações de Alerta:

```
Alerta Férias: 30 dias (avisa 30 dias antes de vencer)
Alerta Documentos: 15 dias (avisa 15 dias antes de vencer)
Alerta Aniversário: 3 dias (avisa 3 dias antes)
```

### Horários de Envio:

```
Início: 08:00 (começa a enviar às 8h da manhã)
Fim: 18:00 (para de enviar às 6h da tarde)
☐ Enviar nos finais de semana (deixe desmarcado)
```

### Rastreamento:

```
☑️ Rastrear abertura de e-mails (saber se foi lido)
☑️ Rastrear cliques em links (saber se clicou)
```

---

## 📊 PASSO 4: Entender o Histórico

Na aba "Histórico" você vê:

- **Data**: Quando foi enviado
- **Destinatário**: Para quem foi enviado
- **Assunto**: Título do e-mail
- **Template**: Qual modelo foi usado
- **Status**: 
  - 🟢 Enviado (sucesso)
  - 🟡 Pendente (na fila)
  - 🔴 Falha (erro)
- **Aberto**: 📧 (não aberto) ou 📬 (aberto)

---

## 🎨 Como Funciona um Template

### Estrutura:

1. **Código**: Identificador único (sem espaços)
   - Exemplo: `bem_vindo`, `aniversario`, `ferias_aprovadas`

2. **Nome**: Nome amigável
   - Exemplo: "Boas-vindas", "Aniversário", "Férias Aprovadas"

3. **Categoria**: Organiza os templates
   - Sistema, RH, Folha, Férias, Ponto, Documentos

4. **Prioridade**: Define a urgência
   - Baixa, Normal, Alta, Urgente

5. **Assunto**: Título do e-mail
   - Use variáveis: `Bem-vindo {{nome_colaborador}}!`

6. **Corpo HTML**: Conteúdo formatado
   - Use HTML: `<h2>`, `<p>`, `<strong>`, etc.
   - Use variáveis: `{{nome_colaborador}}`

7. **Corpo Texto**: Versão sem formatação (opcional)
   - Para clientes de e-mail que não suportam HTML

---

## 🚀 Fluxo Completo

### Quando um colaborador é admitido:

1. ✅ Você cadastra o colaborador no sistema
2. 🔔 Sistema detecta: "Nova admissão!"
3. 📋 Sistema busca o template "bem_vindo"
4. 🔄 Sistema substitui as variáveis:
   - `{{nome_colaborador}}` → "João Silva"
   - `{{nome_empresa}}` → "Qualitec"
   - `{{data_admissao}}` → "15/12/2025"
5. 📧 Sistema envia o e-mail
6. 📊 Registra no histórico

---

## ⚙️ Configuração Recomendada para Qualitec

### SMTP:
```
Servidor: smtp.gmail.com
Porta: 587
Usuário: qualitecinstrumentosdemedicao@gmail.com
Senha: [senha de app do Gmail]
Remetente: qualitecinstrumentosdemedicao@gmail.com
Nome: RH Qualitec
Resposta: vendas2@qualitec.ind.br
TLS: ✅ Ativo
```

### Templates Essenciais:
1. ✅ Boas-vindas (admissão)
2. ✅ Aniversário
3. ✅ Férias aprovadas
4. ✅ Alerta de documentos vencendo
5. ✅ Holerite disponível

### Notificações:
- ✅ Todas ativas
- ⏰ Horário: 08:00 - 18:00
- 📅 Não enviar finais de semana
- 📊 Rastrear abertura e cliques

---

## 🆘 Problemas Comuns

### ❌ "Erro ao testar conexão"
**Solução:** 
- Verifique se a senha de app está correta (16 caracteres)
- Confirme que TLS está marcado e SSL desmarcado
- Verifique se a verificação em duas etapas está ativa no Gmail

### ❌ "E-mail não está sendo enviado"
**Solução:**
- Verifique se SMTP está marcado como "Ativo"
- Confirme que o template existe e está ativo
- Verifique se a notificação está habilitada
- Veja o histórico para detalhes do erro

### ❌ "Variável não está sendo substituída"
**Solução:**
- Use exatamente `{{nome_variavel}}` (com chaves duplas)
- Verifique se a variável está documentada no template
- Confirme que o dado existe no sistema

---

## 📞 Suporte

Se precisar de ajuda:
1. Verifique o histórico de e-mails
2. Teste a conexão SMTP
3. Revise as configurações de notificações
4. Entre em contato com o suporte técnico

---

**Pronto! Agora você sabe como configurar todo o sistema de e-mail! 🎉**
