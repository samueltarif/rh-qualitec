import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function corrigirEmpresaSemNome() {
  console.log('🔧 Corrigindo empresa sem nome fantasia...\n')

  // 1. Buscar empresa ID 9
  const { data: empresa, error: empError } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', 9)
    .single()

  if (empError) {
    console.error('❌ Erro ao buscar empresa:', empError)
    return
  }

  console.log('📋 Empresa atual:')
  console.log(JSON.stringify(empresa, null, 2))
  console.log()

  // 2. Verificar se tem nome_fantasia
  if (!empresa.nome_fantasia) {
    console.log('⚠️  Empresa sem nome_fantasia!')
    console.log('CNPJ:', empresa.cnpj)
    
    // Vamos buscar o nome pela API de CNPJ
    console.log('\n🔍 Consultando CNPJ na Receita Federal...')
    
    try {
      const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${empresa.cnpj.replace(/\D/g, '')}`)
      const dados = await response.json()
      
      if (dados.nome_fantasia || dados.razao_social) {
        const nomeFantasia = dados.nome_fantasia || dados.razao_social
        
        console.log('✅ Nome encontrado:', nomeFantasia)
        console.log('\n📝 Atualizando empresa...')
        
        const { error: updateError } = await supabase
          .from('empresas')
          .update({ nome_fantasia: nomeFantasia })
          .eq('id', 9)
        
        if (updateError) {
          console.error('❌ Erro ao atualizar:', updateError)
        } else {
          console.log('✅ Empresa atualizada com sucesso!')
          console.log('   Nome Fantasia:', nomeFantasia)
        }
      } else {
        console.log('⚠️  Nome não encontrado na API')
        console.log('Dados retornados:', JSON.stringify(dados, null, 2))
      }
    } catch (error) {
      console.error('❌ Erro ao consultar API:', error)
    }
  } else {
    console.log('✅ Empresa já tem nome_fantasia:', empresa.nome_fantasia)
  }
}

corrigirEmpresaSemNome()
