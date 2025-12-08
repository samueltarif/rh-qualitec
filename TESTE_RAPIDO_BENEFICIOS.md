# Teste Rápido - Benefícios e Cargo

## Passo a Passo para Testar

### 1. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 2. Abrir o Console do Navegador

1. Pressione **F12** no navegador
2. Vá na aba **Console**
3. Deixe aberto para ver os logs

### 3. Acessar Folha de Pagamento

1. Acesse: `http://localhost:3000/folha-pagamento`
2. Selecione o mês e ano
3. Clique em **Calcular Folha**

### 4. Editar um Colaborador

1. Clique em **Editar** em qualquer colaborador
2. **OBSERVE NO CONSOLE** os logs que aparecem:

```
=== ABRINDO MODAL EDIÇÃO ===
Item recebido: {...}
Colaborador ID: 1

=== RESPOSTA DA API ===
Response completo: {...}
cargo_nome: "Desenvolvedor"
cargo: "Desenvolvedor"

=== DADOS DO MODAL ===
modalEdicao.dados.cargo: "Desenvolvedor"

=== DEBUG BENEFÍCIOS ===
recebe_vt: true valor_vt: 200
recebe_vr: true valor_vr: 500
recebe_va: true valor_va: 300
...

Benefícios calculados: {
  vale_transporte: 200,
  vale_refeicao: 500,
  vale_alimentacao: 300,
  ...
}

=== APÓS ATRIBUIÇÃO ===
modalEdicao.edicao completo: {...}
vale_transporte: 200
vale_refeicao: 500
...

=== RESUMO CALCULADO ===
total_beneficios: 1050

=== MODAL ABERTO ===
Modal está aberto, verifique os campos na tela
```

### 5. Verificar no Modal

**Seção "Dados do Colaborador" (topo, fundo cinza):**
- [ ] Nome aparece?
- [ ] CPF aparece?
- [ ] **Cargo aparece?** (deve mostrar o cargo, não "-")
- [ ] Salário Base aparece?

**Seção "Benefícios (Proventos)" (fundo verde):**
- [ ] Vale Transporte tem valor preenchido?
- [ ] Vale Refeição tem valor preenchido?
- [ ] Vale Alimentação tem valor preenchido?
- [ ] Plano de Saúde tem valor preenchido?
- [ ] Plano Odontológico tem valor preenchido?

**Resumo do Holerite (coluna direita, fundo roxo):**
- [ ] "🎁 Total Benefícios" aparece?
- [ ] O valor está correto?

## Possíveis Problemas e Soluções

### Problema 1: Cargo aparece como "-"

**Causa:** O colaborador não tem cargo cadastrado ou o campo está vazio

**Solução:**
```sql
-- Verificar cargo do colaborador
SELECT id, nome, cargo FROM colaboradores WHERE nome ILIKE '%samuel%';

-- Se estiver vazio, atualizar
UPDATE colaboradores 
SET cargo = 'Desenvolvedor' 
WHERE nome ILIKE '%samuel%';
```

### Problema 2: Benefícios aparecem como 0

**Causa:** Os campos de benefícios não existem ou não estão preenchidos

**Solução:**
```sql
-- Verificar benefícios
SELECT 
  nome,
  recebe_vt, valor_vt,
  recebe_vr, valor_vr,
  recebe_va, valor_va
FROM colaboradores 
WHERE nome ILIKE '%samuel%';

-- Se os campos não existirem, executar:
-- database/ADICIONAR_CAMPOS_BENEFICIOS.sql

-- Se existirem mas estiverem vazios, atualizar:
UPDATE colaboradores 
SET 
  recebe_vt = true,
  valor_vt = 200,
  recebe_vr = true,
  valor_vr = 500,
  recebe_va = true,
  valor_va = 300
WHERE nome ILIKE '%samuel%';
```

### Problema 3: Console não mostra os logs

**Causa:** O servidor não foi reiniciado ou há erro de JavaScript

**Solução:**
1. Verifique se há erros no console (texto vermelho)
2. Reinicie o servidor
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Problema 4: Modal não abre

**Causa:** Erro de JavaScript ou problema com o componente UIModal

**Solução:**
1. Verifique erros no console
2. Verifique se o componente UIModal existe
3. Tente recarregar a página

## Checklist Final

Após seguir todos os passos:

- [ ] Console mostra todos os logs esperados
- [ ] Cargo aparece corretamente no modal
- [ ] Benefícios aparecem preenchidos nos campos
- [ ] Resumo mostra o total de benefícios
- [ ] Não há erros no console

## Se Ainda Não Funcionar

1. **Tire um print do console** com todos os logs
2. **Tire um print do modal** mostrando os campos
3. **Execute no Supabase:**
   ```sql
   SELECT * FROM colaboradores WHERE id = 1;
   ```
4. **Compartilhe os prints e o resultado da query**

Isso ajudará a identificar exatamente onde está o problema.
