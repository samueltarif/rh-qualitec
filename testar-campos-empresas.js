// Testar cada campo individualmente para descobrir qual tem limite de 20
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

const dados = {
  "nome": "QUALITEC COMERCIO E SERVICOS DE INSTRUMENTOS DE MEDICAO LTDA",
  "nome_fantasia": "QUALITEC - INSTRUMENTOS DE MEDICAO",
  "cnpj": "09.117.117/0001-24",
  "situacao_cadastral": "ATIVA",
  "telefone": "(11) 3908-7100 / (11) 9918-4979 / (11) 3992-4067",
  "email": "marcoaurelio@qualitecinstrumentos.com.br",
  "endereco": "RUA FAZENDA MONTE ALEGRE 367 - JARAGUA - SAO PAULO/SP - CEP: 05.160-060"
};

console.log('🧪 Testando cada campo individualmente...\n');

async function testarCampo(campo, valor) {
  const body = {
    nome: 'TESTE',
    cnpj: '00.000.000/0000-00'
  };
  
  body[campo] = valor;
  
  const response = await fetch(`${url}/rest/v1/empresas`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(body)
  });
  
  const result = await response.json();
  
  if (response.ok) {
    console.log(`✅ ${campo}: OK (${valor.length} caracteres)`);
    // Deletar o registro de teste
    if (result[0]?.id) {
      await fetch(`${url}/rest/v1/empresas?id=eq.${result[0].id}`, {
        method: 'DELETE',
        headers: {
          'apikey': serviceRoleKey,
          'Authorization': `Bearer ${serviceRoleKey}`
        }
      });
    }
  } else {
    console.log(`❌ ${campo}: ERRO (${valor.length} caracteres)`);
    console.log(`   Mensagem: ${result.message}`);
  }
}

(async () => {
  for (const [campo, valor] of Object.entries(dados)) {
    if (typeof valor === 'string') {
      await testarCampo(campo, valor);
    }
  }
  
  console.log('\n🎯 Teste completo!');
})();
