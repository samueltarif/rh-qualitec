import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function atualizarNomeFantasia() {
  console.log('🔧 Atualizando nome_fantasia da empresa ID 9...\n')

  // Atualizar nome_fantasia com o valor do campo nome
  const { data, error } = await supabase
    .from('empresas')
    .update({ nome_fantasia: 'WHITE MARTINS GASES INDUSTRIAIS LTDA' })
    .eq('id', 9)
    .select()

  if (error) {
    console.error('❌ Erro ao atualizar:', error)
    return
  }

  console.log('✅ Empresa atualizada com sucesso!')
  console.log(JSON.stringify(data, null, 2))
}

atualizarNomeFantasia()
