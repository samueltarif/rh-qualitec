# 🚀 TESTAR ADIANTAMENTO AGORA - CHECKLIST RÁPIDO

## ⚡ PASSO A PASSO RÁPIDO

### **1. Reiniciar Servidor** (OBRIGATÓRIO)
```bash
Ctrl+C (parar servidor)
npm run dev (iniciar novamente)
```

### **2. Acessar Sistema**
- Login como admin
- Ir em **Folha de Pagamento**

### **3. Procurar o Botão**
Role a página até ver a seção **"Ações Rápidas - Cálculos Especiais"**

Você deve ver 4 cards:
```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│ 💰          │ ☀️          │ 🎁          │ 📄          │
│ Adiantamento│ Férias      │ 13º Salário │ Rescisão    │
│ [BOTÃO]     │ [BOTÃO]     │ [BOTÃO]     │ [BOTÃO]     │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### **4. Clicar em "Gerar Adiantamento"**
O popup deve abrir mostrando:
- ✅ Título: "💰 Gerar Adiantamento Salarial"
- ✅ Informações sobre como funciona
- ✅ Seleção de mês/ano
- ✅ Lista de colaboradores com checkboxes
- ✅ Resumo com total estimado

### **5. Selecionar e Gerar**
1. Marque um ou mais colaboradores
2. Veja o resumo atualizar em tempo real
3. Clique em **"Gerar Adiantamentos"**
4. Confirme
5. Aguarde mensagem: "✅ Sucesso! X adiantamento(s) gerado(s)"

---

## ❌ SE NÃO FUNCIONAR

### **Botão não aparece?**
- Limpe cache do navegador (Ctrl+Shift+R)
- Reinicie o servidor
- Verifique se está na página correta

### **Popup não abre?**
1. Abra console (F12)
2. Veja se há erros em vermelho
3. Procure por:
   - "ModalAdiantamento is not defined" → Reinicie servidor
   - "Cannot read property" → Execute migration 29
   - Outros erros → Me envie o erro

### **Lista vazia?**
- Verifique se existem colaboradores com status "Ativo"
- Vá em Colaboradores e veja se tem algum ativo

---

## ✅ VERIFICAR SUCESSO

### **No Sistema:**
- Mensagem de sucesso aparece
- Modal fecha automaticamente

### **No Banco (Supabase):**
```sql
SELECT * FROM holerites 
WHERE tipo = 'adiantamento' 
ORDER BY created_at DESC 
LIMIT 5;
```

Deve mostrar os adiantamentos gerados!

---

## 🎯 TESTE COMPLETO

1. ✅ Gere adiantamento para 1 colaborador
2. ✅ Vá em "Gerenciar Holerites"
3. ✅ Veja o adiantamento na lista
4. ✅ Clique para ver detalhes
5. ✅ Gere PDF
6. ✅ Envie por email

---

## 📞 PRECISA DE AJUDA?

Se algo não funcionar:
1. Tire print do erro
2. Copie mensagem do console
3. Me envie para análise

---

**Teste agora e me diga se funcionou!** 🚀
