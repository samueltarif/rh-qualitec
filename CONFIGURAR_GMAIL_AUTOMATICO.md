# 📧 Configurar E-mails Automáticos com Gmail

## 🎯 Passo a Passo Completo

### PASSO 1: Preparar sua Conta Gmail

#### 1.1 Ativar Autenticação de Dois Fatores
1. Acesse: https://myaccount.google.com/
2. Clique em "Segurança" no menu lateral
3. Procure por "Autenticação de dois fatores"
4. Clique em "Ativar" e siga as instruções
5. Confirme com seu telefone

#### 1.2 Gerar Senha de Aplicativo
1. Após ativar 2FA, volte para "Segurança"
2. Procure por "Senhas de aplicativo" (aparece após ativar 2FA)
3. Selecione:
   - **Aplicativo:** Mail
   - **Dispositivo:** Windows/Mac/Linux
4. Clique em "Gerar"
5. **Copie a senha gerada** (16 caracteres com espaços)

⚠️ **IMPORTANTE:** Essa senha é diferente da sua senha normal do Gmail!

---

### PASSO 2: Configurar no Sistema RH

#### 2.1 Acesse as Configurações
1. Vá para: `/configuracoes/email`
2. Clique na aba **"Configurações SMTP"**

#### 2.2 Preencha os Dados do Gmail

```
Servidor SMTP:        smtp.gmail.com
Porta:                587
Usar SSL:             ❌ (desmarcar)
Usar TLS:             ✅ (marcar)
Usuário SMTP:         seu-email@gmail.com
Senha SMTP:           [senha de 16 caracteres gerada]
E-mail Remetente:     seu-email@gmail.com
Nome Remetente:       RH Empresa (ou seu nome)
E-mail Resposta:      seu-email@gmail.com (opcional)
Timeout:              30
```

#### 2.3 Teste a Conexão
1. Clique em **"Testar Conexão"**
2. Aguarde 2-3 segundos
3. Se aparecer ✅ "Conexão SMTP testada com sucesso!", está funcionando!
4. Clique em **"Salvar Configurações"**

---

### PASSO 3: Configurar Notificações Automáticas

#### 3.1 Ative os Eventos
1. Clique na aba **"Notificações"**
2. Marque os eventos que deseja:
   - ✅ Admissão de colaborador
   - ✅ Demissão de colaborador
   - ✅ Aniversário
   - ✅ Férias aprovadas
   - ✅ Férias vencendo
   - ✅ Documentos vencendo
   - ✅ Ponto inconsistente
   - ✅ Folha gerada

#### 3.2 Configure Alertas
- **Dias de alerta Férias:** 30 (dias antes do vencimento)
- **Dias de alerta Documentos:** 15 (dias antes do vencimento)
- **Dias de alerta Aniversário:** 3 (dias antes)

#### 3.3 Configure Horários
- **Início:** 08:00 (quando começar a enviar)
- **Fim:** 18:00 (quando parar de enviar)
- **Enviar finais de semana:** ❌ (desmarcar se não quiser)

#### 3.4 Rastreamento
- ✅ Rastrear abertura de e-mails
- ✅ Rastrear cliques em links

#### 3.5 Salve
Clique em **"Salvar Configurações"**

---

### PASSO 4: Personalizar Templates (Opcional)

#### 4.1 Editar Templates Padrão
1. Clique na aba **"Templates"**
2. Clique em **"Editar"** no template desejado
3. Personalize:
   - Assunto
   - Corpo HTML
   - Variáveis dinâmicas

#### 4.2 Exemplo de Personalização
**Template: Boas-vindas**

Assunto:
```
Bem-vindo(a) à {{nome_empresa}}!
```

Corpo HTML:
```html
<h2>Olá {{nome_colaborador}}!</h2>

<p>É com grande satisfação que damos as boas-vindas à equipe da 
<strong>{{nome_empresa}}</strong>.</p>

<p><strong>Data de admissão:</strong> {{data_admissao}}</p>

<p>Seu gestor entrará em contato em breve para orientações iniciais.</p>

<p>Bem-vindo(a)!</p>
```

#### 4.3 Criar Novo Template
1. Clique em **"Novo Template"**
2. Preencha:
   - **Código:** identificador único (ex: `bem_vindo_customizado`)
   - **Nome:** nome descritivo
   - **Categoria:** escolha a categoria
   - **Assunto:** assunto do e-mail
   - **Corpo HTML:** conteúdo em HTML
3. Adicione variáveis clicando em **"Adicionar Variável"**
4. Clique em **"Salvar"**

---

## 🔧 Implementação de Jobs Automáticos

Para que os e-mails sejam enviados automaticamente, você precisa criar jobs. Vou criar os arquivos necessários:

### Criar arquivo de jobs
