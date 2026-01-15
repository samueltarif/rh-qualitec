import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function verificarRelacaoFuncionarioEmpresa() {
  console.log('🔍 Verificando relação entre Funcionários e Empresas...\n')

  // 1. Verificar estrutura da tabela funcionarios
  console.log('📋 ESTRUTURA DA TABELA FUNCIONARIOS:')
  const { data: funcionarios, error: funcError } = await supabase
    .from('funcionarios')
    .select('*')
    .limit(1)

  if (funcError) {
    console.error('❌ Erro ao buscar funcionários:', funcError)
    return
  }

  if (funcionarios && funcionarios.length > 0) {
    const colunas = Object.keys(funcionarios[0])
    console.log('Colunas disponíveis:', colunas.join(', '))
    
    // Verificar se tem empresa_id
    if (colunas.includes('empresa_id')) {
      console.log('✅ Coluna "empresa_id" EXISTE na tabela funcionarios\n')
    } else {
      console.log('❌ Coluna "empresa_id" NÃO EXISTE na tabela funcionarios\n')
      return
    }
  }

  // 2. Buscar todos os funcionários com empresa_id
  console.log('👥 FUNCIONÁRIOS E SUAS EMPRESAS:')
  const { data: todosFuncionarios, error: todosError } = await supabase
    .from('funcionarios')
    .select('id, nome_completo, empresa_id')
    .order('nome_completo')

  if (todosError) {
    console.error('❌ Erro ao buscar funcionários:', todosError)
    return
  }

  console.log(`Total de funcionários: ${todosFuncionarios?.length || 0}\n`)

  // 3. Verificar quantos têm empresa_id definida
  const comEmpresa = todosFuncionarios?.filter(f => f.empresa_id) || []
  const semEmpresa = todosFuncionarios?.filter(f => !f.empresa_id) || []

  console.log(`✅ Com empresa_id: ${comEmpresa.length}`)
  console.log(`⚠️  Sem empresa_id: ${semEmpresa.length}\n`)

  if (semEmpresa.length > 0) {
    console.log('⚠️  Funcionários SEM empresa associada:')
    semEmpresa.forEach(f => {
      console.log(`   - ${f.nome_completo} (ID: ${f.id})`)
    })
    console.log()
  }

  // 4. Buscar empresas disponíveis
  console.log('🏢 EMPRESAS CADASTRADAS:')
  const { data: empresas, error: empError } = await supabase
    .from('empresas')
    .select('*')
    .order('nome_fantasia')

  if (empError) {
    console.error('❌ Erro ao buscar empresas:', empError)
    return
  }

  console.log(`Total de empresas: ${empresas?.length || 0}\n`)
  empresas?.forEach(e => {
    console.log(`   ${e.id}. ${e.nome_fantasia}`)
    console.log(`      CNPJ: ${e.cnpj}`)
  })
  console.log()

  // 5. Testar JOIN entre funcionários e empresas
  console.log('🔗 TESTANDO JOIN FUNCIONARIOS + EMPRESAS:')
  const { data: funcionariosComEmpresa, error: joinError } = await supabase
    .from('funcionarios')
    .select(`
      id,
      nome_completo,
      empresa_id,
      empresa:empresas (
        id,
        nome_fantasia,
        cnpj
      )
    `)
    .not('empresa_id', 'is', null)
    .limit(5)

  if (joinError) {
    console.error('❌ Erro ao fazer JOIN:', joinError)
    return
  }

  console.log(`✅ JOIN funcionou! Mostrando primeiros 5 funcionários:\n`)
  funcionariosComEmpresa?.forEach(f => {
    console.log(`👤 ${f.nome_completo}`)
    console.log(`   Empresa ID: ${f.empresa_id}`)
    if (f.empresa) {
      console.log(`   🏢 ${f.empresa.nome_fantasia}`)
      console.log(`   CNPJ: ${f.empresa.cnpj}`)
    } else {
      console.log(`   ⚠️  Empresa não encontrada`)
    }
    console.log()
  })

  // 6. Estatísticas por empresa
  console.log('📊 ESTATÍSTICAS POR EMPRESA:')
  const estatisticas = new Map()

  comEmpresa.forEach(f => {
    const count = estatisticas.get(f.empresa_id) || 0
    estatisticas.set(f.empresa_id, count + 1)
  })

  for (const [empresaId, count] of estatisticas.entries()) {
    const empresa = empresas?.find(e => e.id === empresaId)
    if (empresa) {
      console.log(`   ${empresa.nome_fantasia}: ${count} funcionário(s)`)
    } else {
      console.log(`   Empresa ID ${empresaId}: ${count} funcionário(s) [EMPRESA NÃO ENCONTRADA]`)
    }
  }

  console.log('\n✅ Verificação concluída!')
}

verificarRelacaoFuncionarioEmpresa()
