# Database Scripts

Organização dos scripts SQL do projeto.

## 📁 Estrutura

### `/migrations`
Scripts de criação e estrutura do banco de dados. Execute na ordem numérica:

1. `01_cargos.sql` - Tabela de cargos
2. `02_cargo_gestores.sql` - Relação cargo-gestor
3. `03_cargos_departamento.sql` - Relação cargo-departamento
4. `04_colaboradores_minimos.sql` - Estrutura básica de colaboradores
5. `05_colaboradores_extras.sql` - Campos adicionais de colaboradores
6. `06_criar_documentos.sql` - Tabela de documentos
7. `07_storage_completo.sql` - Configuração do Supabase Storage
8. `08_documentos_rh.sql` - Tabela de documentos RH (atestados, etc)
9. `09_departamentos_rls.sql` - Políticas RLS de departamentos
10. `10_add_contato_emergencia_parentesco.sql` - Adiciona campo parentesco
11. `11_empresa.sql` - Tabela de dados da empresa
12. `12_parametros_folha.sql` - Parâmetros de folha de pagamento (INSS, IRRF, FGTS)
13. `13_jornadas_trabalho.sql` - Jornadas de trabalho (horários, escalas, turnos)

### `/seeds`
Dados iniciais para popular o banco:

- `cadastrar_silvana.sql` - Cadastro da usuária Silvana

### `/debug`
Scripts para diagnóstico e verificação:

- `debug_colaboradores.sql` - Verificar dados de colaboradores
- `debug_colaboradores_campos.sql` - Verificar campos específicos
- `debug_campos_detalhado.sql` - Análise detalhada de campos
- `verificar.sql` - Verificações gerais
- `verificar_enums.sql` - Verificar ENUMs
- `listar_enums.sql` - Listar todos os ENUMs e valores
- `pegar_empresa_id.sql` - Obter ID da empresa
- `teste_rls.sql` - Testar políticas RLS

### `/fixes`
Scripts de correção (histórico de problemas resolvidos):

- `fix_rls_simples.sql` - Correção RLS básica
- `fix_empresa_id.sql` - Correção de empresa_id
- `fix_empresa_correto.sql` - Correção empresa_id (versão correta)
- `fix_final.sql` - Correção final
- `fix_final_correto.sql` - Correção final (versão correta)
- `fix_departamentos_rls.sql` - Correção RLS departamentos
- `forcar_update.sql` - Forçar atualização
- `desabilitar_rls.sql` - Desabilitar RLS (usar com cuidado!)

## 🚀 Como Usar

### Setup Inicial
Execute os migrations na ordem:
```bash
# No Supabase SQL Editor, execute cada arquivo em ordem
01_cargos.sql
02_cargo_gestores.sql
...
09_departamentos_rls.sql
```

### Popular Dados
```bash
# Após migrations, execute os seeds
seeds/cadastrar_silvana.sql
```

### Diagnóstico
```bash
# Para verificar problemas, use os scripts de debug
debug/verificar.sql
debug/listar_enums.sql
```

## ⚠️ Notas

- Scripts em `/fixes` são históricos - só use se tiver o problema específico
- Sempre faça backup antes de executar fixes
- Scripts de debug são seguros (apenas SELECT)
