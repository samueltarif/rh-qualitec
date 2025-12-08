# ⚡ EXECUTAR AGORA - GPS Obrigatório

## 📋 Scripts para Executar no Supabase

Acesse: **Supabase → SQL Editor**

---

## 1️⃣ PRIMEIRO SCRIPT - Criar Estrutura

**Arquivo:** `database/migrations/30_locais_ponto.sql`

Copie e cole TODO o conteúdo deste arquivo no SQL Editor e clique em **RUN**.

**O que faz:**
- ✅ Cria tabela `locais_ponto`
- ✅ Adiciona campos GPS em `registros_ponto`
- ✅ Cria função `calcular_distancia_metros()`
- ✅ Cria função `verificar_local_permitido()`
- ✅ Configura RLS e permissões

---

## 2️⃣ SEGUNDO SCRIPT - Cadastrar Qualitec

**Arquivo:** `database/CADASTRAR_LOCAL_QUALITEC_30M.sql`

Copie e cole TODO o conteúdo deste arquivo no SQL Editor e clique em **RUN**.

**O que faz:**
- ✅ Cadastra Sede Qualitec com suas coordenadas
- ✅ Define raio de 30 metros
- ✅ Ativa o local
- ✅ Testa se funcionou

---

## ✅ Pronto!

Após executar os 2 scripts:

1. **Sistema está funcionando** ✅
2. **GPS é obrigatório** ✅
3. **Raio de 30 metros configurado** ✅
4. **Bloqueia se estiver fora** ✅

---

## 🧪 Testar

Execute este SQL para verificar:

```sql
-- Ver o local cadastrado
SELECT * FROM locais_ponto;

-- Testar se você está no raio (cole suas coordenadas)
SELECT * FROM verificar_local_permitido(
  -23.482782095366336,  -- Sua latitude
  -46.758626422116876   -- Sua longitude
);
```

---

## 📱 Como Usar no Sistema

### Para Admin:
- Acesse: `/configuracoes/locais-ponto`
- Veja o local cadastrado
- Edite se necessário

### Para Funcionário:
- Clique em "Bater Ponto com GPS"
- Sistema pede permissão de localização
- Se estiver dentro de 30m: ✅ Registra
- Se estiver fora: ❌ BLOQUEIA

---

## 🎯 Comportamento

```
Distância     | Resultado
--------------|------------------
0-30m         | ✅ Permite bater ponto
31m ou mais   | ❌ BLOQUEIA completamente
Sem GPS       | ❌ BLOQUEIA completamente
```

---

## 🆘 Problemas?

### Erro: "relation already exists"
**Solução:** Tabela já existe, pule para o script 2

### Erro: "function already exists"  
**Solução:** Função já existe, está tudo certo

### Nenhum local aparece
**Solução:** Execute o script 2 novamente

---

## 📍 Suas Coordenadas

```
Latitude:  -23.482782095366336
Longitude: -46.758626422116876
Raio:      30 metros
```

**Tudo pronto para usar!** 🚀
