#!/bin/bash

# 🚀 Script de Deploy Otimizado para Vercel FREE Plan
# Resolve problema de Edge Function excedendo 1MB

echo "🚀 INICIANDO DEPLOY OTIMIZADO PARA VERCEL FREE PLAN"
echo "=================================================="

# Verificar se estamos na pasta correta
if [ ! -f "nuxt.config.ts" ]; then
    echo "❌ Execute este script na pasta nuxt-app/"
    exit 1
fi

echo "📋 Passo 1: Backup da configuração atual"
if [ -f "nuxt.config.ts" ]; then
    cp nuxt.config.ts nuxt.config.ts.backup
    echo "✅ Backup criado: nuxt.config.ts.backup"
fi

echo "📋 Passo 2: Aplicar configuração otimizada"
if [ -f "nuxt.config.vercel.ts" ]; then
    cp nuxt.config.vercel.ts nuxt.config.ts
    echo "✅ Configuração Node.js aplicada"
else
    echo "❌ Arquivo nuxt.config.vercel.ts não encontrado"
    exit 1
fi

echo "📋 Passo 3: Limpar cache e dependências"
rm -rf .nuxt .output node_modules/.cache
echo "✅ Cache limpo"

echo "📋 Passo 4: Reinstalar dependências otimizadas"
npm ci --production=false
echo "✅ Dependências instaladas"

echo "📋 Passo 5: Build otimizado"
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Erro no build. Restaurando backup..."
    cp nuxt.config.ts.backup nuxt.config.ts
    exit 1
fi
echo "✅ Build concluído com sucesso"

echo "📋 Passo 6: Verificar tamanho do bundle"
if [ -d ".output" ]; then
    BUNDLE_SIZE=$(du -sh .output | cut -f1)
    echo "📊 Tamanho do bundle: $BUNDLE_SIZE"
    
    # Verificar se há funções muito grandes
    if [ -d ".output/server" ]; then
        echo "📊 Tamanhos das funções:"
        find .output/server -name "*.mjs" -exec du -h {} \; | head -10
    fi
fi

echo "📋 Passo 7: Commit e push"
git add .
git status

echo ""
echo "🎯 PRÓXIMOS COMANDOS:"
echo "git commit -m \"fix: otimizar para Vercel FREE plan - Node.js runtime\""
echo "git push"
echo ""
echo "✅ CONFIGURAÇÃO APLICADA COM SUCESSO!"
echo "📊 Mudanças principais:"
echo "   - Edge Functions → Node.js Runtime"
echo "   - Limite: 1MB → 50MB"
echo "   - Bundle otimizado e minificado"
echo "   - Source maps removidos"
echo ""
echo "🚀 Seu projeto agora é compatível com Vercel FREE Plan!"

# Mostrar resumo das configurações
echo ""
echo "📋 RESUMO DAS CONFIGURAÇÕES:"
echo "================================"
echo "Runtime: Node.js 20.x"
echo "Memory: 1024MB"
echo "MaxDuration: 30-60s"
echo "Minify: Ativado"
echo "SourceMaps: Desativado"
echo "Framework: Nuxt.js"
echo ""
echo "🎉 PRONTO PARA DEPLOY!"