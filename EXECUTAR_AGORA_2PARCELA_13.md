# 🚀 EXECUTAR AGORA - 2ª PARCELA DO 13º SALÁRIO

## ✅ TUDO JÁ ESTÁ CORRIGIDO!

### O que foi feito:
1. ✅ Código corrigido para preencher todos os campos obrigatórios
2. ✅ Cálculo de descontos corrigido (INSS + IRRF sobre o total)
3. ✅ Constraint do banco já está correta
4. ✅ Tabelas INSS e IRRF 2025 atualizadas

## 🔄 PASSO 1: REINICIAR SERVIDOR

```bash
# Parar o servidor (Ctrl+C no terminal)
# Iniciar novamente
npm run dev
```

## 🎯 PASSO 2: GERAR 2ª PARCELA

1. Acesse: **http://localhost:3000/folha-pagamento**
2. Clique em: **Ações Rápidas** → **13º Salário**
3. Configure:
   - ✅ Selecione os colaboradores
   - ✅ Parcela: **2 (Segunda Parcela)**
   - ✅ Ano: **2025**
4. Clique: **Gerar 13º Salário**

## ✅ RESULTADO ESPERADO

### 1ª Parcela (Novembro - já gerada):
- Valor: 50% do 13º
- Descontos: R$ 0,00
- Líquido: 50% do 13º

### 2ª Parcela (Dezembro - agora):
- Valor: 50% do 13º
- Descontos: INSS + IRRF (sobre o total)
- Líquido: 50% - descontos

## 📊 EXEMPLO PRÁTICO

**Salário: R$ 5.000,00**

```
13º Total: R$ 5.000,00

1ª Parcela (nov):
  Proventos: R$ 2.500,00
  Descontos: R$ 0,00
  Líquido:   R$ 2.500,00 ✅

2ª Parcela (dez):
  Proventos: R$ 2.500,00
  INSS:      R$ 518,82
  IRRF:      R$ 345,50
  Descontos: R$ 864,32
  Líquido:   R$ 1.635,68 ✅

Total Recebido: R$ 4.135,68
```

## 🔍 VERIFICAR RESULTADO

```sql
SELECT 
  nome_colaborador,
  mes,
  parcela_13,
  salario_bruto,
  inss,
  irrf,
  total_descontos,
  salario_liquido
FROM holerites
WHERE tipo = 'decimo_terceiro'
  AND ano = 2025
ORDER BY nome_colaborador, mes;
```

## ⚠️ SE DER ERRO

### Erro: "duplicate key"
**Solução:** O sistema atualiza automaticamente. Ignore e verifique o resultado.

### Erro: "nome_colaborador null"
**Solução:** Reinicie o servidor (já está corrigido no código).

## 🎉 PRONTO!

Agora é só gerar e conferir os holerites! 🚀

**Dúvidas?** Veja: `CORRECAO_COMPLETA_13_SALARIO_2PARCELA.md`
