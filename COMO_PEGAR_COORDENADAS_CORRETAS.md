# 📍 Como Pegar as Coordenadas Corretas

## ❌ Problema Atual

Você cadastrou coordenadas que não correspondem aos locais reais:
- **Pessoa na SEDE**: sistema mostra distância menor (mas ainda bloqueia)
- **Pessoa no ESCRITÓRIO**: sistema mostra distância maior (e bloqueia)

Isso significa que as coordenadas cadastradas estão erradas para ambos os locais.

## ✅ Solução: Cadastrar Coordenadas Corretas

### Passo 1: Ir até a SEDE

1. Vá fisicamente até a **Sede Qualitec**
2. Abra o **Google Maps** no celular
3. Toque e **segure** no local exato (onde as pessoas batem ponto)
4. Um pin vermelho vai aparecer
5. Na parte de baixo, toque nas coordenadas
6. Copie as coordenadas (exemplo: `-23.482782, -46.758626`)

### Passo 2: Cadastrar a SEDE no Sistema

Abra o Supabase SQL Editor e execute:

```sql
-- Atualizar SEDE com coordenadas corretas
UPDATE locais_ponto 
SET 
  nome = 'Sede Qualitec',
  latitude = -23.482782,  -- ⚠️ Cole a latitude que você copiou
  longitude = -46.758626, -- ⚠️ Cole a longitude que você copiou
  raio_metros = 100,      -- 100 metros é razoável
  ativo = true
WHERE nome = 'Sede Qualitec';

-- Se não existir, criar:
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
SELECT 'Sede Qualitec', 'Escritório principal', -23.482782, -46.758626, 100, true
WHERE NOT EXISTS (SELECT 1 FROM locais_ponto WHERE nome = 'Sede Qualitec');
```

### Passo 3: Ir até o ESCRITÓRIO

1. Vá fisicamente até o **Escritório**
2. Repita o processo do Google Maps
3. Copie as coordenadas do escritório

### Passo 4: Cadastrar o ESCRITÓRIO no Sistema

```sql
-- Atualizar ESCRITÓRIO com coordenadas corretas
UPDATE locais_ponto 
SET 
  nome = 'Escritório',
  latitude = -23.YYYYYY,  -- ⚠️ Cole a latitude do escritório
  longitude = -46.YYYYYY, -- ⚠️ Cole a longitude do escritório
  raio_metros = 100,
  ativo = true
WHERE nome = 'Escritório';

-- Se não existir, criar:
INSERT INTO locais_ponto (nome, descricao, latitude, longitude, raio_metros, ativo)
SELECT 'Escritório', 'Escritório secundário', -23.YYYYYY, -46.YYYYYY, 100, true
WHERE NOT EXISTS (SELECT 1 FROM locais_ponto WHERE nome = 'Escritório');
```

## 🚀 Solução Rápida (Temporária)

Se você não pode ir até os locais agora, aumente o raio para 10km:

```sql
-- Permitir bater ponto de qualquer lugar próximo (10km)
UPDATE locais_ponto 
SET raio_metros = 10000
WHERE ativo = true;
```

Depois você ajusta as coordenadas corretas.

## 📱 Usando o App para Descobrir as Coordenadas

Outra opção é pedir para alguém que está no local:

1. Abrir o app do funcionário
2. Tentar bater ponto
3. O sistema vai mostrar a distância
4. Anotar as coordenadas que o celular está enviando
5. Cadastrar essas coordenadas no sistema

## ✅ Verificar se Funcionou

Após cadastrar, execute:

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

Peça para alguém em cada local tentar bater ponto novamente.

## 🎯 Raios Recomendados

- **Escritório pequeno**: 50-100 metros
- **Prédio comercial**: 100-200 metros
- **Campus grande**: 500-1000 metros
- **Testes**: 10000 metros (10km)

## 📝 Exemplo Real

Se a Sede Qualitec fica em:
- Rua Herman Rechter, 14 - Vila Penteado, São Paulo

Você deve:
1. Ir até lá
2. Abrir Google Maps
3. Tocar e segurar no endereço exato
4. Copiar: `-23.482782, -46.758626`
5. Cadastrar no sistema

Pronto! ✅
