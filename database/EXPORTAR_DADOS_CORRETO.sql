-- ============================================================================
-- EXPORTAR DADOS - VERSÃO CORRIGIDA
-- Baseado na estrutura real do banco de dados
-- ============================================================================

-- ============================================================================
-- 1. COLABORADORES (Dados Principais)
-- ============================================================================
SELECT 
  c.id,
  c.nome as "Nome",
  c.cpf as "CPF",
  c.email_corporativo as "Email Corporativo",
  c.email_pessoal as "Email Pessoal",
  cg.nome as "Cargo",
  d.nome as "Departamento",
  c.salario as "Salário",
  c.data_admissao as "Data Admissão",
  c.data_desligamento as "Data Desligamento",
  c.status as "Status",
  c.tipo_contrato as "Tipo Contrato",
  c.telefone as "Telefone",
  c.celular as "Celular",
  c.data_nascimento as "Data Nascimento",
  c.sexo as "Sexo",
  c.estado_civil as "Estado Civil"
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
  rp.saida_2 as "Saída Final",
  rp.observacoes as "Observações"
FROM registros_ponto rp
JOIN colaboradores c ON c.id = rp.colaborador_id
WHERE rp.data >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY rp.data DESC, c.nome;

-- ============================================================================
-- 3. HOLERITES (Últimos 6 meses)
-- ============================================================================
SELECT 
  h.nome_colaborador as "Colaborador",
  h.cpf as "CPF",
  h.mes as "Mês",
  h.ano as "Ano",
  h.cargo as "Cargo",
  h.departamento as "Departamento",
  h.salario_base as "Salário Base",
  h.total_proventos as "Total Proventos",
  h.inss as "INSS",
  h.irrf as "IRRF",
  h.total_descontos as "Total Descontos",
  h.salario_liquido as "Salário Líquido",
  h.fgts as "FGTS",
  h.status as "Status",
  h.gerado_em as "Data Geração"
FROM holerites h
WHERE h.ano >= EXTRACT(YEAR FROM CURRENT_DATE - INTERVAL '6 months')
ORDER BY h.ano DESC, h.mes DESC, h.nome_colaborador;

-- ============================================================================
-- 4. FÉRIAS
-- ============================================================================
SELECT 
  c.nome as "Colaborador",
  f.periodo_aquisitivo_inicio as "Período Início",
  f.periodo_aquisitivo_fim as "Período Fim",
  f.data_inicio as "Data Início Férias",
  f.data_fim as "Data Fim Férias",
  f.dias_corridos as "Dias Corridos",
  f.dias_uteis as "Dias Úteis",
  f.abono_pecuniario as "Abono Pecuniário",
  f.status as "Status",
  f.observacoes as "Observações"
FROM ferias f
JOIN colaboradores c ON c.id = f.colaborador_id
ORDER BY f.data_inicio DESC;

-- ============================================================================
-- 5. SOLICITAÇÕES DOS FUNCIONÁRIOS
-- ============================================================================
SELECT 
  c.nome as "Colaborador",
  s.tipo as "Tipo",
  s.descricao as "Descrição",
  s.status as "Status",
  s.prioridade as "Prioridade",
  s.data_solicitacao as "Data Solicitação",
  s.data_resposta as "Data Resposta",
  s.resposta as "Resposta"
FROM solicitacoes_funcionario s
JOIN colaboradores c ON c.id = s.colaborador_id
ORDER BY s.data_solicitacao DESC;

-- ============================================================================
-- 6. CARGOS
-- ============================================================================
SELECT 
  nome as "Cargo",
  descricao as "Descrição",
  cbo as "CBO",
  nivel as "Nível",
  salario_base as "Salário Base",
  ativo as "Ativo"
FROM cargos
ORDER BY nome;

-- ============================================================================
-- 7. DEPARTAMENTOS
-- ============================================================================
SELECT 
  nome as "Departamento",
  descricao as "Descrição",
  centro_custo as "Centro de Custo",
  ativo as "Ativo"
FROM departamentos
ORDER BY nome;

-- ============================================================================
-- DICA: Como Usar no Supabase
-- ============================================================================
-- 1. Copie cada query acima (uma por vez)
-- 2. Cole no Supabase SQL Editor
-- 3. Execute a query
-- 4. Clique no botão "Download CSV" que aparece nos resultados
-- 5. Abra o arquivo CSV no Excel
-- 6. Salve como .xlsx se preferir

-- ============================================================================
-- ALTERNATIVA: Exportar TUDO de uma vez (simplificado)
-- ============================================================================
-- Se quiser apenas os dados básicos de colaboradores:
/*
SELECT * FROM colaboradores ORDER BY nome;
*/
