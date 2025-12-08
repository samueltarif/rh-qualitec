# ✅ Migration 13 - Jornadas de Trabalho

## 📋 O que faz

Cria o sistema completo de jornadas de trabalho com:
- Tabela `jornadas_trabalho` - Configuração de horários, escalas e turnos
- Tabela `jornada_horarios` - Horários personalizados por dia da semana
- 8 jornadas pré-cadastradas, incluindo a **Jornada Qualitec Padrão**

## 🚀 Como Executar

1. Acesse o **Supabase SQL Editor**
2. Copie e cole o conteúdo de `13_jornadas_trabalho.sql`
3. Execute o script
4. Verifique as mensagens de sucesso

## ✅ Verificação

Execute no SQL Editor:
```sql
-- Verificar jornadas criadas
SELECT nome, codigo, tipo, carga_horaria_semanal, hora_entrada, hora_saida 
FROM jornadas_trabalho 
ORDER BY padrao DESC, nome;

-- Verificar horário especial da sexta-feira
SELECT j.nome, jh.dia_semana, jh.hora_entrada, jh.hora_saida
FROM jornada_horarios jh
JOIN jornadas_trabalho j ON j.id = jh.jornada_id
WHERE j.codigo = 'QUAL-44';
```

## 📊 Jornada Qualitec Padrão

### Horário Normal (Segunda a Quinta)
- **Entrada:** 07:30
- **Saída:** 17:30
- **Almoço:** 12:00 às 13:15 (1h15min)
- **Café:** 15min (incluído no intervalo)
- **Carga diária:** 8h45min

### Horário Sexta-feira
- **Entrada:** 07:30
- **Saída:** 16:30 (1h a menos)
- **Almoço:** 12:00 às 13:15 (1h15min)
- **Café:** 15min (incluído no intervalo)
- **Carga diária:** 7h45min

### Carga Horária Total
- **Semanal:** 44 horas
- **Segunda a Quinta:** 4 dias × 8h45min = 35h
- **Sexta:** 1 dia × 7h45min = 7h45min
- **Sábado/Domingo:** Folga

## 🎯 Outras Jornadas Pré-cadastradas

1. **Qualitec Padrão** (QUAL-44) - Padrão da empresa ✅
2. **Comercial 44h** (COM-44) - 08:00-17:00
3. **Comercial 40h** (COM-40) - 08:00-17:00 (40h/semana)
4. **Escala 12x36** (ESC-12X36) - 12h trabalho, 36h folga
5. **Escala 6x1** (ESC-6X1) - 6 dias trabalho, 1 folga
6. **Meio Período Manhã** (PARC-M) - 08:00-12:00
7. **Meio Período Tarde** (PARC-T) - 13:00-17:00
8. **Noturno** (NOT-44) - 22:00-06:00

## 🔗 Integrações

### Colaboradores
Após executar esta migration, execute o fix:
```sql
-- Adicionar campo jornada_id nos colaboradores
fixes/fix_colaboradores_add_jornada.sql
```

Depois, você pode vincular colaboradores às jornadas:
```sql
-- Exemplo: vincular todos os colaboradores à jornada Qualitec
UPDATE colaboradores 
SET jornada_id = (SELECT id FROM jornadas_trabalho WHERE codigo = 'QUAL-44')
WHERE jornada_id IS NULL;
```

### Ponto
O sistema de ponto usará os horários configurados para:
- Validar batidas de entrada/saída
- Aplicar tolerâncias
- Calcular atrasos e horas extras
- Considerar horários diferentes por dia da semana

### Folha de Pagamento
O cálculo de folha usará as jornadas para:
- Calcular horas trabalhadas
- Aplicar adicional noturno (se configurado)
- Calcular horas extras com percentuais corretos
- Considerar DSR (Descanso Semanal Remunerado)

## 💡 Como Usar

1. **Acesse:** `/configuracoes/jornadas`
2. **Visualize** as jornadas pré-cadastradas
3. **Edite** a jornada Qualitec se necessário
4. **Crie** novas jornadas para casos especiais
5. **Vincule** colaboradores às jornadas apropriadas

## 📝 Notas

- A jornada Qualitec já está marcada como **padrão**
- O horário de sexta-feira está configurado automaticamente
- Os intervalos (almoço + café) totalizam 1h30min
- O sistema calcula automaticamente as 44h semanais
- Você pode editar qualquer jornada pela interface

## ⚠️ Importante

- Sempre mantenha pelo menos uma jornada ativa
- A jornada padrão será usada para novos colaboradores
- Não exclua jornadas que estão vinculadas a colaboradores
- O sistema faz "soft delete" (apenas desativa)
