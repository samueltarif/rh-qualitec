# 📍 Guia: Como Cadastrar Locais de Ponto

## Passo 1: Pegar Coordenadas no Google Maps

### Opção A - Pelo Site (Mais Fácil)
1. Abra [Google Maps](https://maps.google.com)
2. Procure o endereço da sua empresa
3. **Clique com botão direito** no local exato
4. Clique em **"O que há aqui?"**
5. As coordenadas aparecem embaixo (ex: `-23.550520, -46.633308`)
6. Clique nas coordenadas para copiar

### Opção B - Pela URL
1. Abra o Google Maps no local desejado
2. Copie a URL da barra de endereço
3. Exemplo: `https://www.google.com/maps/@-23.550520,-46.633308,17z`
4. As coordenadas estão depois do `@`:
   - **Latitude**: `-23.550520` (primeiro número)
   - **Longitude**: `-46.633308` (segundo número)

### Opção C - No Celular
1. Abra o app Google Maps
2. **Toque e segure** no local desejado
3. Um pin vermelho aparece
4. Arraste a tela para cima
5. As coordenadas aparecem no topo
6. Toque para copiar

---

## Passo 2: Cadastrar no Sistema

### 1. Acesse a Página de Configuração
```
http://localhost:3000/configuracoes/locais-ponto
```

### 2. Clique em "Novo Local"

### 3. Preencha os Dados

**Exemplo - Sede Qualitec:**
```
Nome: Sede Qualitec
Descrição: Escritório principal - Rua Exemplo, 123
Latitude: -23.550520
Longitude: -46.633308
Raio permitido: 30 metros
✅ Local ativo
```

### 4. Clique em "Salvar"

---

## 📏 Sobre o Raio de Distância

### Raios Recomendados:
- **30-50m**: Escritórios pequenos
- **100m**: Prédios comerciais
- **200-500m**: Campus ou áreas grandes
- **1000m**: Áreas industriais

### ⚠️ Importante:
- GPS tem precisão de **5-50 metros**
- Em ambientes fechados, pode variar mais
- Recomendo começar com **50-100m** e ajustar depois

---

## 🎯 Exemplo Prático

### Qualitec - Sede São Paulo
```
Nome: Sede Qualitec SP
Descrição: Av. Paulista, 1000 - Bela Vista
Latitude: -23.561414
Longitude: -46.656130
Raio: 30 metros
Status: Ativo
```

### Qualitec - Filial Rio de Janeiro
```
Nome: Filial Qualitec RJ
Descrição: Av. Rio Branco, 500 - Centro
Latitude: -22.906847
Longitude: -43.172896
Raio: 30 metros
Status: Ativo
```

---

## ✅ Validação GPS Obrigatória

### O sistema agora:
1. ✅ **Exige GPS ligado** - Não permite bater ponto sem localização
2. ✅ **Mostra distância** - Informa quantos metros está do local
3. ✅ **Feedback visual**:
   - 🟢 Verde: Dentro do raio (permitido)
   - 🟡 Amarelo: Fora do raio (registra mas marca como irregular)
   - 🔴 Vermelho: GPS desligado (bloqueia)

### Mensagens de Erro:
- **"Permissão negada"**: Usuário precisa habilitar localização no navegador
- **"GPS desligado"**: Dispositivo sem sinal GPS/Wi-Fi
- **"Timeout"**: Sinal GPS fraco, tentar novamente

---

## 🔒 Segurança e Privacidade

### O que é armazenado:
- ✅ Coordenadas apenas no momento do registro
- ✅ Distância calculada do local mais próximo
- ✅ Identificação do local usado

### O que NÃO é armazenado:
- ❌ Rastreamento contínuo
- ❌ Histórico de movimentação
- ❌ Localização fora do horário de ponto

---

## 📱 Requisitos do Funcionário

### Para bater ponto com geolocalização:
1. ✅ GPS ligado no celular/computador
2. ✅ Permissão de localização habilitada no navegador
3. ✅ Conexão com internet
4. ✅ HTTPS (já configurado no sistema)

### Navegadores Compatíveis:
- ✅ Chrome (Android/iOS/Desktop)
- ✅ Safari (iOS/macOS)
- ✅ Firefox (Android/Desktop)
- ✅ Edge (Desktop)

---

## 🆘 Problemas Comuns

### "Permissão de localização negada"
**Solução:**
1. Clique no ícone de cadeado na barra de endereço
2. Habilite "Localização"
3. Recarregue a página

### "Localização indisponível"
**Solução:**
1. Verifique se GPS está ligado
2. Saia de ambientes fechados (se possível)
3. Aguarde alguns segundos para sinal GPS

### "Fora do raio permitido"
**Solução:**
1. Verifique se está no local correto
2. Aguarde alguns segundos (GPS pode estar calibrando)
3. Se persistir, contate o RH para ajustar o raio

---

## 📊 Relatórios Disponíveis

### Após implementar, você pode:
1. Ver quais funcionários bateram ponto fora do raio
2. Verificar distância média por local
3. Identificar padrões irregulares
4. Exportar dados para auditoria

---

## 🎓 Dicas Profissionais

### 1. Teste Primeiro
- Cadastre o local
- Teste você mesmo batendo ponto
- Ajuste o raio se necessário

### 2. Comunique a Equipe
- Avise sobre a nova funcionalidade
- Explique como habilitar GPS
- Tire dúvidas antecipadamente

### 3. Seja Flexível Inicialmente
- Comece com raio maior (100m)
- Monitore por 1-2 semanas
- Ajuste conforme necessário

### 4. Considere Exceções
- Home office (sem validação de local)
- Trabalho externo (múltiplos locais)
- Cargos específicos (vendedores, técnicos)

---

## 📞 Próximos Passos

1. ✅ Execute a migration `30_locais_ponto.sql`
2. ✅ Cadastre seus locais
3. ✅ Teste com sua conta
4. ✅ Libere para equipe
5. ✅ Monitore primeiros dias

**Pronto para começar!** 🚀
