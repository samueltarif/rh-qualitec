import 'dotenv/config'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function testarEnvioCredenciais() {
  try {
    console.log('🧪 Testando envio de credenciais...\n')

    // Buscar um funcionário para teste
    const buscaResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/funcionarios?select=id,nome_completo,email_login,email_pessoal&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const funcionarios = await buscaResponse.json()
    
    if (!funcionarios || funcionarios.length === 0) {
      console.log('❌ Nenhum funcionário encontrado para teste')
      return
    }

    const funcionario = funcionarios[0]
    console.log('👤 Funcionário para teste:', funcionario.nome_completo)
    console.log('📧 Email login:', funcionario.email_login)
    console.log('📧 Email pessoal:', funcionario.email_pessoal)
    console.log('🆔 ID:', funcionario.id)
    console.log('')

    // Testar envio de credenciais
    console.log('📤 Enviando credenciais...')
    const response = await fetch('http://localhost:3000/api/funcionarios/enviar-acesso', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        funcionario_id: funcionario.id
      })
    })

    const resultado = await response.json()

    if (response.ok) {
      console.log('✅ Sucesso!')
      console.log('📊 Resultado:', resultado)
    } else {
      console.log('❌ Erro:', resultado)
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message)
  }
}

testarEnvioCredenciais()
