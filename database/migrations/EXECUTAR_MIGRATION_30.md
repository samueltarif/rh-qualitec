# 🚀 Executar Migration 30 - Geolocalização de Ponto

## ⚡ Execução Rápida

### 1. Abra o Supabase SQL Editor
```
https://supabase.com/dashboard/project/SEU_PROJETO/sql
```

### 2. Copie e Cole o SQL
Arquivo: `database/migrations/30_locais_ponto.sql`

### 3. Clique em "Run"

---

## ✅ O que será criado:

### Tabelas:
- ✅ `locais_ponto` - Locais permitidos para bater ponto
- ✅ Novos campos em `registros_ponto` (latitude, longitude, etc)

### Funções:
- ✅ `calcular_distancia_metros()` - Calcula distância entre coordenadas
- ✅ `verificar_local_permitido()` - Valida se está no raio

### Segurança:
- ✅ RLS configurado
- ✅ Políticas de acesso

### Dados Iniciais:
- ✅ Local exemplo (ajuste as coordenadas depois)

---

## 📍 Após Executar:

### 1. Ajuste o Local Padrão
```sql
-- Atualize com as coordenadas da sua empresa
UPDATE locais_ponto 
SET 
  nome = 'Sede Qualitec',
  latitude = -23.550520,  -- SUA LATITUDE
  longitude = -46.633308, -- SUA LONGITUDE
  raio_metros = 30
WHERE nome = 'Sede Qualitec';
```

### 2. Ou Adicione Novos Locais
```sql
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros)
VALUES 
  ('Filial RJ', 'Rio de Janeiro', -22.906847, -43.172896, 30),
  ('Filial BH', 'Belo Horizonte', -19.916681, -43.934493, 30);
```

---

## 🎯 Como Pegar Coordenadas

### Google Maps:
1. Clique com botão direito no local
2. Clique em "O que há aqui?"
3. Copie as coordenadas que aparecem

### Ou pela URL:
```
https://www.google.com/maps/@-23.550520,-46.633308,17z
                            ↑ latitude  ↑ longitude
```

---

## 🧪 Testar

### 1. Verificar se criou:
```sql
SELECT * FROM locais_ponto;
```

### 2. Testar função de distância:
```sql
SELECT calcular_distancia_metros(
  -23.550520, -46.633308,  -- Ponto A
  -23.551000, -46.634000   -- Ponto B
) as distancia_metros;
```

### 3. Testar verificação:
```sql
SELECT * FROM verificar_local_permitido(
  -23.550520,  -- Sua latitude
  -46.633308   -- Sua longitude
);
```

---

## 📱 Próximos Passos

1. ✅ Execute a migration
2. ✅ Ajuste coordenadas do local padrão
3. ✅ Acesse `/configuracoes/locais-ponto` no sistema
4. ✅ Cadastre seus locais
5. ✅ Teste batendo ponto

---

## 🆘 Problemas?

### Erro: "relation locais_ponto already exists"
**Solução:** Tabela já existe, pule para ajustar coordenadas

### Erro: "function calcular_distancia_metros already exists"
**Solução:** Função já existe, está tudo certo

### Erro de permissão
**Solução:** Verifique se está logado como admin no Supabase

---

## 📊 Estrutura Criada

```
locais_ponto
├── id (UUID)
├── nome (VARCHAR)
├── descricao (TEXT)
├── latitude (DECIMAL)
├── longitude (DECIMAL)
├── raio_metros (INTEGER) ← 30 metros padrão
├── ativo (BOOLEAN)
└── created_at, updated_at

registros_ponto (novos campos)
├── latitude (DECIMAL)
├── longitude (DECIMAL)
├── local_id (UUID)
├── distancia_metros (INTEGER)
└── fora_do_raio (BOOLEAN)
```

**Pronto para usar!** 🎉
