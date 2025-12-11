# ⚡ FIX RÁPIDO: Itens Personalizados

## 🔴 Problema
Itens personalizados não apareciam no holerite gerado.

## ✅ Solução em 3 Passos

### 1️⃣ Execute no Supabase SQL Editor:

```sql
ALTER TABLE holerites 
ADD COLUMN IF NOT EXISTS itens_personalizados JSONB DEFAULT '[]'::jsonb;
```

### 2️⃣ Reinicie o servidor:

```bash
# Ctrl+C para parar
npm run dev
```

### 3️⃣ Teste:

1. Folha de Pagamento → Editar colaborador
2. Adicione item personalizado
3. Salve
4. Gere holerite
5. Baixe PDF → Item deve aparecer!

## 📝 Exemplo de Item

- **Tipo**: Provento
- **Código**: 105
- **Descrição**: BONIFICAÇÃO ESPECIAL
- **Referência**: 1,00
- **Valor**: 500,00

---

**Pronto!** Agora os itens personalizados aparecem no holerite! 🎉
