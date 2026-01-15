// Script de teste direto para verificar conexão com Supabase
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co/rest/v1/';
const anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTY3NTksImV4cCI6MjA4MzU5Mjc1OX0.bptJ9j_zu151GLQO35kdvXOJzWaRL_7d0haRHKS3jDo';

fetch(url, {
  headers: {
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  }
})
.then(response => {
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  return response.json();
})
.then(data => {
  console.log('Resposta:', JSON.stringify(data, null, 2));
})
.catch(error => {
  console.error('Erro:', error.message);
});
