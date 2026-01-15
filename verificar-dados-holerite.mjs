import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function verificarDadosHolerite() {
  console.log('🔍 Verificando dados para edição de holerite...\n')

  // 1. Buscar um holerite de exemplo
  const { data: holerites, error: holeriteError } = await supabase
    .from('holerites')
    .select('*')
    .limit(1)
    .single()

  if (holeriteError) {
    console.error('❌ Erro ao buscar holerite:', holeriteError)
    return
  }

  console.log('📄 Holerite encontrado:')
  console.log('  ID:', holerites.id)
  console.log('  Funcionário ID:', holerites.funcionario_id)
  console.log('  Mês/Ano:', holerites.mes_referencia, '/', holerites.ano_referencia)
  console.log('  Horas Trabalhadas:', holerites.horas_trabalhadas)
  console.log()

  // 2. Buscar dados do funcionário
  const { data: funcionario, error: funcError } = await supabase
    .from('funcionarios')
    .select('*')
    .eq('id', holerites.funcionario_id)
    .single()

  if (funcError) {
    console.error('❌ Erro ao buscar funcionário:', funcError)
    return
  }

  console.log('👤 Funcionário:')
  console.log('  Nome:', funcionario.nome_completo)
  console.log('  Cargo:', funcionario.cargo)
  console.log('  Empresa ID:', funcionario.empresa_id)
  console.log('  Jornada ID:', funcionario.jornada_id || funcionario.jornada_trabalho_id)
  console.log()

  // 3. Buscar dados da empresa
  if (funcionario.empresa_id) {
    const { data: empresa, error: empError } = await supabase
      .from('empresas')
      .select('*')
      .eq('id', funcionario.empresa_id)
      .single()

    if (empError) {
      console.error('❌ Erro ao buscar empresa:', empError)
    } else {
      console.log('🏢 Empresa:')
      console.log('  Nome Fantasia:', empresa.nome_fantasia)
      console.log('  Razão Social:', empresa.razao_social)
      console.log('  CNPJ:', empresa.cnpj)
      console.log()
    }
  }

  // 4. Buscar dados da jornada
  const jornadaId = funcionario.jornada_id || funcionario.jornada_trabalho_id
  if (jornadaId) {
    const { data: jornada, error: jornadaError } = await supabase
      .from('jornadas_trabalho')
      .select('*')
      .eq('id', jornadaId)
      .single()

    if (jornadaError) {
      console.error('❌ Erro ao buscar jornada:', jornadaError)
    } else {
      console.log('⏰ Jornada de Trabalho:')
      console.log('  Nome:', jornada.nome)
      console.log('  Horas Semanais:', jornada.horas_semanais)
      console.log('  Horas Mensais (calculado):', Math.round(jornada.horas_semanais * 4.33))
      console.log()
    }
  }

  console.log('✅ Verificação concluída!')
}

verificarDadosHolerite()
