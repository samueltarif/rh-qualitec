// Teste direto de login
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

const email = 'silvana@qualitec.ind.br';
const senha = 'Qualitec2025Silvana';

const testUrl = `${url}/rest/v1/funcionarios?email_login=eq.${encodeURIComponent(email)}&senha=eq.${encodeURIComponent(senha)}&status=eq.ativo&select=id,nome_completo,email_login,tipo_acesso,status`;

console.log('🔍 Testando login...');
console.log('📧 Email:', email);
console.log('🔑 Senha:', senha);
console.log('📡 URL:', testUrl);
console.log('');

fetch(testUrl, {
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => {
  console.log('📊 Status:', response.status);
  return response.json();
})
.then(data => {
  console.log('👥 Resultado:', JSON.stringify(data, null, 2));
  
  if (Array.isArray(data) && data.length > 0) {
    console.log('');
    console.log('✅ LOGIN FUNCIONARIA!');
    console.log('👤 Usuário:', data[0].nome_completo);
    console.log('📧 Email:', data[0].email_login);
    console.log('🔐 Tipo:', data[0].tipo_acesso);
  } else {
    console.log('');
    console.log('❌ NENHUM USUÁRIO ENCONTRADO');
    console.log('Verifique se:');
    console.log('1. O email está correto');
    console.log('2. A senha está correta');
    console.log('3. O status é "ativo"');
  }
})
.catch(error => {
  console.error('💥 Erro:', error.message);
});
