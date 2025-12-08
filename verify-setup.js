#!/usr/bin/env node

/**
 * Script de Verificação da Configuração
 * Sistema RH Qualitec
 */

import { readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🔍 Verificando configuração do Sistema RH Qualitec...\n')

let errors = 0
let warnings = 0

// Verificar arquivos essenciais
const requiredFiles = [
  '.env',
  'nuxt.config.ts',
  'tailwind.config.ts',
  'app/assets/css/tailwind.css',
  'package.json'
]

console.log('📁 Verificando arquivos essenciais...')
requiredFiles.forEach(file => {
  const filePath = join(__dirname, file)
  if (existsSync(filePath)) {
    console.log(`  ✅ ${file}`)
  } else {
    console.log(`  ❌ ${file} - AUSENTE`)
    errors++
  }
})

// Verificar variáveis de ambiente
console.log('\n🔐 Verificando variáveis de ambiente...')
try {
  const envContent = readFileSync(join(__dirname, '.env'), 'utf-8')
  
  const requiredVars = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY',
    'NUXT_PUBLIC_SUPABASE_URL',
    'NUXT_PUBLIC_SUPABASE_KEY'
  ]
  
  requiredVars.forEach(varName => {
    if (envContent.includes(`${varName}=`)) {
      const value = envContent.match(new RegExp(`${varName}=(.+)`))?.[1]
      if (value && value.trim() && !value.includes('seu-projeto') && !value.includes('sua-chave')) {
        console.log(`  ✅ ${varName}`)
      } else {
        console.log(`  ⚠️  ${varName} - Valor não configurado`)
        warnings++
      }
    } else {
      console.log(`  ❌ ${varName} - AUSENTE`)
      errors++
    }
  })
  
  // Verificar DATABASE_URL
  if (envContent.includes('[YOUR-PASSWORD]')) {
    console.log('  ⚠️  DATABASE_URL - Senha não configurada (substitua [YOUR-PASSWORD])')
    warnings++
  }
} catch (error) {
  console.log('  ❌ Erro ao ler .env:', error.message)
  errors++
}

// Verificar package.json
console.log('\n📦 Verificando dependências...')
try {
  const packageJson = JSON.parse(readFileSync(join(__dirname, 'package.json'), 'utf-8'))
  
  const requiredDeps = [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@supabase/supabase-js',
    '@nuxt/icon',
    'nuxt',
    'vue'
  ]
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies?.[dep]) {
      console.log(`  ✅ ${dep}`)
    } else {
      console.log(`  ❌ ${dep} - AUSENTE`)
      errors++
    }
  })
  
  // Verificar devDependencies
  if (packageJson.devDependencies?.['@playwright/test']) {
    console.log(`  ✅ @playwright/test (dev)`)
  } else {
    console.log(`  ⚠️  @playwright/test - Recomendado para testes`)
    warnings++
  }
} catch (error) {
  console.log('  ❌ Erro ao ler package.json:', error.message)
  errors++
}

// Verificar nuxt.config.ts
console.log('\n⚙️  Verificando nuxt.config.ts...')
try {
  const nuxtConfig = readFileSync(join(__dirname, 'nuxt.config.ts'), 'utf-8')
  
  if (nuxtConfig.includes('@nuxtjs/supabase')) {
    console.log('  ✅ Módulo Supabase configurado')
  } else {
    console.log('  ❌ Módulo Supabase não encontrado')
    errors++
  }
  
  if (nuxtConfig.includes('runtimeConfig')) {
    console.log('  ✅ Runtime config presente')
  } else {
    console.log('  ⚠️  Runtime config não encontrado')
    warnings++
  }
} catch (error) {
  console.log('  ❌ Erro ao ler nuxt.config.ts:', error.message)
  errors++
}

// Resumo
console.log('\n' + '='.repeat(50))
console.log('📊 RESUMO DA VERIFICAÇÃO')
console.log('='.repeat(50))

if (errors === 0 && warnings === 0) {
  console.log('✅ Tudo configurado corretamente!')
  console.log('\n🚀 Próximos passos:')
  console.log('   1. npm install')
  console.log('   2. Executar migrations no Supabase')
  console.log('   3. npm run dev')
} else {
  if (errors > 0) {
    console.log(`❌ ${errors} erro(s) encontrado(s)`)
  }
  if (warnings > 0) {
    console.log(`⚠️  ${warnings} aviso(s) encontrado(s)`)
  }
  console.log('\n📖 Consulte SETUP.md para mais informações')
}

console.log('='.repeat(50) + '\n')

process.exit(errors > 0 ? 1 : 0)
