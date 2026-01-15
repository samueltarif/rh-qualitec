// Script para verificar schema da tabela funcionario_beneficios
const url = 'https://rqryspxfvfzfghrfqtbm.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxcnlzcHhmdmZ6ZmdocmZxdGJtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODAxNjc1OSwiZXhwIjoyMDgzNTkyNzU5fQ._AQ67F_-Z9Cvfqv5_ZISgMDbYGRCk2P5wqK1JdFBYA4';

console.log('🔍 Verificando schema da tabela funcionario_beneficios...\n');

// Campos que o formulário está usando (baseado no FuncionarioForm.vue)
const camposDoFormulario = [
  'funcionario_id',
  
  // Vale Transporte
  'vt_ativo',
  'vt_valor_diario',
  'vt_tipo_desconto',
  'vt_percentual_desconto',
  'vt_valor_desconto',
  
  // Vale Refeição
  'vr_ativo',
  'vr_valor_diario',
  'vr_tipo_desconto',
  'vr_percentual_desconto',
  'vr_valor_desconto',
  
  // Plano de Saúde
  'ps_ativo',
  'ps_plano',
  'ps_valor_empresa',
  'ps_valor_funcionario',
  'ps_dependentes',
  
  // Plano Odontológico
  'po_ativo',
  'po_valor_funcionario',
  'po_dependentes'
];

// Buscar benefícios existentes
fetch(`${url}/rest/v1/funcionario_beneficios?select=*&limit=1`, {
  headers: {
    'apikey': serviceRoleKey,
    'Authorization': `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(beneficios => {
  let colunasReais = [];
  
  if (Array.isArray(beneficios) && beneficios.length > 0) {
    colunasReais = Object.keys(beneficios[0]).sort();
    
    console.log('✅ COLUNAS QUE EXISTEM NO SUPABASE:');
    colunasReais.forEach(col => console.log(`   - ${col}`));
    
    console.log('\n📦 EXEMPLO DE BENEFÍCIO:');
    console.log(JSON.stringify(beneficios[0], null, 2));
  } else {
    console.log('⚠️ Nenhum benefício encontrado no banco.');
    console.log('Vou usar a estrutura esperada baseada nos scripts SQL...\n');
    
    // Estrutura esperada baseada nos scripts de migração
    colunasReais = [
      'id', 'funcionario_id',
      'vt_ativo', 'vt_valor_diario', 'vt_tipo_desconto', 'vt_percentual_desconto', 'vt_valor_desconto',
      'vr_ativo', 'vr_valor_diario', 'vr_tipo_desconto', 'vr_percentual_desconto', 'vr_valor_desconto',
      'ps_ativo', 'ps_plano', 'ps_valor_empresa', 'ps_valor_funcionario', 'ps_dependentes',
      'po_ativo', 'po_valor_funcionario', 'po_dependentes',
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
    !['id', 'created_at', 'updated_at'].includes(c)
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
    console.log('   Isso vai causar erros ao tentar salvar benefícios.');
  }
})
.catch(error => {
  console.error('💥 Erro:', error.message);
});
