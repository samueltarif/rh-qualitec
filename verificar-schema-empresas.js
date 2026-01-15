// Script para verificar schema da tabela empresas no Supabase
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

console.log('🔍 Verificando schema da tabela empresas...\n');

// Campos que o sistema está tentando usar
const camposDoSistema = [
  'id',
  'nome',
  'nome_fantasia',
  'cnpj',
  'inscricao_estadual',
  'logradouro',
  'numero',
  'complemento',
  'bairro',
  'municipio',
  'uf',
  'cep',
  'telefone',
  'email_holerites',
  'logo_url',
  'ativo',
  'created_at',
  'updated_at'
];

// 1. Buscar empresas existentes para ver as colunas
fetch(`${url}/rest/v1/empresas?select=*&limit=1`, {
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(empresas => {
  console.log('📊 RESULTADO DA CONSULTA:\n');
  
  if (Array.isArray(empresas) && empresas.length > 0) {
    const colunasReais = Object.keys(empresas[0]).sort();
    
    console.log('✅ COLUNAS QUE EXISTEM NO SUPABASE:');
    colunasReais.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n📝 COLUNAS QUE O SISTEMA ESTÁ TENTANDO USAR:');
    camposDoSistema.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n🔍 COMPARAÇÃO:\n');
    
    // Campos que existem no sistema mas não no banco
    const faltamNoBanco = camposDoSistema.filter(c => !colunasReais.includes(c));
    if (faltamNoBanco.length > 0) {
      console.log('❌ CAMPOS QUE FALTAM NO BANCO:');
      faltamNoBanco.forEach(col => console.log(`   - ${col}`));
    } else {
      console.log('✅ Todos os campos do sistema existem no banco');
    }
    
    // Campos que existem no banco mas não no sistema
    const faltamNoSistema = colunasReais.filter(c => !camposDoSistema.includes(c));
    if (faltamNoSistema.length > 0) {
      console.log('\n⚠️ CAMPOS QUE EXISTEM NO BANCO MAS NÃO NO SISTEMA:');
      faltamNoSistema.forEach(col => console.log(`   - ${col}`));
    }
    
    console.log('\n📦 EXEMPLO DE EMPRESA:');
    console.log(JSON.stringify(empresas[0], null, 2));
    
  } else {
    console.log('⚠️ Nenhuma empresa encontrada no banco.');
    console.log('Vou tentar criar uma empresa de teste para ver o schema...\n');
    
    // Tentar criar empresa de teste
    return fetch(`${url}/rest/v1/empresas`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        nome: 'TESTE SCHEMA',
        cnpj: '00.000.000/0000-00'
      })
    })
    .then(r => r.json())
    .then(result => {
      console.log('📦 Resultado da tentativa de criar:');
      console.log(JSON.stringify(result, null, 2));
      
      if (result.code) {
        console.log('\n❌ ERRO:', result.message);
        
        // Extrair nome da coluna do erro
        const match = result.message.match(/'([^']+)' column/);
        if (match) {
          console.log(`\n⚠️ A coluna '${match[1]}' não existe na tabela!`);
        }
      }
    });
  }
})
.catch(error => {
  console.error('💥 Erro:', error.message);
});
