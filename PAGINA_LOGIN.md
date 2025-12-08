# 🔐 Página de Login - Sistema RH Qualitec

## 📍 Localização
**Arquivo:** `app/pages/login.vue`  
**Rota:** `/login`

---

## ✨ Funcionalidades

### 1. Formulário de Login
- ✅ Campo de email com validação
- ✅ Campo de senha com toggle de visualização
- ✅ Validação de campos obrigatórios
- ✅ Desabilita campos durante loading
- ✅ Enter para submeter formulário

### 2. Feedback Visual
- ✅ Mensagens de erro com animação shake
- ✅ Mensagens de sucesso com animação fade-in
- ✅ Loading state com spinner
- ✅ Botão desabilitado quando campos vazios
- ✅ Ícones contextuais

### 3. Credenciais de Teste
- ✅ Card clicável para preencher automaticamente
- ✅ Credencial de Admin visível
- ✅ Foco automático no botão após preencher

### 4. Atalhos de Teclado
- ✅ `Enter` - Submeter formulário
- ✅ `Ctrl/Cmd + K` - Preencher credenciais admin

### 5. UX Melhorada
- ✅ Foco automático no campo de email ao carregar
- ✅ Limpa erro ao digitar
- ✅ Gradiente de fundo moderno
- ✅ Sombras e transições suaves
- ✅ Design responsivo

---

## 🎨 Design

### Cores
- **Fundo:** Gradiente azul/índigo/roxo
- **Card:** Branco com sombra
- **Botão:** Azul (employee-btn-primary)
- **Erro:** Vermelho (red-50/red-200)
- **Sucesso:** Verde (green-50/green-200)
- **Admin:** Vermelho (red-50/red-200)

### Ícones
- 🏢 Building (logo)
- ✉️ Envelope (email)
- 🔒 Lock (senha)
- 👁️ Eye/Eye-slash (toggle senha)
- ⚠️ Exclamation (erro)
- ✓ Check (sucesso)
- ➡️ Arrow (botões)
- ℹ️ Information (info)

### Animações
- **Shake:** Erro ao fazer login
- **Fade-in:** Mensagem de sucesso
- **Spin:** Loading no botão
- **Transitions:** Hover, focus, etc

---

## 📝 Campos do Formulário

### Email
```vue
<input
  type="email"
  required
  autocomplete="email"
  placeholder="seu@email.com"
/>
```
- Validação HTML5
- Autocomplete ativo
- Ícone de envelope
- Foco automático ao carregar

### Senha
```vue
<input
  type="password" (ou "text" se toggle ativo)
  required
  autocomplete="current-password"
  placeholder="••••••••"
/>
```
- Toggle de visualização
- Autocomplete ativo
- Ícone de cadeado
- Botão de mostrar/ocultar

---

## 🔐 Credenciais de Teste

### Admin
```
Email: silvana@qualitec.ind.br
Senha: qualitec25
```

**Como usar:**
1. Clicar no card "Admin"
2. Campos preenchidos automaticamente
3. Clicar em "Entrar"

**Atalho:** `Ctrl/Cmd + K`

---

## 🎯 Fluxo de Login

```
1. Usuário acessa /login
   ↓
2. Foco automático no campo de email
   ↓
3. Preenche email e senha
   (ou clica no card de teste)
   ↓
4. Clica em "Entrar" ou pressiona Enter
   ↓
5. useAppAuth.login() é chamado
   ↓
6. Loading state ativado
   ↓
7. Autentica no Supabase Auth
   ↓
8. Busca dados em app_users
   ↓
9. Verifica se está ativo
   ↓
10. Redireciona baseado no role:
    - Admin → /admin
    - Funcionário → /employee/dashboard
```

---

## ⚠️ Tratamento de Erros

### Erros Possíveis

| Erro | Mensagem | Causa |
|------|----------|-------|
| Invalid credentials | Credenciais inválidas | Email/senha incorretos |
| User not found | Usuário não encontrado | Não existe no Auth |
| Usuário não cadastrado | Não cadastrado no sistema | Não existe em app_users |
| Usuário inativo | Usuário inativo | Campo ativo = false |
| Network error | Erro de conexão | Sem internet/Supabase offline |

### Exibição de Erro
```vue
<div class="bg-red-50 border border-red-200 rounded-lg p-3 animate-shake">
  <Icon name="heroicons:exclamation-circle" />
  <p>Erro ao fazer login</p>
  <p>{{ error }}</p>
</div>
```

---

## 🎨 Classes CSS Customizadas

### Animações
```css
.animate-shake {
  animation: shake 0.5s ease-in-out;
}

.animate-fade-in {
  animation: fade-in 0.3s ease-out;
}
```

### Transições
- `transition-all` - Transições suaves
- `transition-colors` - Transição de cores
- `hover:shadow-xl` - Sombra no hover
- `focus:ring-2` - Anel de foco

---

## 📱 Responsividade

### Mobile (< 640px)
- Card ocupa largura total com padding
- Botões em coluna
- Texto menor

### Tablet (640px - 1024px)
- Card centralizado
- Largura máxima 28rem (448px)

### Desktop (> 1024px)
- Card centralizado
- Largura máxima 28rem (448px)
- Hover effects mais pronunciados

---

## ♿ Acessibilidade

### Implementado
- ✅ Labels associados aos inputs
- ✅ Placeholder descritivo
- ✅ Autocomplete correto
- ✅ Foco visível (ring)
- ✅ Disabled state claro
- ✅ Ícones com significado
- ✅ Contraste adequado
- ✅ Navegação por teclado

### Atalhos
- `Tab` - Navegar entre campos
- `Enter` - Submeter formulário
- `Ctrl/Cmd + K` - Preencher admin
- `Esc` - Limpar erro (futuro)

---

## 🧪 Como Testar

### 1. Acessar página
```bash
npm run dev
```
Navegar para: http://localhost:3000/login

### 2. Testar formulário
- Preencher email e senha
- Clicar em "Entrar"
- Verificar redirecionamento

### 3. Testar credenciais de teste
- Clicar no card "Admin"
- Verificar preenchimento automático
- Clicar em "Entrar"

### 4. Testar erros
- Email inválido → Validação HTML5
- Credenciais erradas → Mensagem de erro
- Sem conexão → Erro de rede

### 5. Testar atalhos
- `Ctrl/Cmd + K` → Preenche admin
- `Enter` → Submete formulário

---

## 🔧 Configuração

### Layout
```typescript
definePageMeta({
  layout: false, // Sem layout padrão
})
```

### Composables Usados
```typescript
const { 
  login,      // Função de login
  isLoading,  // Estado de loading
  error,      // Mensagem de erro
  clearError  // Limpar erro
} = useAppAuth()
```

---

## 📊 Estado do Componente

### Refs
```typescript
credentials = {
  email: '',
  password: ''
}
showPassword = false
successMessage = ''
emailInput = ref<HTMLInputElement>()
```

### Computed
- Nenhum (usa computed do composable)

### Watchers
- `credentials` → Limpa erro ao digitar

---

## 🎯 Melhorias Futuras

### Funcionalidades
- [ ] "Lembrar-me" (persistir sessão)
- [ ] "Esqueci minha senha"
- [ ] Login com Google/Microsoft
- [ ] 2FA (autenticação de dois fatores)
- [ ] Captcha após 3 tentativas
- [ ] Histórico de logins

### UX
- [ ] Animação de entrada do card
- [ ] Feedback de força da senha
- [ ] Sugestão de email (autocomplete)
- [ ] Dark mode
- [ ] Idiomas (i18n)

### Segurança
- [ ] Rate limiting
- [ ] Bloqueio após tentativas
- [ ] Log de tentativas de login
- [ ] Notificação de novo login
- [ ] Verificação de dispositivo

---

## 📖 Documentação Relacionada

- `AUTENTICACAO_CRIADA.md` - Sistema de autenticação completo
- `useAppAuth.ts` - Composable de autenticação
- `auth-redirect.global.ts` - Middleware de redirecionamento

---

## ✅ Checklist de Validação

- [x] Formulário funcional
- [x] Validação de campos
- [x] Mensagens de erro
- [x] Loading state
- [x] Credenciais de teste
- [x] Atalhos de teclado
- [x] Animações
- [x] Responsivo
- [x] Acessível
- [x] Sem erros de diagnóstico

---

**Status:** ✅ Página de login completa e funcional!

**Última atualização:** 02/12/2025

**Testado:** Sim, sem erros de diagnóstico
