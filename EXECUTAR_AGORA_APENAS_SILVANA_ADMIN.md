# 🎯 EXECUTAR AGORA - Apenas Silvana Admin

## 📋 Passo a Passo:

### 1. Execute o SQL no Supabase
```sql
-- Copie e cole este SQL no Supabase:

-- Tornar todos funcionários primeiro
UPDATE app_users SET role = 'funcionario';

-- Tornar APENAS Silvana admin
UPDATE app_users 
SET role = 'admin' 
WHERE email ILIKE '%silvana%' 
   OR nome ILIKE '%silvana%';

-- Verificar resultado
SELECT email, role, nome FROM app_users ORDER BY role DESC;
```

### 2. Reinicie o Servidor
```bash
# No terminal:
npm run dev
```

### 3. Teste com Silvana
1. Faça login com a conta da Silvana
2. Vá para "Ponto Eletrônico"
3. Clique em "Assinaturas"
4. Deve funcionar sem erros!

## ✅ Resultado Esperado:

- ✅ **Apenas Silvana** tem `role = 'admin'`
- ✅ **Todos os outros** têm `role = 'funcionario'`
- ✅ **Modal de assinaturas** abre sem erro 403
- ✅ **Funcionalidade completa** disponível para Silvana

## 🎮 Funcionalidades para Silvana:

- Ver todas as assinaturas de ponto
- Zerar assinaturas (permite novo download)
- Excluir assinaturas permanentemente
- Gerenciar quando colaboradores podem baixar ponto

## 🔒 Segurança:

- ✅ Apenas Silvana pode acessar
- ✅ Outros usuários recebem erro 403
- ✅ Verificação de permissão ativa
- ✅ Logs de todas as ações

**Execute o SQL e teste agora!** 🚀