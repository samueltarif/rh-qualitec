#!/usr/bin/env node

/**
 * Script de verificação pré-deploy para Vercel
 * Verifica se o projeto está pronto para deploy sem erros
 */

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificação Pré-Deploy - Sistema RH Qualitec\n')

let hasErrors = false
let hasWarnings = false

// Verificar arquivos essenciais
const essentialFiles = [
  'nuxt.config.ts',
  'package.json',
  'vercel.json',
  '.env'
]

console.log('📁 Verificando arquivos essenciais...')
essentialFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`)
  } else {
    console.log(`❌ ${file} - AUSENTE`)
    if (file !== '.env') hasErrors = true
    else hasWarnings = true
  }
})

// Verificar configuração do Nuxt
console.log('\n⚙️ Verificando nuxt.config.ts...')
try {
  const nuxtConfig = fs.readFileSync('nuxt.config.ts', 'utf8')
  
  if (nuxtConfig.includes('vercel-edge')) {
    console.log('❌ Usando vercel-edge (problemático)')
    hasErrors = true
  } else if (nuxtConfig.includes("preset: 'vercel'")) {
    console.log('✅ Usando preset vercel (Node.js)')
  } else {
    console.log('⚠️ Preset não especificado')
    hasWarnings = true
  }
  
  if (nuxtConfig.includes('wasm: true')) {
    console.log('⚠️ WASM habilitado (pode causar problemas)')
    hasWarnings = true
  }
} catch (error) {
  console.log('❌ Erro ao ler nuxt.config.ts')
  hasErrors = true
}

// Verificar vercel.json
console.log('\n🚀 Verificando vercel.json...')
try {
  const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'))
  
  if (vercelConfig.functions && vercelConfig.functions['.output/server/**/*.mjs']) {
    const maxDuration = vercelConfig.functions['.output/server/**/*.mjs'].maxDuration
    if (maxDuration >= 60) {
      console.log(`✅ Timeout configurado: ${maxDuration}s`)
    } else {
      console.log(`⚠️ Timeout baixo: ${maxDuration}s (recomendado: 60s)`)
      hasWarnings = true
    }
  } else {
    console.log('❌ Configuração de timeout ausente')
    hasErrors = true
  }
} catch (error) {
  console.log('❌ Erro ao ler vercel.json')
  hasErrors = true
}

// Verificar package.json
console.log('\n📦 Verificando dependências...')
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  
  const requiredDeps = [
    'nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    'jspdf',
    'nodemailer'
  ]
  
  requiredDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`✅ ${dep}`)
    } else {
      console.log(`❌ ${dep} - AUSENTE`)
      hasErrors = true
    }
  })
} catch (error) {
  console.log('❌ Erro ao ler package.json')
  hasErrors = true
}

// Verificar imports problemáticos
console.log('\n🔍 Verificando imports problemáticos...')
const checkImports = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true })
  
  files.forEach(file => {
    if (file.isDirectory() && file.name !== 'node_modules' && file.name !== '.git') {
      checkImports(path.join(dir, file.name))
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.vue')) {
      const filePath = path.join(dir, file.name)
      const content = fs.readFileSync(filePath, 'utf8')
      
      // Verificar imports síncronos problemáticos
      if (content.includes("import jsPDF from 'jspdf'") && !content.includes('process.client')) {
        console.log(`⚠️ ${filePath} - Import síncrono de jsPDF`)
        hasWarnings = true
      }
      
      if (content.includes("import nodemailer from 'nodemailer'") && !content.includes('await import')) {
        console.log(`⚠️ ${filePath} - Import síncrono de nodemailer`)
        hasWarnings = true
      }
    }
  })
}

try {
  checkImports('.')
  console.log('✅ Verificação de imports concluída')
} catch (error) {
  console.log('⚠️ Erro na verificação de imports')
  hasWarnings = true
}

// Verificar variáveis de ambiente
console.log('\n🔐 Verificando variáveis de ambiente...')
const requiredEnvVars = [
  'NUXT_PUBLIC_SUPABASE_URL',
  'NUXT_PUBLIC_SUPABASE_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
]

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8')
  
  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`✅ ${envVar}`)
    } else {
      console.log(`❌ ${envVar} - AUSENTE`)
      hasErrors = true
    }
  })
} else {
  console.log('⚠️ Arquivo .env não encontrado (configure no Vercel)')
  hasWarnings = true
}

// Resultado final
console.log('\n' + '='.repeat(50))
console.log('📊 RESULTADO DA VERIFICAÇÃO')
console.log('='.repeat(50))

if (hasErrors) {
  console.log('❌ FALHOU - Corrija os erros antes do deploy')
  process.exit(1)
} else if (hasWarnings) {
  console.log('⚠️ PASSOU COM AVISOS - Deploy possível, mas verifique os avisos')
  process.exit(0)
} else {
  console.log('✅ PASSOU - Pronto para deploy!')
  process.exit(0)
}