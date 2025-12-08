# Sistema de Geolocalização para Ponto

## ✅ Implementado

Sistema completo de controle de ponto por geolocalização com validação de raio de distância.

## 🎯 Funcionalidades

### 1. Controle de Locais Permitidos
- Cadastro de múltiplos locais permitidos
- Configuração de raio de distância (em metros)
- Ativação/desativação de locais
- Coordenadas GPS (latitude/longitude)

### 2. Validação em Tempo Real
- Captura automática de localização do funcionário
- Cálculo de distância usando fórmula de Haversine
- Verificação se está dentro do raio permitido
- Feedback visual imediato

### 3. Registro com Geolocalização
- Armazena coordenadas de cada batida
- Identifica o local mais próximo
- Marca registros fora do raio
- Calcula distância exata

## 📁 Arquivos Criados

### Database
- `database/migrations/30_locais_ponto.sql` - Tabelas e funções

### API Endpoints
- `server/api/locais-ponto/index.get.ts` - Listar locais
- `server/api/locais-ponto/index.post.ts` - Criar local
- `server/api/locais-ponto/verificar.post.ts` - Verificar localização
- `server/api/funcionario/ponto/registrar.post.ts` - Atualizado com geo

### Frontend
- `app/composables/useGeolocalizacao.ts` - Composable de geolocalização
- `app/components/ButtonBaterPontoGeo.vue` - Botão com validação
- `app/pages/configuracoes/locais-ponto.vue` - Gerenciamento de locais

## 🚀 Como Usar

### 1. Executar Migration
```sql
-- Execute no Supabase SQL Editor
-- Arquivo: database/migrations/30_locais_ponto.sql
```

### 2. Cadastrar Locais Permitidos
- Acesse: `/configuracoes/locais-ponto`
- Clique em "Novo Local"
- Preencha:
  - Nome (ex: "Sede Qualitec")
  - Latitude e Longitude
  - Raio em metros (ex: 100)
  - Marque como ativo

### 3. Usar no Portal do Funcionário
```vue
<template>
  <ButtonBaterPontoGeo @sucesso="atualizarRegistros" />
</template>
```

## 🔧 Tecnologias Utilizadas

### 1. Geolocation API (Nativa)
```javascript
navigator.geolocation.getCurrentPosition()
```
- Não precisa de API externa
- Funciona em todos navegadores modernos
- Requer permissão do usuário

### 2. Fórmula de Haversine
```sql
CREATE FUNCTION calcular_distancia_metros(...)
```
- Cálculo preciso de distância
- Considera curvatura da Terra
- Resultado em metros

### 3. PostgreSQL + PostGIS (opcional)
- Funções geográficas nativas
- Índices espaciais
- Performance otimizada

## 📊 Estrutura do Banco

### Tabela: locais_ponto
```sql
- id (UUID)
- nome (VARCHAR)
- descricao (TEXT)
- latitude (DECIMAL)
- longitude (DECIMAL)
- raio_metros (INTEGER)
- ativo (BOOLEAN)
```

### Tabela: registros_ponto (novos campos)
```sql
- latitude (DECIMAL)
- longitude (DECIMAL)
- local_id (UUID)
- distancia_metros (INTEGER)
- fora_do_raio (BOOLEAN)
```

## 🎨 Fluxo de Uso

1. **Funcionário clica em "Bater Ponto"**
2. **Sistema solicita permissão de localização**
3. **Captura coordenadas GPS**
4. **Verifica local mais próximo**
5. **Calcula distância**
6. **Mostra feedback visual:**
   - ✅ Verde: Dentro do raio
   - ⚠️ Amarelo: Fora do raio (mas permite)
7. **Registra ponto com coordenadas**

## 🔒 Segurança

### Permissões
- Apenas admins gerenciam locais
- Funcionários só visualizam locais ativos
- RLS aplicado em todas tabelas

### Validações
- Coordenadas obrigatórias
- Raio mínimo: 10m
- Raio máximo: 5000m
- Validação de UUID

## 📱 Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Edge (desktop e mobile)
- ✅ Firefox (desktop e mobile)
- ✅ Safari (iOS e macOS)
- ✅ Opera

### Requisitos
- HTTPS obrigatório (exceto localhost)
- Permissão de localização habilitada
- GPS/Wi-Fi ativo no dispositivo

## 🎯 Casos de Uso

### 1. Múltiplos Escritórios
```sql
INSERT INTO locais_ponto VALUES
  ('Sede SP', -23.550520, -46.633308, 100),
  ('Filial RJ', -22.906847, -43.172896, 150),
  ('Home Office', NULL, NULL, 0); -- Sem validação
```

### 2. Raios Diferentes
- Escritório pequeno: 50m
- Campus grande: 500m
- Área industrial: 1000m

### 3. Horários Flexíveis
- Combinar com jornadas de trabalho
- Validar apenas em horários específicos
- Exceções para cargos específicos

## 📈 Relatórios Disponíveis

### Pontos Fora do Raio
```sql
SELECT * FROM registros_ponto
WHERE fora_do_raio = true
ORDER BY data DESC;
```

### Distância Média por Local
```sql
SELECT 
  l.nome,
  AVG(r.distancia_metros) as distancia_media
FROM registros_ponto r
JOIN locais_ponto l ON l.id = r.local_id
GROUP BY l.nome;
```

## 🔄 Próximos Passos

### Melhorias Futuras
- [ ] Mapa interativo para selecionar coordenadas
- [ ] Histórico de localizações
- [ ] Alertas para registros suspeitos
- [ ] Integração com Google Maps
- [ ] Geofencing automático
- [ ] Validação por horário
- [ ] Exceções por cargo/função

## 📝 Notas Importantes

1. **Precisão GPS**: Varia de 5-50m dependendo do dispositivo
2. **Consumo de Bateria**: Mínimo (apenas no momento do registro)
3. **Privacidade**: Coordenadas armazenadas apenas no registro
4. **Offline**: Não funciona sem conexão
5. **HTTPS**: Obrigatório para Geolocation API

## 🆘 Troubleshooting

### Erro: "Permissão negada"
- Usuário negou acesso à localização
- Orientar a habilitar nas configurações do navegador

### Erro: "Localização indisponível"
- GPS desligado
- Sem sinal GPS/Wi-Fi
- Tentar novamente

### Erro: "Timeout"
- Sinal GPS fraco
- Aumentar timeout nas configurações

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar permissões do navegador
2. Testar em HTTPS
3. Verificar console do navegador
4. Consultar logs do servidor
