# Sistema de Notificações e Alertas - RH Qualitec

## Implementação Concluída

### Arquivos Criados

#### Database
- `database/migrations/15_notificacoes_alertas.sql` - Migration completa

#### APIs
- `server/api/notificacoes/config.get.ts` - Buscar configurações
- `server/api/notificacoes/config.put.ts` - Salvar configurações
- `server/api/alertas/index.get.ts` - Listar alertas
- `server/api/alertas/[id].put.ts` - Atualizar alerta
- `server/api/alertas/tipos.get.ts` - Listar tipos de alertas
- `server/api/alertas/gerar.post.ts` - Gerar alertas automaticamente
- `server/api/alertas/stats.get.ts` - Estatísticas de alertas

#### Frontend
- `app/pages/configuracoes/notificacoes.vue` - Página de configurações

### Funcionalidades

#### Configurações de Notificações
- **Documentos**: Alertas de documentos vencendo/vencidos
- **Contratos**: Alertas de contratos temporários vencendo
- **Experiência**: Alertas de período de experiência (45/90 dias)
- **Férias**: Alertas de férias vencendo e programadas
- **Aniversários**: Alertas de aniversários pessoais e de empresa
- **Exames Médicos**: Alertas de ASO e exames periódicos
- **Ponto**: Alertas de faltas, atrasos e horas extras
- **Afastamentos**: Alertas de afastamentos longos e retornos
- **Treinamentos**: Alertas de certificados/NRs vencendo
- **Folha**: Alertas de processamento de folha

#### Canais de Envio
- Notificações no sistema
- E-mail (configurável)
- Push notifications (futuro)

#### Destinatários
- Equipe de RH
- Gestor do colaborador
- Próprio colaborador

### Integrações Automáticas

O sistema se integra automaticamente com:

1. **documentos_rh** - Usa campo `data_validade` para gerar alertas
2. **colaboradores** - Usa `data_nascimento` e `data_admissao`
3. **tipos_documentos** - Usa configurações de validade e notificação

### Como Usar

1. Execute a migration `15_notificacoes_alertas.sql` no Supabase
2. Acesse Configurações > Notificações e Alertas
3. Configure quais alertas deseja receber
4. Clique em "Gerar Alertas Agora" para testar

### Próximos Passos (Futuro)

- [ ] Cron job para geração automática de alertas
- [ ] Envio de e-mails via SMTP
- [ ] Push notifications
- [ ] Regras customizadas de notificação
- [ ] Dashboard de alertas na home
