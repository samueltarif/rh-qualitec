import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  try {
    const supabase = serverSupabaseServiceRole(event)

    console.log('🔧 Executando correção do CARLOS...')

    // 1. Verificar empresa do CARLOS
    const { data: empresaCarlos } = await supabase
      .from('colaboradores')
      .select('id, nome, empresa_id')
      .eq('id', 'c79f679a-147a-47c1-9344-83833507adb0')
      .single()

    console.log('📋 Empresa do CARLOS:', empresaCarlos)

    // 2. Garantir vínculo auth_uid
    const { error: updateError } = await supabase
      .from('colaboradores')
      .update({ auth_uid: 'cdefc7c4-0ac1-4f74-9fcb-f074ac0548b7' })
      .eq('id', 'c79f679a-147a-47c1-9344-83833507adb0')

    if (updateError) {
      console.error('❌ Erro ao atualizar auth_uid:', updateError)
    } else {
      console.log('✅ Auth_uid atualizado')
    }

    // 3. Limpar registros existentes
    const { error: deleteError } = await supabase
      .from('registros_ponto')
      .delete()
      .eq('colaborador_id', 'c79f679a-147a-47c1-9344-83833507adb0')

    if (deleteError) {
      console.error('❌ Erro ao limpar registros:', deleteError)
    } else {
      console.log('✅ Registros antigos removidos')
    }

    // 4. Inserir novos registros COM empresa_id
    const registros = [
      {
        empresa_id: empresaCarlos?.empresa_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        colaborador_id: 'c79f679a-147a-47c1-9344-83833507adb0',
        data: '2025-12-10',
        entrada_1: '08:00:00',
        saida_1: '12:00:00',
        entrada_2: '13:00:00',
        saida_2: '17:00:00',
        observacoes: 'Dia completo'
      },
      {
        empresa_id: empresaCarlos?.empresa_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        colaborador_id: 'c79f679a-147a-47c1-9344-83833507adb0',
        data: '2025-12-09',
        entrada_1: '08:15:00',
        saida_1: '12:15:00',
        entrada_2: '13:15:00',
        saida_2: '17:15:00',
        observacoes: 'Dia completo'
      },
      {
        empresa_id: empresaCarlos?.empresa_id || 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        colaborador_id: 'c79f679a-147a-47c1-9344-83833507adb0',
        data: '2025-12-08',
        entrada_1: '08:00:00',
        saida_1: '12:00:00',
        entrada_2: '13:00:00',
        saida_2: '17:00:00',
        observacoes: 'Dia completo'
      }
    ]

    const { error: insertError } = await supabase
      .from('registros_ponto')
      .insert(registros)

    if (insertError) {
      console.error('❌ Erro ao inserir registros:', insertError)
      throw insertError
    } else {
      console.log('✅ Novos registros inseridos')
    }

    // 5. Verificar resultado
    const { data: resultado, count } = await supabase
      .from('registros_ponto')
      .select('*', { count: 'exact' })
      .eq('colaborador_id', 'c79f679a-147a-47c1-9344-83833507adb0')

    console.log('🎉 Resultado final:', { registros: count, dados: resultado })

    return {
      success: true,
      message: 'Correção executada com sucesso!',
      registros_criados: count,
      dados: resultado
    }

  } catch (error: any) {
    console.error('❌ Erro na correção:', error)
    throw createError({
      statusCode: 500,
      message: error.message
    })
  }
})