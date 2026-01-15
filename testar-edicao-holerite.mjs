import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.NUXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
)

async function testarEdicaoHolerite() {
  console.log('🧪 Testando fluxo de edição de holerite...\n')

  // 1. Simular busca de holerite da API (como faz a página)
  const { data: holerites, error: holeriteError } = await supabase
    .from('holerites')
    .select(`
      *,
      funcionario:funcionarios!funcionario_id (
        id,
        nome_completo,
        cargo,
        empresa_id,
        jornada_id,
        jornada_trabalho_id
      )
    `)
    .limit(1)
    .single()

  if (holeriteError) {
    console.error('❌ Erro ao buscar holerite:', holeriteError)
    return
  }

  console.log('📄 Holerite carregado pela API:')
  console.log(JSON.stringify(holerites, null, 2))
  console.log()

  // 2. Simular o que o componente HoleriteEditForm faz
  console.log('🔄 Simulando carregamento de dados adicionais...\n')

  const funcId = holerites.funcionario_id || holerites.funcionario?.id
  console.log('👤 ID do funcionário:', funcId)

  if (funcId) {
    // Buscar funcionário completo
    const { data: funcionario, error: funcError } = await supabase
      .from('funcionarios')
      .select('*')
      .eq('id', funcId)
      .single()

    if (funcError) {
      console.error('❌ Erro ao buscar funcionário:', funcError)
    } else {
      console.log('✅ Funcionário completo:')
      console.log('  Nome:', funcionario.nome_completo)
      console.log('  Empresa ID:', funcionario.empresa_id)
      console.log('  Jornada ID:', funcionario.jornada_id || funcionario.jornada_trabalho_id)
      console.log()

      // Buscar empresa
      if (funcionario.empresa_id) {
        const { data: empresa, error: empError } = await supabase
          .from('empresas')
          .select('*')
          .eq('id', funcionario.empresa_id)
          .single()

        if (empError) {
          console.error('❌ Erro ao buscar empresa:', empError)
        } else {
          console.log('🏢 Empresa carregada:')
          console.log('  Nome Fantasia:', empresa.nome_fantasia)
          console.log('  Razão Social:', empresa.razao_social)
          console.log('  CNPJ:', empresa.cnpj)
          console.log()
        }
      }

      // Buscar jornada
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
          const horasSemanais = jornada.horas_semanais || 0
          const horasMensais = Math.round(horasSemanais * 4.33)
          
          console.log('⏰ Jornada carregada:')
          console.log('  Nome:', jornada.nome)
          console.log('  Horas Semanais:', horasSemanais)
          console.log('  Horas Mensais (calculado):', horasMensais)
          console.log()
          
          console.log('📊 Valor a ser exibido no campo "Horas Trabalhadas":')
          console.log('  Valor atual no holerite:', holerites.horas_trabalhadas || 'null')
          console.log('  Valor padrão calculado:', horasMensais)
          console.log('  Valor final:', holerites.horas_trabalhadas || horasMensais)
        }
      }
    }
  }

  console.log('\n✅ Teste concluído!')
}

testarEdicaoHolerite()
