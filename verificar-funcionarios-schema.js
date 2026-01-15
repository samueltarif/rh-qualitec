// Script para verificar schema da tabela funcionarios e comparar com o formulário
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

console.log('🔍 Verificando schema da tabela funcionarios...\n');

// Campos que o formulário está usando (baseado no FuncionarioForm.vue)
const camposDoFormulario = [
  // Dados Pessoais
  'nome_completo',
  'cpf',
  'rg',
  'data_nascimento',
  'sexo',
  'telefone',
  'email_pessoal',
  
  // Dados Profissionais
  'empresa_id',
  'departamento_id',
  'cargo_id',
  'tipo_contrato',
  'data_admissao',
  'matricula',
  'jornada_trabalho_id',
  
  // Acesso ao Sistema
  'email_login',
  'senha',
  'tipo_acesso',
  'status',
  
  // Dados Financeiros
  'salario_base',
  'tipo_salario',
  'banco',
  'agencia',
  'conta',
  'forma_pagamento'
];

// Buscar funcionários existentes
fetch(`${url}/rest/v1/funcionarios?select=*&limit=1`, {
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(funcionarios => {
  let colunasReais = [];
  
  if (Array.isArray(funcionarios) && funcionarios.length > 0) {
    colunasReais = Object.keys(funcionarios[0]).sort();
    
    console.log('✅ COLUNAS QUE EXISTEM NO SUPABASE:');
    colunasReais.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n📦 EXEMPLO DE FUNCIONÁRIO:');
    console.log(JSON.stringify(funcionarios[0], null, 2));
  } else {
    console.log('⚠️ Nenhum funcionário encontrado no banco.');
    console.log('Vou usar a estrutura esperada baseada nos scripts SQL...\n');
    
    // Estrutura esperada baseada nos scripts de migração
    colunasReais = [
      'id', 'nome_completo', 'cpf', 'rg', 'data_nascimento', 'sexo',
      'telefone', 'email_pessoal', 'empresa_id', 'departamento_id',
      'cargo_id', 'jornada_trabalho_id', 'responsavel_id', 'tipo_contrato',
      'data_admissao', 'data_demissao', 'matricula', 'email_login',
      'senha', 'tipo_acesso', 'status', 'salario_base', 'tipo_salario',
      'banco', 'agencia', 'conta', 'tipo_conta', 'forma_pagamento',
      'created_at', 'updated_at'
    ].sort();
    
    console.log('📋 COLUNAS ESPERADAS (baseado nos scripts SQL):');
    colunasReais.forEach(col => console.log(`   - ${col}`));
  }
  
  console.log('\n📝 CAMPOS QUE O FORMULÁRIO ESTÁ USANDO:');
  camposDoFormulario.forEach(col => console.log(`   - ${col}`));
  
  console.log('\n🔍 COMPARAÇÃO:\n');
  
  // Campos que estão no formulário mas não no banco
  const faltamNoBanco = camposDoFormulario.filter(c => !colunasReais.includes(c));
  if (faltamNoBanco.length > 0) {
    console.log('❌ CAMPOS QUE FALTAM NO BANCO (formulário tenta usar mas não existem):');
    faltamNoBanco.forEach(col => console.log(`   - ${col}`));
  } else {
    console.log('✅ Todos os campos do formulário existem no banco');
  }
  
  // Campos que existem no banco mas não no formulário
  const faltamNoFormulario = colunasReais.filter(c => 
    !camposDoFormulario.includes(c) && 
    !['id', 'created_at', 'updated_at', 'data_demissao', 'responsavel_id', 'tipo_conta'].includes(c)
  );
  if (faltamNoFormulario.length > 0) {
    console.log('\n⚠️ CAMPOS QUE EXISTEM NO BANCO MAS NÃO NO FORMULÁRIO:');
    faltamNoFormulario.forEach(col => console.log(`   - ${col}`));
  }
  
  // Campos que batem
  const camposCorretos = camposDoFormulario.filter(c => colunasReais.includes(c));
  console.log(`\n✅ CAMPOS CORRETOS: ${camposCorretos.length}/${camposDoFormulario.length}`);
  
  // Resumo
  console.log('\n📊 RESUMO:');
  console.log(`   - Total de colunas no banco: ${colunasReais.length}`);
  console.log(`   - Total de campos no formulário: ${camposDoFormulario.length}`);
  console.log(`   - Campos que batem: ${camposCorretos.length}`);
  console.log(`   - Campos faltando no banco: ${faltamNoBanco.length}`);
  console.log(`   - Campos não usados no formulário: ${faltamNoFormulario.length}`);
  
  if (faltamNoBanco.length === 0) {
    console.log('\n🎉 PERFEITO! Todos os campos do formulário existem no banco!');
  } else {
    console.log('\n⚠️ ATENÇÃO! Há campos no formulário que não existem no banco.');
    console.log('   Isso vai causar erros ao tentar salvar funcionários.');
  }
})
.catch(error => {
  console.error('💥 Erro:', error.message);
});
