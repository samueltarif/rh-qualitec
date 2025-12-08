# 🎯 Solução: Distância GPS Bloqueando Ponto

## ❌ Problema Atual

As pessoas estão tentando bater ponto mas o sistema está bloqueando:
- **Sede Qualitec**: 8825m de distância (bloqueado - fora do raio de 30m)
- **Escritório**: 989m de distância (bloqueado - fora do raio de 30m)

## 🔍 Causa

O raio configurado é de apenas **30 metros**, mas as coordenadas cadastradas não correspondem à localização real dos funcionários.

## ✅ Soluções

### Opção 1: Aumentar o Raio (Recomendado para Testes)

Execute no Supabase SQL Editor:

```sql
-- Aumentar para 10km (muito permissivo - bom para testes)
UPDATE locais_ponto 
SET raio_metros = 10000
WHERE ativo = true;
```

### Opção 2: Cadastrar Coordenadas Corretas

1. Vá até cada local físico (Sede e Escritório)
2. Abra o Google Maps no celular
3. Toque e segure no local exato
4. Copie as coordenadas que aparecem
5. Atualize no banco:

```sql
-- Atualizar Sede com coordenadas corretas
UPDATE locais_ponto 
SET 
  latitude = -23.XXXXXX,  -- Cole a latitude correta
  longitude = -46.XXXXXX, -- Cole a longitude correta
  raio_metros = 100       -- 100 metros é razoável
WHERE nome = 'Sede Qualitec';

-- Atualizar Escritório com coordenadas corretas
UPDATE locais_ponto 
SET 
  latitude = -23.XXXXXX,
  longitude = -46.XXXXXX,
  raio_metros = 100
WHERE nome = 'Escritório';
```

### Opção 3: Desabilitar Verificação Temporariamente

```sql
-- Desabilitar todos os locais (permite bater ponto de qualquer lugar)
UPDATE locais_ponto 
SET ativo = false;
```

## 📋 Passo a Passo Recomendado

### Para Testes Imediatos:

1. Execute no Supabase:
```sql
UPDATE locais_ponto SET raio_metros = 10000;
```

2. Peça para tentarem bater ponto novamente

### Para Configuração Correta:

1. **No escritório físico**, abra o app do funcionário
2. Quando tentar bater ponto, anote a distância mostrada
3. Vá em Configurações > Locais de Ponto
4. Edite o local e ajuste as coordenadas
5. Configure um raio de 100-200 metros

## 🎯 Raios Recomendados

- **Escritório pequeno**: 50-100 metros
- **Prédio comercial**: 100-200 metros  
- **Campus/área grande**: 500-1000 metros
- **Testes**: 10000 metros (10km)

## 🔧 Verificar Locais Cadastrados

```sql
SELECT 
  nome,
  latitude,
  longitude,
  raio_metros,
  ativo
FROM locais_ponto
ORDER BY nome;
```

## ✅ Teste Rápido

Após ajustar, teste com:
```sql
-- Substitua pelas coordenadas do funcionário
SELECT * FROM verificar_local_permitido(
  -23.482782,  -- latitude atual
  -46.758626   -- longitude atual
);
```

Deve retornar `dentro_raio = true`
