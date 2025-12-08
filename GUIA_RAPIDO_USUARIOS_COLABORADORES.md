# 🚀 Guia Rápido: Usuários e Colaboradores Unificados

## 🎯 O que mudou?

Agora você pode criar o colaborador E o acesso ao sistema de uma vez só!

## 📝 Cenário 1: Novo Colaborador com Acesso

**Quando usar**: Contratação de novo funcionário que precisa acessar o sistema

### Passo a Passo:

1. **Ir em Colaboradores** → Clicar em "Novo Colaborador"

2. **Preencher dados básicos** (aba "Dados Pessoais"):
   - Nome completo ✅
   - CPF ✅
   - Email corporativo (recomendado)

3. **Preencher dados profissionais** (aba "Profissionais"):
   - Cargo
   - Departamento
   - Salário
   - Data de admissão

4. **Criar acesso ao sistema** (aba "🔑 Acesso ao Sistema"):
   - ✅ Marcar "Criar usuário de acesso ao sistema"
   - Email de login: `funcionario@qualitec.ind.br`
   - Senha inicial: `senha123` (mínimo 6 caracteres)
   - Nível: Funcionário

5. **Salvar**

### Resultado:
✅ Colaborador cadastrado no RH  
✅ Usuário criado automaticamente  
✅ Pronto para fazer login!

---

## 📝 Cenário 2: Novo Colaborador SEM Acesso

**Quando usar**: Terceirizado, estagiário, ou funcionário que não precisa acessar o sistema

### Passo a Passo:

1. **Ir em Colaboradores** → Clicar em "Novo Colaborador"

2. **Preencher dados básicos**

3. **NÃO marcar** "Criar usuário de acesso ao sistema"

4. **Salvar**

### Resultado:
✅ Colaborador cadastrado no RH  
❌ Sem acesso ao sistema  
💡 Pode criar acesso depois se necessário

---

## 📝 Cenário 3: Dar Acesso a Colaborador Existente

**Quando usar**: Colaborador já cadastrado precisa acessar o sistema

### Passo a Passo:

1. **Ir em Usuários**

2. **Ver card "Colaboradores sem Acesso"**
   - Lista todos colaboradores ativos sem usuário
   - Mostra nome, email, cargo

3. **Clicar em "Criar Acesso"** no colaborador desejado

4. **Preencher dados**:
   - Email de login (já vem preenchido com email corporativo)
   - Senha inicial
   - Nível de acesso

5. **Salvar**

### Resultado:
✅ Usuário criado e vinculado ao colaborador  
✅ Colaborador pode fazer login agora!

---

## 🔍 Como Verificar

### Ver quem tem acesso:
1. Ir em **Usuários**
2. Ver tabela com todos os usuários
3. Coluna "Usuário" mostra nome e ícone:
   - 👑 = Admin
   - 👤 = Funcionário

### Ver quem NÃO tem acesso:
1. Ir em **Usuários**
2. Ver card **"Colaboradores sem Acesso"** no topo
3. Lista mostra todos colaboradores ativos sem usuário

---

## ⚠️ Regras Importantes

### Email de Login
- ✅ Pode ser diferente do email corporativo
- ✅ Deve ser único no sistema
- ✅ Formato válido: `usuario@dominio.com`

### Senha
- ✅ Mínimo 6 caracteres
- ✅ Funcionário pode alterar depois do primeiro login

### Nível de Acesso
- **Funcionário**: Acessa apenas Portal do Funcionário
  - Ver holerites
  - Bater ponto
  - Solicitar férias
  - Ver documentos

- **Admin**: Acesso total ao sistema
  - ⚠️ Apenas `silvana@qualitec.ind.br` pode ser admin

### Status
- **Ativo**: Pode fazer login
- **Inativo**: Não pode fazer login (mas dados permanecem)

---

## 💡 Dicas

### 1. Use email corporativo como login
```
✅ Recomendado: joao.silva@qualitec.ind.br
❌ Evitar: joao123@gmail.com
```

### 2. Senha inicial simples
```
✅ Primeira senha: senha123
💡 Funcionário altera no primeiro login
```

### 3. Crie acesso apenas quando necessário
```
✅ Funcionário CLT → Criar acesso
❌ Terceirizado temporário → Não criar
❌ Estagiário sem necessidade → Não criar
```

### 4. Verifique regularmente
```
1. Ir em Usuários
2. Ver "Colaboradores sem Acesso"
3. Criar acesso para quem precisa
```

---

## 🆘 Problemas Comuns

### "Email já existe"
**Causa**: Já existe usuário com esse email  
**Solução**: Use outro email ou verifique se usuário já foi criado

### "Senha muito curta"
**Causa**: Senha com menos de 6 caracteres  
**Solução**: Use senha com 6+ caracteres

### "Não posso criar admin"
**Causa**: Tentando criar admin com email diferente de silvana@qualitec.ind.br  
**Solução**: Apenas silvana pode ser admin, outros devem ser funcionários

### "Colaborador não aparece na lista"
**Causa**: Colaborador está inativo ou já tem usuário  
**Solução**: 
- Verificar status do colaborador
- Verificar se já existe usuário vinculado

---

## 📊 Exemplo Prático

### Contratação de João Silva

```
1. Cadastrar Colaborador
   Nome: João Silva
   CPF: 123.456.789-00
   Email: joao.silva@qualitec.ind.br
   Cargo: Analista de RH
   Salário: R$ 3.500,00

2. Criar Acesso (mesma tela)
   ✅ Criar usuário de acesso
   Email: joao.silva@qualitec.ind.br
   Senha: joao123
   Nível: Funcionário
   ✅ Ativo

3. Salvar

4. João pode fazer login:
   Email: joao.silva@qualitec.ind.br
   Senha: joao123
```

---

## 🎯 Resumo

| Ação | Onde | Resultado |
|------|------|-----------|
| Novo colaborador COM acesso | Colaboradores → Aba "Acesso" | Colaborador + Usuário |
| Novo colaborador SEM acesso | Colaboradores → Não marcar checkbox | Apenas Colaborador |
| Dar acesso a existente | Usuários → "Criar Acesso" | Usuário vinculado |
| Ver quem não tem acesso | Usuários → Card no topo | Lista de colaboradores |

---

**Dúvidas?** Consulte o documento completo: `SOLUCAO_UNIFICACAO_USUARIOS_COLABORADORES.md`
