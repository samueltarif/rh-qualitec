import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function debugEdicaoHolerite() {
  console.log('🐛 DEBUG: Simulando abertura do modal de edição\n')

  // 1. Buscar holerite do MACIEL CARVALHO (como mostrado no print)
  console.log('1️⃣ Buscando holerite do MACIEL CARVALHO...')
  const { data: holerites, error: holeriteError } = await supabase
    .from('holerites')
    .select(`
      *,
      funcionario:funcionarios!inner (
        id,
        nome_completo,
        cargo:cargos (nome),
        empresa:empresas (nome_fantasia)
      )
    `)
    .ilike('funcionario.nome_completo', '%MACIEL%')
    .limit(1)
    .single()

  if (holeriteError) {
    console.error('❌ Erro ao buscar holerite:', holeriteError)
    return
  }

  console.log('✅ Holerite encontrado:')
  console.log(JSON.stringify(holerites, null, 2))
  console.log()

  // 2. Extrair funcionario_id
  const funcId = holerites.funcionario_id || holerites.funcionario?.id
  console.log('2️⃣ ID do funcionário extraído:', funcId)
  console.log()

  if (!funcId) {
    console.error('❌ PROBLEMA: funcionario_id não encontrado!')
    return
  }

  // 3. Buscar funcionário completo (como faz o componente)
  console.log('3️⃣ Buscando dados completos do funcionário...')
  const { data: funcionario, error: funcError } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('id', funcId)
    .single()

  if (funcError) {
    console.error('❌ Erro ao buscar funcionário:', funcError)
    return
  }

  console.log('✅ Funcionário encontrado:')
  console.log('   Nome:', funcionario.nome_completo)
  console.log('   Empresa ID:', funcionario.empresa_id)
  console.log('   Jornada ID:', funcionario.jornada_id || funcionario.jornada_trabalho_id)
  console.log()

  // 4. Buscar empresa (como faz o componente)
  if (!funcionario.empresa_id) {
    console.error('❌ PROBLEMA: funcionário não tem empresa_id!')
    return
  }

  console.log('4️⃣ Buscando empresa ID:', funcionario.empresa_id)
  const { data: empresa, error: empError } = await supabase
    .from('empresas')
    .select('*')
    .eq('id', funcionario.empresa_id)
    .single()

  if (empError) {
    console.error('❌ Erro ao buscar empresa:', empError)
    console.error('   Detalhes:', empError)
    return
  }

  if (!empresa) {
    console.error('❌ PROBLEMA: Empresa não encontrada!')
    return
  }

  console.log('✅ Empresa encontrada:')
  console.log('   ID:', empresa.id)
  console.log('   Nome Fantasia:', empresa.nome_fantasia)
  console.log('   CNPJ:', empresa.cnpj)
  console.log()

  // 5. Buscar jornada
  const jornadaId = funcionario.jornada_id || funcionario.jornada_trabalho_id
  if (jornadaId) {
    console.log('5️⃣ Buscando jornada ID:', jornadaId)
    const { data: jornada, error: jornadaError } = await supabase
      .from('jornadas_trabalho')
      .select('*')
      .eq('id', jornadaId)
      .single()

    if (jornadaError) {
      console.error('❌ Erro ao buscar jornada:', jornadaError)
    } else {
      const horasSemanais = jornada.horas_semanais || 0
      const horasMensais = Math.round(horasSemanais * 4.33)
      
      console.log('✅ Jornada encontrada:')
      console.log('   Nome:', jornada.nome)
      console.log('   Horas Semanais:', horasSemanais)
      console.log('   Horas Mensais (calculado):', horasMensais)
      console.log()
    }
  }

  // 6. Resumo do que deveria aparecer no modal
  console.log('📋 RESUMO - O que deveria aparecer no modal:')
  console.log('   Funcionário:', funcionario.nome_completo)
  console.log('   Cargo:', holerites.funcionario?.cargo?.nome || 'Não definido')
  console.log('   Empresa:', empresa.nome_fantasia)
  console.log('   CNPJ:', empresa.cnpj)
  console.log()

  console.log('✅ Debug concluído!')
}

debugEdicaoHolerite()
