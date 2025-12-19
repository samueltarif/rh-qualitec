# 🚀 Deploy no Vercel - Sistema RH Qualitec

## ✅ Correções Implementadas

### 1. **Runtime Edge → Node.js**
- ❌ **Antes**: `preset: 'vercel-edge'` (muito restritivo)
- ✅ **Agora**: `preset: 'vercel'` (Node.js padrão)

### 2. **Timeout Otimizado**
- ⏱️ **Timeout**: Aumentado para 60 segundos
- 🔄 **Processamento em Lotes**: APIs pesadas processam em lotes de 5 itens
- ⚠️ **Timeout Preventivo**: Interrompe processamento aos 45s para evitar erro

### 3. **Importações Condicionais**
- 📦 **PDF/Email**: Bibliotecas carregadas apenas quando necessário
- 🖥️ **Client-Side**: jsPDF e html2canvas só no navegador
- 🔧 **Server-Safe**: Nodemailer com importação assíncrona

### 4. **Monitoramento e Diagnóstico**
- 📊 **Logs Estruturados**: Informações detalhadas do Vercel
- 🔍 **Análise de Erros**: Diagnóstico automático de problemas
- ⚡ **Performance**: Monitoramento de APIs lentas

## 🔧 Configurações do Vercel

### vercel.json
```json
{
  "version": 2,
  "functions": {
    ".output/server/**/*.mjs": {
      "maxDuration": 60
    }
  }
}
```

### Variáveis de Ambiente Necessárias
```bash
# Supabase
NUXT_PUBLIC_SUPABASE_URL=sua_url_supabase
NUXT_PUBLIC_SUPABASE_KEY=sua_chave_publica
SUPABASE_SERVICE_ROLE_KEY=sua_chave_servico

# Gmail (opcional)
GMAIL_EMAIL=seu_email@gmail.com
GMAIL_APP_PASSWORD=sua_senha_app

# Outros
EMAIL_JOBS_TOKEN=token_seguro_jobs
```

## 📋 Checklist de Deploy

### Antes do Deploy
- [ ] Verificar se todas as variáveis de ambiente estão configuradas
- [ ] Testar localmente com `npm run build`
- [ ] Verificar se não há imports problemáticos
- [ ] Confirmar que o banco Supabase está acessível

### Durante o Deploy
- [ ] Monitorar logs do Vercel
- [ ] Verificar se o build completa sem erros
- [ ] Testar as principais funcionalidades

### Após o Deploy
- [ ] Testar login/logout
- [ ] Verificar geração de holerites (máximo 5 por vez)
- [ ] Testar envio de emails
- [ ] Verificar relatórios PDF

## 🚨 Troubleshooting

### Erro: FUNCTION_INVOCATION_FAILED
1. **Verificar Logs**: Vá em Vercel → Projeto → Functions → Logs
2. **Timeout**: Se for timeout, reduza o processamento em lotes
3. **Memória**: Verifique se não há vazamentos de memória
4. **Imports**: Confirme que todas as bibliotecas são compatíveis

### Erro: Module Not Found
1. **Dependencies**: Execute `npm install` novamente
2. **Imports**: Verifique se todos os imports estão corretos
3. **Build**: Limpe o cache com `rm -rf .nuxt .output`

### APIs Lentas
1. **Lotes Menores**: Reduza BATCH_SIZE de 5 para 3
2. **Timeout**: Ajuste timeout preventivo de 45s para 30s
3. **Cache**: Implemente cache para consultas frequentes

## 📊 Monitoramento

### Logs Importantes
```bash
# Sucesso
✅ [VERCEL] Operação concluída em 1234ms

# Warning
⚠️ [VERCEL] API lenta: /api/holerites/gerar took 30000ms

# Erro
❌ [VERCEL] Timeout preventivo após 45s
```

### Métricas a Acompanhar
- **Duração das Functions**: < 45 segundos
- **Taxa de Erro**: < 5%
- **Uso de Memória**: < 512MB
- **Cold Start**: < 3 segundos

## 🔄 Atualizações Futuras

### Performance
- [ ] Implementar cache Redis
- [ ] Otimizar queries do Supabase
- [ ] Usar Edge Functions para operações simples

### Funcionalidades
- [ ] Queue system para processamento pesado
- [ ] Webhooks para notificações
- [ ] API rate limiting

## 📞 Suporte

Em caso de problemas:
1. Verificar logs do Vercel
2. Consultar este documento
3. Testar localmente primeiro
4. Verificar status do Supabase

---

**Sistema RH Qualitec v2025.1**  
Nuxt 4 + Supabase + Tailwind CSS  
Deploy otimizado para Vercel