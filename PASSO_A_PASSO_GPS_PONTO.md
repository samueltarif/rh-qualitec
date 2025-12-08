# 📍 Passo a Passo: GPS no Ponto Eletrônico

## 🎯 Resumo Rápido

**Sim, é simples!** Você pega as coordenadas do Google Maps e cadastra no sistema com raio de 30 metros.

---

## 📱 PASSO 1: Pegar Coordenadas

### No Google Maps (3 formas):

#### Forma 1 - Clique Direito (Mais Fácil)
```
1. Abra Google Maps
2. Procure seu endereço
3. Clique com BOTÃO DIREITO no local exato
4. Clique em "O que há aqui?"
5. Copie as coordenadas: -23.550520, -46.633308
```

#### Forma 2 - Pela URL
```
1. Abra Google Maps no local
2. Copie a URL:
   https://www.google.com/maps/@-23.550520,-46.633308,17z
                                ↑ Latitude  ↑ Longitude
```

#### Forma 3 - No Celular
```
1. Abra app Google Maps
2. TOQUE E SEGURE no local
3. Pin vermelho aparece
4. Arraste tela para cima
5. Coordenadas aparecem no topo
6. Toque para copiar
```

---

## 💻 PASSO 2: Executar Migration

### No Supabase SQL Editor:

```sql
-- Cole o conteúdo do arquivo:
-- database/migrations/30_locais_ponto.sql

-- Depois ajuste as coordenadas:
UPDATE locais_ponto 
SET 
  nome = 'Sede Qualitec',
  latitude = -23.550520,  -- COLE SUA LATITUDE AQUI
  longitude = -46.633308, -- COLE SUA LONGITUDE AQUI
  raio_metros = 30        -- 30 METROS
WHERE nome = 'Sede Qualitec';
```

---

## ⚙️ PASSO 3: Cadastrar no Sistema

### Acesse:
```
http://localhost:3000/configuracoes/locais-ponto
```

### Clique em "Novo Local" e preencha:

```
┌─────────────────────────────────────┐
│ Nome: Sede Qualitec                 │
│ Descrição: Av. Paulista, 1000       │
│ Latitude: -23.550520                │
│ Longitude: -46.633308               │
│ Raio permitido: 30 metros           │
│ ☑ Local ativo                       │
│                                     │
│        [Cancelar]  [Salvar]         │
└─────────────────────────────────────┘
```

---

## 🎮 PASSO 4: Como Funciona para o Funcionário

### 1. Funcionário clica em "Bater Ponto com GPS"

### 2. Navegador pede permissão:
```
┌────────────────────────────────────┐
│ 🌐 exemplo.com deseja saber sua    │
│    localização                     │
│                                    │
│    [Bloquear]  [Permitir]          │
└────────────────────────────────────┘
```

### 3. Sistema mostra distância:
```
✅ Dentro do raio permitido
   Sede Qualitec - 15m de distância
```

### 4. Ponto registrado com sucesso!

---

## ⚠️ GPS OBRIGATÓRIO

### ✅ Sistema BLOQUEIA se:
- GPS desligado
- Permissão negada
- Sem sinal GPS
- Navegador não suporta

### 🟢 Dentro do Raio (0-30m)
```
✅ Ponto registrado normalmente
   Status: Normal
```

### 🟡 Fora do Raio (31m+)
```
⚠️ Ponto registrado mas marcado
   Status: Fora do local
   Distância: 45m
```

### 🔴 GPS Desligado
```
❌ BLOQUEADO - Não pode bater ponto
   Mensagem: "Ative o GPS para continuar"
```

---

## 📏 Raios Recomendados

```
Tipo de Local          | Raio Sugerido
-----------------------|---------------
Escritório pequeno     | 30-50m
Prédio comercial       | 50-100m
Campus/Shopping        | 200-500m
Área industrial        | 500-1000m
```

**Recomendação:** Comece com **30-50m** e ajuste depois se necessário.

---

## 🔒 Segurança e Privacidade

### ✅ O que o sistema FAZ:
- Captura localização APENAS ao bater ponto
- Armazena coordenadas do registro
- Calcula distância do local permitido
- Identifica se está dentro do raio

### ❌ O que o sistema NÃO FAZ:
- Rastreamento contínuo
- Monitoramento em tempo real
- Histórico de movimentação
- Localização fora do horário de trabalho

---

## 📱 Requisitos do Funcionário

### Obrigatório:
- ✅ GPS ligado
- ✅ Permissão de localização habilitada
- ✅ Internet ativa
- ✅ Navegador compatível

### Navegadores que funcionam:
- ✅ Chrome (Android/iOS/PC)
- ✅ Safari (iPhone/Mac)
- ✅ Firefox (Android/PC)
- ✅ Edge (PC)

---

## 🆘 Problemas Comuns

### "Permissão de localização negada"
**Solução:**
```
1. Clique no cadeado 🔒 na barra de endereço
2. Habilite "Localização"
3. Recarregue a página (F5)
```

### "GPS desligado"
**Solução:**
```
1. Ative GPS no celular
2. Saia de ambientes muito fechados
3. Aguarde alguns segundos
```

### "Fora do raio permitido"
**Solução:**
```
1. Verifique se está no local correto
2. Aguarde GPS calibrar (10-30 segundos)
3. Se persistir, contate RH
```

### "Localização indisponível"
**Solução:**
```
1. Verifique conexão com internet
2. Reinicie o navegador
3. Tente em área aberta
```

---

## 📊 Relatórios Disponíveis

### Após implementar, você pode ver:

```sql
-- Pontos fora do raio
SELECT 
  c.nome,
  r.data,
  r.distancia_metros,
  l.nome as local
FROM registros_ponto r
JOIN colaboradores c ON c.id = r.colaborador_id
JOIN locais_ponto l ON l.id = r.local_id
WHERE r.fora_do_raio = true
ORDER BY r.data DESC;
```

---

## ✅ Checklist de Implementação

```
[ ] 1. Executar migration 30_locais_ponto.sql
[ ] 2. Pegar coordenadas no Google Maps
[ ] 3. Cadastrar local no sistema
[ ] 4. Testar com sua conta
[ ] 5. Ajustar raio se necessário
[ ] 6. Comunicar equipe
[ ] 7. Liberar para todos
[ ] 8. Monitorar primeiros dias
```

---

## 🎓 Dicas Profissionais

### 1. Teste Primeiro
- Cadastre o local
- Teste você mesmo
- Ajuste o raio conforme necessário

### 2. Comunique a Equipe
```
📧 Email para equipe:

Olá equipe!

A partir de [DATA], o ponto eletrônico terá 
validação por GPS. 

Para bater ponto:
1. Ative o GPS do celular
2. Permita localização no navegador
3. Esteja dentro de 30m da empresa

Dúvidas? Fale com o RH.
```

### 3. Seja Flexível
- Primeiros dias: raio maior (100m)
- Monitore por 1-2 semanas
- Ajuste conforme feedback

### 4. Considere Exceções
- Home office (sem validação)
- Trabalho externo (múltiplos locais)
- Vendedores/técnicos (raio maior)

---

## 🚀 Pronto para Começar!

### Arquivos Importantes:
- `database/migrations/30_locais_ponto.sql` - Migration
- `app/pages/configuracoes/locais-ponto.vue` - Gerenciar locais
- `app/components/ButtonBaterPontoGeo.vue` - Botão com GPS
- `GUIA_CADASTRAR_LOCAIS_PONTO.md` - Guia completo

### Próximos Passos:
1. Execute a migration
2. Cadastre seus locais
3. Teste e ajuste
4. Libere para equipe

**Tudo pronto!** 🎉
