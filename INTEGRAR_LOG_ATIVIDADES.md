# Como Integrar Log de Atividades nos Endpoints

Guia prático para adicionar registro de atividades em todos os endpoints da API.

## 📝 Template Básico

```typescript
import { logAtividade } from '~/server/utils/log-atividade'

export default defineEventHandler(async (event) => {
  // Sua lógica aqui...
  
  // Registrar atividade
  await logAtividade(
    event,
    'tipo_acao',    // login, create, update, delete, download, upload, approve, reject
    'modulo',       // colaboradores, ferias, documentos, etc
    'Descrição da ação realizada',
    { dados_adicionais: 'opcional' }  // detalhes em JSON (opcional)
  )
  
  return resultado
})
```

## 🎯 Exemplos por Endpoint

### 1. Férias (já existentes)

#### `/api/ferias/index.post.ts` - Criar solicitação
```typescript
import { logAtividade } from '~/server/utils/log-atividade'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const supabase = await serverSupabaseClient(event)
  
  // Criar férias...
  const { data, error } = await supabase.from('ferias').insert(body).select().single()
  
  if (!error) {
    await logAtividade(
      event,
      'create',
      'ferias',
      `Solicitou férias de ${body.data_inicio} a ${body.data_fim}`,
      { ferias_id: data.id, dias: body.dias_solicitados }
    )
  }
  
  return { data, error }
})
```

#### `/api/ferias/aprovar.post.ts` - Aprovar férias
```typescript
await logAtividade(
  event,
  'approve',
  'ferias',
  `Aprovou férias do colaborador`,
  { ferias_id: body.ferias_id }
)
```

### 2. Documentos RH

#### Upload de documento
```typescript
await logAtividade(
  event,
  'upload',
  'documentos',
  `Fez upload do documento: ${arquivo.nome}`,
  { documento_id: novoDoc.id, tipo: body.tipo_documento_id }
)
```

#### Download de documento
```typescript
await logAtividade(
  event,
  'download',
  'documentos',
  `Baixou o documento: ${documento.nome}`,
  { documento_id: id }
)
```

### 3. Solicitações do Funcionário

#### `/api/funcionario/solicitacoes/index.post.ts`
```typescript
await logAtividade(
  event,
  'create',
  'solicitacoes',
  `Criou solicitação: ${body.tipo}`,
  { solicitacao_id: novaSolicitacao.id, tipo: body.tipo }
)
```

#### `/api/admin/solicitacoes/[id].put.ts` - Aprovar/Rejeitar
```typescript
const acao = body.status === 'aprovado' ? 'approve' : 'reject'
const descricao = body.status === 'aprovado' 
  ? `Aprovou solicitação de ${solicitacao.tipo}`
  : `Rejeitou solicitação de ${solicitacao.tipo}`

await logAtividade(
  event,
  acao,
  'solicitacoes',
  descricao,
  { solicitacao_id: id, motivo: body.observacoes }
)
```

### 4. Ponto

#### `/api/funcionario/ponto/registrar.post.ts`
```typescript
await logAtividade(
  event,
  'create',
  'ponto',
  `Registrou ponto: ${body.tipo}`,
  { tipo: body.tipo, horario: body.horario }
)
```

### 5. Comunicados

#### Criar comunicado
```typescript
await logAtividade(
  event,
  'create',
  'comunicados',
  `Criou comunicado: ${body.titulo}`,
  { comunicado_id: novoComunicado.id }
)
```

#### Ler comunicado
```typescript
await logAtividade(
  event,
  'update',
  'comunicados',
  `Leu o comunicado: ${comunicado.titulo}`,
  { comunicado_id: id }
)
```

### 6. Alteração de Dados do Funcionário

#### `/api/funcionario/perfil/dados-pessoais.put.ts`
```typescript
await logAtividade(
  event,
  'update',
  'solicitacoes',
  'Solicitou alteração de dados pessoais',
  { campos_alterados: Object.keys(body) }
)
```

#### `/api/admin/alteracoes-dados/[id].put.ts` - Aprovar alteração
```typescript
const acao = body.status === 'aprovado' ? 'approve' : 'reject'
await logAtividade(
  event,
  acao,
  'solicitacoes',
  `${acao === 'approve' ? 'Aprovou' : 'Rejeitou'} alteração de dados do funcionário`,
  { solicitacao_id: id }
)
```

### 7. Configurações

#### Empresa
```typescript
await logAtividade(
  event,
  'update',
  'configuracoes',
  'Atualizou dados da empresa',
  { campos: Object.keys(body) }
)
```

#### Parâmetros de Folha
```typescript
await logAtividade(
  event,
  'update',
  'configuracoes',
  'Atualizou parâmetros da folha de pagamento'
)
```

#### Jornadas de Trabalho
```typescript
// Criar
await logAtividade(event, 'create', 'configuracoes', 
  `Criou jornada: ${body.nome}`, { jornada_id: novaJornada.id })

// Atualizar
await logAtividade(event, 'update', 'configuracoes',
  `Atualizou jornada: ${jornada.nome}`, { jornada_id: id })

// Excluir
await logAtividade(event, 'delete', 'configuracoes',
  `Excluiu jornada: ${jornada.nome}`, { jornada_id: id })
```

### 8. Tipos e Categorias de Documentos

```typescript
// Criar tipo
await logAtividade(event, 'create', 'configuracoes',
  `Criou tipo de documento: ${body.nome}`)

// Criar categoria
await logAtividade(event, 'create', 'configuracoes',
  `Criou categoria de documento: ${body.nome}`)
```

### 9. Políticas e Compliance

```typescript
// Criar política
await logAtividade(event, 'create', 'configuracoes',
  `Criou política: ${body.titulo}`, { politica_id: novaPolitica.id })

// Aceitar política
await logAtividade(event, 'approve', 'configuracoes',
  `Aceitou a política: ${politica.titulo}`, { politica_id: id })
```

### 10. Importação/Exportação

#### Importação
```typescript
await logAtividade(
  event,
  'create',
  'importacao',
  `Importou ${resultado.sucesso} registros de ${body.tipo}`,
  { 
    tipo: body.tipo, 
    total: resultado.total,
    sucesso: resultado.sucesso,
    erros: resultado.erros 
  }
)
```

#### Exportação
```typescript
await logAtividade(
  event,
  'create',
  'exportacao',
  `Exportou dados de ${body.tipo}`,
  { tipo: body.tipo, formato: body.formato }
)
```

### 11. Relatórios

#### Gerar relatório
```typescript
await logAtividade(
  event,
  'create',
  'relatorios',
  `Gerou relatório: ${body.tipo}`,
  { tipo: body.tipo, periodo: body.periodo }
)
```

#### Download de relatório
```typescript
await logAtividade(
  event,
  'download',
  'relatorios',
  `Baixou relatório: ${relatorio.nome}`,
  { relatorio_id: id }
)
```

### 12. Email

#### Enviar email
```typescript
await logAtividade(
  event,
  'create',
  'comunicados',
  `Enviou email: ${body.assunto}`,
  { destinatarios: body.destinatarios.length }
)
```

### 13. Campos Customizados

```typescript
// Criar campo
await logAtividade(event, 'create', 'configuracoes',
  `Criou campo customizado: ${body.nome}`)

// Atualizar campo
await logAtividade(event, 'update', 'configuracoes',
  `Atualizou campo customizado: ${campo.nome}`)
```

### 14. Alertas e Notificações

```typescript
// Criar alerta
await logAtividade(event, 'create', 'configuracoes',
  `Criou alerta: ${body.tipo}`, { alerta_id: novoAlerta.id })

// Gerar alertas
await logAtividade(event, 'create', 'configuracoes',
  `Gerou ${resultado.total} alertas`)
```

### 15. Backup e Segurança

```typescript
// Backup manual
await logAtividade(
  event,
  'create',
  'configuracoes',
  'Executou backup manual do sistema'
)

// Atualizar políticas de segurança
await logAtividade(
  event,
  'update',
  'configuracoes',
  'Atualizou políticas de segurança'
)
```

## 🔄 Padrão de Implementação

1. **Importe o utilitário** no topo do arquivo:
   ```typescript
   import { logAtividade } from '~/server/utils/log-atividade'
   ```

2. **Registre após ação bem-sucedida**:
   ```typescript
   if (!error && data) {
     await logAtividade(event, tipo, modulo, descricao, detalhes)
   }
   ```

3. **Use try-catch para não quebrar a aplicação**:
   ```typescript
   try {
     await logAtividade(...)
   } catch (err) {
     console.error('Erro ao registrar atividade:', err)
     // Não propaga o erro
   }
   ```

## ✅ Checklist de Integração

- [ ] Férias (criar, aprovar, rejeitar)
- [ ] Documentos (upload, download)
- [ ] Solicitações (criar, aprovar, rejeitar)
- [ ] Ponto (registrar)
- [ ] Comunicados (criar, ler)
- [ ] Alteração de dados (solicitar, aprovar)
- [ ] Configurações (empresa, folha, jornadas)
- [ ] Tipos/Categorias de documentos
- [ ] Políticas (criar, aceitar)
- [ ] Importação/Exportação
- [ ] Relatórios (gerar, download)
- [ ] Campos customizados
- [ ] Alertas
- [ ] Backup

## 🎯 Resultado

Após integrar, todas as ações aparecerão automaticamente no widget "Últimas Atividades" do dashboard!
