# 🚨 CORREÇÃO IMEDIATA - ASSINATURA DIGITAL

## PROBLEMA IDENTIFICADO
- APIs retornando 404
- Tabela `assinaturas_ponto` existe mas falta coluna `assinatura_digital`
- Problemas de TypeScript nas APIs

## SOLUÇÃO EM 3 PASSOS

### PASSO 1: EXECUTAR SQL NO SUPABASE
Copie e cole este SQL no Supabase SQL Editor:

```sql
-- Adicionar coluna assinatura_digital se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'assinatura_digital'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN assinatura_digital TEXT;
        RAISE NOTICE '✅ Coluna assinatura_digital adicionada';
    END IF;
    
    -- Adicionar outras colunas necessárias
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'arquivo_csv'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN arquivo_csv TEXT;
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'ip_assinatura'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN ip_assinatura VARCHAR(45);
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'assinaturas_ponto' 
        AND column_name = 'data_assinatura'
    ) THEN
        ALTER TABLE assinaturas_ponto 
        ADD COLUMN data_assinatura TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Habilitar RLS
ALTER TABLE assinaturas_ponto ENABLE ROW LEVEL SECURITY;

-- Criar políticas
DROP POLICY IF EXISTS "Funcionários podem ver suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem ver suas próprias assinaturas" ON assinaturas_ponto
    FOR SELECT USING (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Funcionários podem inserir suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem inserir suas próprias assinaturas" ON assinaturas_ponto
    FOR INSERT WITH CHECK (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Funcionários podem atualizar suas próprias assinaturas" ON assinaturas_ponto;
CREATE POLICY "Funcionários podem atualizar suas próprias assinaturas" ON assinaturas_ponto
    FOR UPDATE USING (
        colaborador_id IN (
            SELECT id FROM colaboradores 
            WHERE auth_uid = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Administradores podem ver todas as assinaturas" ON assinaturas_ponto;
CREATE POLICY "Administradores podem ver todas as assinaturas" ON assinaturas_ponto
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM app_users 
            WHERE auth_uid = auth.uid() 
            AND role = 'admin'
        )
    );
```

### PASSO 2: REINICIAR SERVIDOR
```bash
# Parar servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### PASSO 3: TESTAR IMEDIATAMENTE

#### Teste 1: API de Consulta
```
GET http://localhost:3001/api/funcionario/ponto/assinatura?mes=12&ano=2025
```
**Esperado:** Status 200 (mesmo que retorne null)

#### Teste 2: API de Criação
```
POST http://localhost:3001/api/funcionario/ponto/assinar-digital
Content-Type: application/json

{
  "mes": 12,
  "ano": 2025,
  "assinaturaDigital": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
  "observacoes": "Teste"
}
```
**Esperado:** Status 200 com success: true

## RESULTADO FINAL
✅ APIs funcionando sem 404
✅ Assinatura digital operacional
✅ Dados salvos corretamente no banco

## SE AINDA DER ERRO
1. Verifique se o SQL foi executado com sucesso
2. Confirme que as colunas foram criadas
3. Reinicie o servidor Nuxt
4. Teste novamente

**IMPORTANTE:** Execute o SQL primeiro, depois reinicie o servidor!