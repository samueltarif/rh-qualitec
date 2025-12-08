# Correção da Tabela Empresa

## ✅ O que já foi executado

Você já executou o script que criou:
- Tabela `empresa` com campos básicos
- Campos: razão_social, nome_fantasia, CNPJ, endereço, contatos, dados bancários
- Campos adicionais: regime_tributario, porte_empresa
- Trigger de updated_at
- RLS (Row Level Security)
- Dados iniciais da Qualitec

## 🔧 O que precisa ser corrigido

Execute o script `fixes/fix_empresa_add_campos.sql` no Supabase SQL Editor para adicionar os campos que faltam:

### Campos que serão adicionados:
- `responsavel_nome` - Nome do responsável legal
- `responsavel_cpf` - CPF do responsável legal
- `responsavel_cargo` - Cargo do responsável legal
- `responsavel_email` - E-mail do responsável legal
- `responsavel_telefone` - Telefone do responsável legal

### Como executar:

1. Abra o Supabase Dashboard
2. Vá em **SQL Editor**
3. Copie e cole o conteúdo do arquivo `fixes/fix_empresa_add_campos.sql`
4. Clique em **Run**

## ✨ Resultado esperado

Após executar o script de correção, você verá mensagens como:

```
✅ Campo responsavel_nome adicionado
✅ Campo responsavel_cpf adicionado
✅ Campo responsavel_cargo adicionado
✅ Campo responsavel_email adicionado
✅ Campo responsavel_telefone adicionado
✅ Índice idx_empresa_cnpj criado
📊 Total de registros na tabela empresa: 1
✅ Correção da tabela empresa concluída!
```

## 🎯 Após a correção

A página de configuração `/configuracoes/empresa` estará totalmente funcional com todas as seções:

1. ✅ Identificação (razão social, CNPJ, etc)
2. ✅ Endereço completo
3. ✅ Contatos (telefone, e-mail, site)
4. ✅ Dados Bancários
5. ✅ Responsável Legal (NOVO - campos adicionados)
6. ✅ Configurações Fiscais (regime tributário, porte)
7. ✅ Branding (cores)

## 📝 Observações

- O script é seguro e verifica se os campos já existem antes de adicionar
- Não vai duplicar campos ou causar erros
- Os dados existentes não serão afetados
