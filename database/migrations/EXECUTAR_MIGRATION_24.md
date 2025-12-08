# Migration 24 - Portal do Funcionário

## Execute o SQL no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **SQL Editor**
3. Cole e execute o conteúdo do arquivo `24_portal_funcionario.sql`

## Tabelas Criadas

| Tabela | Descrição |
|--------|-----------|
| `solicitacoes_funcionario` | Solicitações feitas pelos funcionários |
| `documentos_funcionario` | Documentos disponíveis (holerites, etc) |
| `registros_ponto` | Registros de ponto eletrônico |
| `banco_horas` | Controle de banco de horas |
| `comunicados` | Comunicados da empresa |
| `comunicados_lidos` | Registro de leitura de comunicados |

## Funcionalidades do Portal do Funcionário

### Para Funcionários (/employee)
- ✅ Dashboard com estatísticas pessoais
- ✅ Registro de ponto eletrônico
- ✅ Visualização de registros de ponto
- ✅ Criação de solicitações (férias, atestados, etc)
- ✅ Acompanhamento de solicitações
- ✅ Visualização de documentos (holerites)
- ✅ Leitura de comunicados
- ✅ Visualização do perfil

### Para Gestores/Admin (/admin)
- ✅ Gestão de solicitações (/admin/solicitacoes)
- ✅ Aprovar/Rejeitar solicitações
- ✅ Publicação de comunicados (/admin/comunicados)
- ✅ Estatísticas de solicitações

## Autenticação

| Role | Acesso |
|------|--------|
| `admin` | Painel Admin (/admin) |
| `funcionario` | Portal do Funcionário (/employee) |

## Vincular Usuário a Colaborador

Para que um funcionário acesse seus dados, é necessário vincular o `app_users.colaborador_id` ao `colaboradores.id`:

```sql
UPDATE app_users 
SET colaborador_id = 'UUID_DO_COLABORADOR'
WHERE email = 'email@funcionario.com';
```

## Testar

1. Execute a migration 24
2. Crie um usuário funcionário
3. Vincule ao colaborador
4. Acesse /employee com as credenciais
