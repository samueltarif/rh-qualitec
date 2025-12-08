# 📍 Onde Está o Botão "Baixar PDF"?

## 🎯 Existem 2 Lugares para Baixar o PDF:

### 1️⃣ **Direto no Card do Holerite** (NOVO!)

Na lista de holerites, cada card agora tem **2 botões** no rodapé:

```
┌─────────────────────────────────┐
│  📄 Dezembro                    │
│     2025                        │
│                                 │
│  Salário Bruto:  R$ 8.000,00   │
│  Descontos:      R$ 1.908,00   │
│  Líquido:        R$ 6.092,00   │
│                                 │
├─────────────────────────────────┤
│  [👁️ Visualizar] [⬇️ Baixar PDF] │
└─────────────────────────────────┘
```

**Como usar:**
- Clique em **"Baixar PDF"** → O PDF é baixado imediatamente!
- Clique em **"Visualizar"** → Abre o modal com detalhes completos

### 2️⃣ **No Modal de Visualização**

Quando você clica em "Visualizar", abre um modal com todos os detalhes.

No **rodapé do modal** você encontra 3 botões:

```
┌─────────────────────────────────────────┐
│  HOLERITE - Dezembro/2025               │
│                                         │
│  [Detalhes completos do holerite]       │
│                                         │
├─────────────────────────────────────────┤
│  [Fechar] [🖨️ Imprimir] [⬇️ Baixar PDF] │
└─────────────────────────────────────────┘
```

## 🚀 Passo a Passo Completo

### Para Funcionários:

1. **Faça login** no portal do funcionário
2. Você será redirecionado para `/employee`
3. Clique na aba **"Holerites"** (segunda aba)
4. Você verá seus holerites em cards

**Opção A - Download Rápido:**
- Clique no botão verde **"Baixar PDF"** no card
- O PDF será baixado automaticamente

**Opção B - Visualizar Primeiro:**
- Clique no botão azul **"Visualizar"**
- Veja todos os detalhes no modal
- Clique em **"Baixar PDF"** no rodapé do modal

### Para Administradores:

1. Acesse `/folha-pagamento`
2. Clique em qualquer holerite da lista
3. No modal, clique em **"Baixar PDF"**

## 🎨 Visual dos Botões

### No Card (Lista):
- **Botão Azul** (Visualizar): 👁️ Abre o modal
- **Botão Verde** (Baixar PDF): ⬇️ Download direto

### No Modal:
- **Botão Cinza** (Fechar): Fecha o modal
- **Botão Azul** (Imprimir): 🖨️ Imprime o holerite
- **Botão Azul** (Baixar PDF): ⬇️ Baixa o PDF

## 📱 Responsivo

Os botões funcionam em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🔍 Não Está Vendo os Botões?

### Verifique:

1. **Você está na aba correta?**
   - Portal do Funcionário → Aba "Holerites"
   - Não é a aba "Perfil" ou "Ponto"

2. **Você tem holerites gerados?**
   - Se aparecer "Nenhum holerite disponível", peça ao RH para gerar

3. **O servidor está rodando?**
   - Verifique se `npm run dev` está ativo
   - Reinicie se necessário

4. **Faça logout e login novamente**
   - Às vezes o cache precisa ser limpo

## 📥 Nome do Arquivo Baixado

O PDF é salvo como:
```
Holerite_NOME_DO_FUNCIONARIO_MES_ANO.pdf
```

Exemplo:
```
Holerite_SAMUEL_BARRETOS_TARIF_Dezembro_2025.pdf
```

## ✨ Recursos do PDF

O PDF gerado inclui:
- ✅ Dados da empresa (nome, CNPJ, endereço)
- ✅ Dados do funcionário (nome, CPF, cargo)
- ✅ Todos os proventos (em verde)
- ✅ Todos os descontos (em vermelho)
- ✅ Salário líquido destacado
- ✅ Dados bancários
- ✅ FGTS
- ✅ Data de geração

## 🎯 Teste Agora!

1. Faça login como Samuel
2. Vá para a aba "Holerites"
3. Você verá o holerite de Dezembro/2025
4. Clique no botão verde **"Baixar PDF"**
5. O arquivo será baixado na pasta Downloads!

## 💡 Dica

Use o botão **"Baixar PDF"** direto no card para downloads rápidos.
Use o botão **"Visualizar"** quando quiser conferir os detalhes antes de baixar.
