-- EXPORTAR DADOS EM FORMATO CSV
-- Execute cada query e clique em "Download CSV" no Supabase

-- ============================================================================
-- 1. COLABORADORES (Dados Principais)
-- ============================================================================
SELECT 
  c.nome as "Nome",
  c.cpf as "CPF",
  c.email_corporativo as "Email",
  cg.nome as "Cargo",
  d.nome as "Departamento",
  c.salario as "Salário",
  c.data_admissao as "Data Admissão",
  c.status as "Status",
  c.tipo_contrato as "Tipo Contrato",
  c.telefone as "Telefone",
  c.celular as "Celular"
FROM colaboradores c
LEFT JOIN cargos cg ON cg.id = c.cargo_id
LEFT JOIN departamentos d ON d.id = c.departamento_id
ORDER BY c.nome;

-- ============================================================================
-- 2. REGISTROS DE PONTO (Últimos 30 dias)
-- ============================================================================
SELECT 
  c.nome as "Colaborador",
  rp.data as "Data",
  rp.entrada_1 as "Entrada",
  rp.saida_1 as "Saída Almoço",
  rp.entrada_2 as "Retorno Almoço",
  rp.saida_2 as "Saída"
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY rp.data DESC, c.nome;

-- ============================================================================
-- 3. HOLERITES (Últimos 6 meses)
-- ============================================================================
SELECT 
  nome_colaborador as "Colaborador",
  mes as "Mês",
  ano as "Ano",
  salario_base as "Salário Base",
  total_proventos as "Total Proventos",
  inss as "INSS",
  irrf as "IRRF",
  total_descontos as "Total Descontos",
  salario_liquido as "Salário Líquido",
  status as "Status"
FROM holerites
WHERE (ano * 100 + mes) >= EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '6 months') * 100 + EXTRACT(MONTH FROM CURRENT_DATE - INTERVAL '6 months')
ORDER BY ano DESC, mes DESC, nome_colaborador;

-- ============================================================================
-- 4. FÉRIAS
-- ============================================================================
SELECT 
  c.nome as "Colaborador",
  f.data_inicio as "Data Início",
  f.data_fim as "Data Fim",
  f.dias_corridos as "Dias",
  f.status as "Status",
  f.observacoes as "Observações"
FROM ferias f
JOIN colaboradores c ON c.id = f.colaborador_id
ORDER BY f.data_inicio DESC;

-- ============================================================================
-- 5. SOLICITAÇÕES
-- ============================================================================
SELECT 
  c.nome as "Colaborador",
  s.tipo as "Tipo",
  s.descricao as "Descrição",
  s.status as "Status",
  s.data_solicitacao as "Data Solicitação",
  s.data_resposta as "Data Resposta"
FROM solicitacoes_funcionario s
JOIN colaboradores c ON c.id = s.colaborador_id
ORDER BY s.data_solicitacao DESC;

-- ============================================================================
-- DICA: No Supabase SQL Editor
-- ============================================================================
-- 1. Execute cada query acima separadamente
-- 2. Clique no botão "Download CSV" que aparece nos resultados
-- 3. Abra o arquivo CSV no Excel
-- 4. Salve como .xlsx se preferir
