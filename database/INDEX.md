# 📊 Índice Rápido - Database Scripts

## 🎯 Uso Rápido

### Setup Completo do Zero
```sql
-- Execute na ordem no Supabase SQL Editor:
migrations/01_cargos.sql
migrations/02_cargo_gestores.sql
migrations/03_cargos_departamento.sql
migrations/04_colaboradores_minimos.sql
migrations/05_colaboradores_extras.sql
migrations/06_criar_documentos.sql
migrations/07_storage_completo.sql
migrations/08_documentos_rh.sql
migrations/09_departamentos_rls.sql
migrations/10_add_contato_emergencia_parentesco.sql
migrations/11_empresa.sql
migrations/12_parametros_folha.sql

-- Depois, popular dados:
seeds/cadastrar_silvana.sql
```

### Diagnóstico Rápido
```sql
-- Ver todos os ENUMs e valores válidos:
debug/listar_enums.sql

-- Ver campos vazios/preenchidos:
debug/debug_campos_detalhado.sql

-- Verificar estrutura geral:
debug/verificar.sql
```

## 📁 Estrutura

```
database/
├── migrations/      (12 arquivos) - Estrutura do banco
├── seeds/          (1 arquivo)   - Dados iniciais
├── debug/          (8 arquivos)  - Scripts de diagnóstico
└── fixes/          (8 arquivos)  - Correções históricas
```

## 🔢 Contagem

- **Total**: 29 scripts SQL
- **Migrations**: 12 (ordem numérica)
- **Seeds**: 1
- **Debug**: 8 (seguros, apenas SELECT)
- **Fixes**: 8 (usar com cuidado)

## ⚡ Scripts Mais Usados

| Script | Uso | Pasta |
|--------|-----|-------|
| `listar_enums.sql` | Ver valores válidos de ENUMs | debug/ |
| `debug_campos_detalhado.sql` | Analisar campos vazios | debug/ |
| `verificar.sql` | Verificação geral | debug/ |
| `07_storage_completo.sql` | Configurar upload de arquivos | migrations/ |

## 🚨 Atenção

- **Fixes**: São históricos, só use se tiver o problema específico
- **RLS**: Scripts que mexem com RLS podem afetar segurança
- **Backup**: Sempre faça backup antes de executar fixes
