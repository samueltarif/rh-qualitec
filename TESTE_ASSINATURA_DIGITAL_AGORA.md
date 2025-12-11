# 🧪 TESTE ASSINATURA DIGITAL - EXECUTAR AGORA

## PASSOS PARA TESTAR

### 1. EXECUTAR O FIX SQL
Execute o arquivo: `database/FIX_ASSINATURA_DIGITAL_AGORA.sql` no Supabase

### 2. REINICIAR SERVIDOR
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### 3. TESTAR AS APIS

#### Teste 1: Verificar Assinatura Existente
```
GET http://localhost:3001/api/funcionario/ponto/assinatura?mes=12&ano=2025
```

**Resultado esperado:** 
- Status 200 (mesmo que retorne null)
- Não deve retornar 404

#### Teste 2: Criar Assinatura Digital
```
POST http://localhost:3001/api/funcionario/ponto/assinar-digital
Content-Type: application/json

{
  "mes": 12,
  "ano": 2025,
  "assinaturaDigital": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "observacoes": "Teste de assinatura"
}
```

**Resultado esperado:**
- Status 200
- Retorno com success: true

### 4. VERIFICAR NO SUPABASE
Após o teste, verificar na tabela `assinaturas_ponto`:
```sql
SELECT * FROM assinaturas_ponto ORDER BY created_at DESC LIMIT 5;
```

## PROBLEMAS COMUNS E SOLUÇÕES

### Erro 404 - Colaborador não encontrado
**Causa:** auth_uid não está vinculado
**Solução:** Execute o SQL de sincronização de auth_uid

### Erro 500 - Coluna não existe
**Causa:** Tabela não tem as colunas necessárias
**Solução:** Execute o FIX_ASSINATURA_DIGITAL_AGORA.sql

### Erro 403 - Permissão negada
**Causa:** Políticas RLS incorretas
**Solução:** As políticas são recriadas no fix SQL

## LOGS PARA MONITORAR
Observe os logs do servidor para:
- ✅ Colaborador encontrado
- ✅ Registros de ponto carregados
- ✅ Assinatura salva com sucesso
- ❌ Erros de permissão ou SQL

## RESULTADO FINAL ESPERADO
- ✅ API de consulta funcionando (200)
- ✅ API de criação funcionando (200)
- ✅ Dados salvos no banco
- ✅ Funcionário consegue assinar digitalmente