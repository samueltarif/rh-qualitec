import 'dotenv/config'
import fs from 'fs'

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

async function testarDownloadHTML() {
  try {
    console.log('🧪 Testando download de HTML do holerite...\n')

    // Buscar um holerite para teste
    const buscaResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/holerites?select=id,funcionario_id(nome_completo)&limit=1`,
      {
        headers: {
          'apikey': SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    )

    const holerites = await buscaResponse.json()
    
    if (!holerites || holerites.length === 0) {
      console.log('❌ Nenhum holerite encontrado para teste')
      return
    }

    const holerite = holerites[0]
    console.log('📄 Holerite para teste ID:', holerite.id)
    console.log('👤 Funcionário:', holerite.funcionario_id?.nome_completo || 'N/A')
    console.log('')

    // Testar download de HTML
    console.log('📥 Baixando HTML...')
    const response = await fetch(`http://localhost:3000/api/holerites/${holerite.id}/html`)

    if (response.ok) {
      const html = await response.text()
      
      // Salvar arquivo para inspeção
      const filename = `holerite-teste-${holerite.id}.html`
      fs.writeFileSync(filename, html)
      
      console.log('✅ HTML gerado com sucesso!')
      console.log(`📁 Arquivo salvo: ${filename}`)
      console.log(`📊 Tamanho: ${(html.length / 1024).toFixed(2)} KB`)
      console.log('\n🔍 Primeiras linhas do HTML:')
      console.log(html.substring(0, 500) + '...')
    } else {
      const error = await response.text()
      console.log('❌ Erro ao gerar HTML:', error)
    }

  } catch (error) {
    console.error('❌ Erro ao testar:', error.message)
  }
}

testarDownloadHTML()
