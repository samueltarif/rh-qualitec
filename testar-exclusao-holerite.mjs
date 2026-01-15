import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testarExclusaoHolerite() {
  console.log('🧪 Testando Sistema de Exclusão de Holerites\n')

  try {
    // 1. Buscar um funcionário ativo
    console.log('1️⃣ Buscando funcionário ativo...')
    const { data: funcionarios, error: funcError } = await supabase
      .from('funcionarios')
      .select('id, nome_completo, salario_base')
      .eq('status', 'ativo')
      .limit(1)

    if (funcError) throw funcError
    if (!funcionarios || funcionarios.length === 0) {
      console.log('❌ Nenhum funcionário ativo encontrado')
      return
    }

    const funcionario = funcionarios[0]
    console.log(`✅ Funcionário: ${funcionario.nome_completo} (ID: ${funcionario.id})`)

    // 2. Criar um holerite de teste
    console.log('\n2️⃣ Criando holerite de teste...')
    const hoje = new Date()
    const periodoInicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
    const periodoFim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`

    const { data: holeriteNovo, error: createError } = await supabase
      .from('holerites')
      .insert({
        funcionario_id: funcionario.id,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        data_pagamento: periodoFim,
        salario_base: funcionario.salario_base || 3000,
        inss: 300,
        irrf: 100,
        total_proventos: funcionario.salario_base || 3000,
        total_descontos: 400,
        salario_liquido: (funcionario.salario_base || 3000) - 400,
        status: 'gerado',
        observacoes: 'Holerite de teste para exclusão'
      })
      .select()
      .single()

    if (createError) {
      if (createError.code === '23505') {
        console.log('⚠️ Holerite já existe para este período')
        
        // Buscar o holerite existente
        const { data: existente } = await supabase
          .from('holerites')
          .select('id')
          .eq('funcionario_id', funcionario.id)
          .eq('periodo_inicio', periodoInicio)
          .eq('periodo_fim', periodoFim)
          .single()

        if (existente) {
          console.log(`✅ Usando holerite existente (ID: ${existente.id})`)
          await testarExclusao(existente.id, funcionario.nome_completo)
        }
        return
      }
      throw createError
    }

    console.log(`✅ Holerite criado (ID: ${holeriteNovo.id})`)
    console.log(`   Período: ${periodoInicio} a ${periodoFim}`)
    console.log(`   Salário Líquido: R$ ${holeriteNovo.salario_liquido.toFixed(2)}`)

    // 3. Testar exclusão
    await testarExclusao(holeriteNovo.id, funcionario.nome_completo)

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

async function testarExclusao(holeriteId, nomeFuncionario) {
  console.log('\n3️⃣ Testando exclusão do holerite...')
  
  // Verificar que existe antes de excluir
  const { data: antes, error: antesError } = await supabase
    .from('holerites')
    .select('id, status')
    .eq('id', holeriteId)
    .single()

  if (antesError) {
    console.log('❌ Holerite não encontrado antes da exclusão')
    return
  }

  console.log(`✅ Holerite encontrado antes da exclusão (Status: ${antes.status})`)

  // Excluir
  const { error: deleteError } = await supabase
    .from('holerites')
    .delete()
    .eq('id', holeriteId)

  if (deleteError) throw deleteError

  console.log('✅ Holerite excluído com sucesso')

  // Verificar que não existe mais
  const { data: depois, error: depoisError } = await supabase
    .from('holerites')
    .select('id')
    .eq('id', holeriteId)
    .single()

  if (depoisError && depoisError.code === 'PGRST116') {
    console.log('✅ Confirmado: Holerite não existe mais no banco')
  } else if (depois) {
    console.log('❌ ERRO: Holerite ainda existe no banco!')
  }

  console.log('\n4️⃣ Testando recriação...')
  
  // Simular recriação
  const hoje = new Date()
  const periodoInicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
  const periodoFim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`

  const { data: holeriteRecriado, error: recriarError } = await supabase
    .from('holerites')
    .insert({
      funcionario_id: antes.funcionario_id || 1,
      periodo_inicio: periodoInicio,
      periodo_fim: periodoFim,
      data_pagamento: periodoFim,
      salario_base: 3000,
      inss: 300,
      irrf: 100,
      total_proventos: 3000,
      total_descontos: 400,
      salario_liquido: 2600,
      status: 'gerado',
      observacoes: 'Holerite recriado após exclusão'
    })
    .select()
    .single()

  if (recriarError) throw recriarError

  console.log(`✅ Holerite recriado com sucesso (Novo ID: ${holeriteRecriado.id})`)
  console.log(`   Funcionário: ${nomeFuncionario}`)
  console.log(`   Status: ${holeriteRecriado.status}`)

  // Limpar - excluir o holerite recriado
  console.log('\n5️⃣ Limpando dados de teste...')
  await supabase
    .from('holerites')
    .delete()
    .eq('id', holeriteRecriado.id)

  console.log('✅ Dados de teste removidos')
}

async function testarGeracaoComRecriar() {
  console.log('\n\n🧪 Testando Geração com Opção de Recriar\n')

  try {
    // Buscar funcionário
    const { data: funcionarios } = await supabase
      .from('funcionarios')
      .select('id, nome_completo')
      .eq('status', 'ativo')
      .limit(1)

    if (!funcionarios || funcionarios.length === 0) {
      console.log('❌ Nenhum funcionário encontrado')
      return
    }

    const funcionario = funcionarios[0]
    const hoje = new Date()
    const periodoInicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
    const periodoFim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-15`

    console.log('1️⃣ Criando holerite inicial...')
    
    // Criar holerite inicial
    const { data: inicial, error: inicialError } = await supabase
      .from('holerites')
      .insert({
        funcionario_id: funcionario.id,
        periodo_inicio: periodoInicio,
        periodo_fim: periodoFim,
        data_pagamento: periodoFim,
        salario_base: 3000,
        inss: 300,
        irrf: 100,
        total_proventos: 3000,
        total_descontos: 400,
        salario_liquido: 2600,
        status: 'gerado',
        observacoes: 'Versão 1'
      })
      .select()
      .single()

    if (inicialError && inicialError.code !== '23505') throw inicialError

    if (inicial) {
      console.log(`✅ Holerite inicial criado (ID: ${inicial.id})`)
      console.log(`   Observações: ${inicial.observacoes}`)

      console.log('\n2️⃣ Simulando recriação (recriar=true)...')

      // Verificar se existe
      const { data: existente } = await supabase
        .from('holerites')
        .select('id')
        .eq('funcionario_id', funcionario.id)
        .eq('periodo_inicio', periodoInicio)
        .eq('periodo_fim', periodoFim)
        .single()

      if (existente) {
        console.log(`✅ Holerite existente encontrado (ID: ${existente.id})`)
        
        // Excluir o antigo
        await supabase
          .from('holerites')
          .delete()
          .eq('id', existente.id)

        console.log('✅ Holerite antigo excluído')

        // Criar novo
        const { data: novo } = await supabase
          .from('holerites')
          .insert({
            funcionario_id: funcionario.id,
            periodo_inicio: periodoInicio,
            periodo_fim: periodoFim,
            data_pagamento: periodoFim,
            salario_base: 3500, // Valor diferente
            inss: 350,
            irrf: 120,
            total_proventos: 3500,
            total_descontos: 470,
            salario_liquido: 3030,
            status: 'gerado',
            observacoes: 'Versão 2 - Recriado'
          })
          .select()
          .single()

        console.log(`✅ Novo holerite criado (ID: ${novo.id})`)
        console.log(`   Observações: ${novo.observacoes}`)
        console.log(`   Salário Base: R$ ${novo.salario_base.toFixed(2)} (era R$ 3000.00)`)

        // Limpar
        console.log('\n3️⃣ Limpando dados de teste...')
        await supabase
          .from('holerites')
          .delete()
          .eq('id', novo.id)

        console.log('✅ Dados de teste removidos')
      }
    } else {
      console.log('⚠️ Holerite já existia, pulando teste')
    }

  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

// Executar testes
console.log('═══════════════════════════════════════════════════════')
console.log('  TESTE DE EXCLUSÃO E RECRIAÇÃO DE HOLERITES')
console.log('═══════════════════════════════════════════════════════\n')

await testarExclusaoHolerite()
await testarGeracaoComRecriar()

console.log('\n═══════════════════════════════════════════════════════')
console.log('  ✅ TESTES CONCLUÍDOS')
console.log('═══════════════════════════════════════════════════════\n')
