# CORRIGIR ENUM TIPO_CONTA_BANCARIA

## Problema
O enum `tipo_conta_bancaria` não aceita o valor "poupanca", causando erro ao aprovar alterações de dados bancários.

## Solução

### 1. Execute o script SQL no Supabase

Abra o **SQL Editor** no Supabase e execute o conteúdo do arquivo:
```
database/fixes/fix_tipo_conta_enum.sql
```

### 2. Verifique os valores aceitos

Após executar, o enum deve aceitar os seguintes valores:
- corrente
- poupanca
- salario

### 3. Teste novamente

Após executar o script, tente aprovar a alteração de dados bancários novamente.

## Nota
Este é um fix necessário porque o enum foi criado sem o valor "poupanca" mas o sistema permite que usuários selecionem essa opção.
