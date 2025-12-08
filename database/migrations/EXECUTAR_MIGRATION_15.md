# Migration 15 - Sistema de Notificações e Alertas

## Descrição
Esta migration cria o sistema completo de notificações e alertas para o RH.

## Tabelas Criadas

### 1. `configuracoes_notificacoes`
Configurações gerais de notificações da empresa:
- Quais tipos de eventos geram alertas
- Dias de antecedência para cada tipo
- Canais de envio (email, sistema, push)
- Destinatários padrão (RH, gestor, colaborador)
- Horários de envio

### 2. `tipos_alertas`
Tipos de alertas disponíveis no sistema:
- Documentos vencendo/vencidos
- Férias vencendo/programadas
- Contratos vencendo
- Período de experiência
- Exames médicos (ASO)
- Aniversários
- Ponto (faltas, atrasos, HE)
- Afastamentos
- Treinamentos/certificados
- Folha de pagamento
- Sistema

### 3. `alertas`
Alertas gerados pelo sistema:
- Referência ao colaborador
- Tipo de alerta
- Título e mensagem
- Prioridade (baixa, média, alta, crítica)
- Status (pendente, lido, resolvido, ignorado)
- Data de vencimento

### 4. `notificacoes_enviadas`
Histórico de notificações enviadas:
- Canal utilizado
- Status de envio
- Timestamps

### 5. `regras_notificacao`
Regras customizadas de notificação (para futuras implementações)

## Como Executar

1. Acesse o Supabase Dashboard
2. Vá em SQL Editor
3. Cole o conteúdo do arquivo `15_notificacoes_alertas.sql`
4. Execute

## Tipos de Alertas Pré-configurados

| Código | Nome | Categoria | Prioridade |
|--------|------|-----------|------------|
| DOC_VENCENDO | Documento Vencendo | documentos | média |
| DOC_VENCIDO | Documento Vencido | documentos | alta |
| FERIAS_VENCENDO | Férias Vencendo | férias | alta |
| CONTRATO_VENCENDO | Contrato Vencendo | contratos | alta |
| EXPERIENCIA_VENCENDO | Experiência Vencendo | contratos | alta |
| EXAME_VENCENDO | Exame Vencendo | saúde | alta |
| EXAME_VENCIDO | Exame Vencido | saúde | crítica |
| ANIVERSARIO | Aniversário | pessoal | baixa |
| ANIVERSARIO_EMPRESA | Aniversário de Empresa | pessoal | baixa |
| FALTA_INJUSTIFICADA | Falta Injustificada | ponto | média |
| ATRASOS_FREQUENTES | Atrasos Frequentes | ponto | média |
| HORAS_EXTRAS_EXCESSIVAS | Horas Extras Excessivas | ponto | média |

## Integração com Outras Áreas

O sistema de alertas se integra automaticamente com:

1. **Documentos RH** - Monitora validade de documentos
2. **Colaboradores** - Monitora aniversários, experiência, admissão
3. **Férias** - Monitora período aquisitivo e férias programadas
4. **Ponto** - Monitora faltas, atrasos e horas extras
5. **Exames** - Monitora ASO e exames periódicos

## Verificação

Após executar, verifique:
```sql
SELECT COUNT(*) FROM tipos_alertas; -- Deve retornar ~24
SELECT COUNT(*) FROM configuracoes_notificacoes; -- Deve retornar 1
```
