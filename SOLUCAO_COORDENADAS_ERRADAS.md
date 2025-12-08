# 🎯 Solução: Coordenadas Cadastradas Erradas

## 📊 Diagnóstico

**Problema**: As coordenadas cadastradas no sistema não correspondem aos locais reais.

**Evidência**:
- Pessoa na SEDE → mostra distância menor (mas bloqueia)
- Pessoa no ESCRITÓRIO → mostra distância maior (e bloqueia)

**Causa**: Você cadastrou coordenadas genéricas ou aproximadas, não as coordenadas exatas de cada local.

## ⚡ Solução Imediata (5 segundos)

Execute no Supabase SQL Editor:

```sql
UPDATE locais_ponto SET raio_metros = 10000;
```

Isso libera o ponto para todos imediatamente (raio de 10km).

## ✅ Solução Definitiva

### 1. Pegar Coordenadas da SEDE

1. Vá até a Sede Qualitec
2. Abra Google Maps no celular
3. Toque e segure no local exato
4. Copie as coordenadas (ex: `-23.482782, -46.758626`)

### 2. Cadastrar SEDE Corretamente

```sql
UPDATE locais_ponto 
SET 
  latitude = -23.482782,  -- Cole a latitude real
  longitude = -46.758626, -- Cole a longitude real
  raio_metros = 100
WHERE nome = 'Sede Qualitec';
```

### 3. Pegar Coordenadas do ESCRITÓRIO

1. Vá até o Escritório
2. Repita o processo do Google Maps
3. Copie as coordenadas

### 4. Cadastrar ESCRITÓRIO Corretamente

```sql
UPDATE locais_ponto 
SET 
  latitude = -23.YYYYYY,  -- Cole a latitude real
  longitude = -46.YYYYYY, -- Cole a longitude real
  raio_metros = 100
WHERE nome = 'Escritório';
```

## 📱 Alternativa: Usar o App

Se não puder ir aos locais:

1. Peça para alguém que está na SEDE abrir o app
2. Quando tentar bater ponto, o app mostra as coordenadas
3. Anote essas coordenadas
4. Cadastre no sistema

## 🎯 Resultado Esperado

Após cadastrar corretamente:
- Pessoa na SEDE → distância 0-50m → ✅ Permite
- Pessoa no ESCRITÓRIO → distância 0-50m → ✅ Permite
- Pessoa fora → distância >100m → ❌ Bloqueia

## 📋 Arquivos Criados

1. `LIBERAR_PONTO_AGORA.sql` - Execute agora para liberar
2. `CADASTRAR_SEDE_E_ESCRITORIO.sql` - Template para cadastrar
3. `COMO_PEGAR_COORDENADAS_CORRETAS.md` - Guia passo a passo

## ⚠️ Importante

O raio de 30 metros é muito restritivo. Use:
- **100 metros** para escritórios normais
- **200 metros** para prédios comerciais
- **500 metros** para campus grandes
