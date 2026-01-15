// Script para verificar schema da tabela departamentos no Supabase
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NUXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NUXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente não configuradas!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarSchema() {
  console.log('🔍 Verificando schema da tabela departamentos...\n')

  try {
    // 1. Verificar se a tabela existe e buscar dados
    console.log('📋 Tabela: departamentos')
    const { data: departamentos, error: deptosError } = await supabase
      .from('departamentos')
      .select('*')
      .limit(5)

    if (deptosError) {
      console.error('❌ Erro ao acessar departamentos:', deptosError.message)
      console.error('📋 Detalhes:', deptosError)
    } else {
      console.log('✅ Tabela departamentos acessível')
      console.log('📊 Total de registros encontrados:', departamentos.length)
      
      if (departamentos && departamentos.length > 0) {
        console.log('\n📊 Campos disponíveis:', Object.keys(departamentos[0]).join(', '))
        console.log('\n📝 Exemplos de departamentos:')
        departamentos.forEach((dept, index) => {
          console.log(`\n${index + 1}. ${JSON.stringify(dept, null, 2)}`)
        })
      } else {
        console.log('⚠️  Tabela vazia - nenhum departamento cadastrado')
      }
    }

    console.log('\n' + '='.repeat(60) + '\n')

    // 2. Testar inserção de departamento
    console.log('🧪 Testando inserção de departamento...')
    
    const novoDepartamento = {
      nome: 'Teste Departamento ' + Date.now(),
      descricao: 'Departamento de teste',
      ativo: true
    }

    console.log('📤 Dados a inserir:', JSON.stringify(novoDepartamento, null, 2))

    const { data: deptInserido, error: insertError } = await supabase
      .from('departamentos')
      .insert(novoDepartamento)
      .select()

    if (insertError) {
      console.error('❌ Erro ao inserir departamento:', insertError.message)
      console.error('📋 Detalhes:', insertError)
      
      // Tentar descobrir quais campos são obrigatórios
      console.log('\n💡 Possíveis campos obrigatórios que podem estar faltando:')
      console.log('   - empresa_id (se departamento pertence a uma empresa)')
      console.log('   - responsavel (se precisa de um responsável)')
      console.log('   - codigo (se tem código único)')
    } else {
      console.log('✅ Departamento inserido com sucesso!')
      console.log('📝 Dados inseridos:', JSON.stringify(deptInserido, null, 2))

      // Limpar dados de teste
      if (deptInserido && deptInserido.length > 0) {
        const deptId = deptInserido[0].id
        console.log('\n🧹 Limpando dados de teste...')
        
        await supabase
          .from('departamentos')
          .delete()
          .eq('id', deptId)

        console.log('✅ Dados de teste removidos')
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Verificação concluída!')

  } catch (error) {
    console.error('💥 Erro durante verificação:', error)
  }
}

verificarSchema()
