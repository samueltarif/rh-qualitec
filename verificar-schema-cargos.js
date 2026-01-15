// Script para verificar schema da tabela cargos no Supabase
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

console.log('🔍 Verificando schema da tabela cargos...\n');

// Buscar cargos existentes
fetch(`${url}/rest/v1/cargos?select=*&limit=1`, {
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(cargos => {
  if (Array.isArray(cargos) && cargos.length > 0) {
    console.log('✅ COLUNAS DA TABELA CARGOS:');
    Object.keys(cargos[0]).sort().forEach(col => console.log(`   - ${col}`));
    
    console.log('\n📦 EXEMPLO:');
    console.log(JSON.stringify(cargos[0], null, 2));
  } else {
    console.log('⚠️ Nenhum cargo encontrado. Tentando criar um teste...\n');
    
    // Tentar criar cargo de teste
    return fetch(`${url}/rest/v1/cargos`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nome: 'TESTE SCHEMA',
        descricao: 'Teste para ver schema'
      })
    })
    .then(r => r.json())
    .then(result => {
      console.log('📦 Resultado:');
      console.log(JSON.stringify(result, null, 2));
      
      if (Array.isArray(result) && result.length > 0) {
        console.log('\n✅ COLUNAS DA TABELA CARGOS:');
        Object.keys(result[0]).sort().forEach(col => console.log(`   - ${col}`));
        
        // Deletar o teste
        return fetch(`${url}/rest/v1/cargos?id=eq.${result[0].id}`, {
          method: 'DELETE',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`
          }
        });
      }
    });
  }
})
.catch(error => {
  console.error('💥 Erro:', error.message);
});
