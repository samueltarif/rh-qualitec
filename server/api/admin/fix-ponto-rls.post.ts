import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseServiceRole(event)

  try {
    const queries = [
      // Remover políticas antigas
      `DROP POLICY IF EXISTS "funcionarios_view_own_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "funcionarios_insert_own_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "funcionarios_update_own_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "admins_all_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "service_role_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "users_select_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "users_insert_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "users_update_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "users_delete_ponto" ON registros_ponto`,
      `DROP POLICY IF EXISTS "admins_rh_all_ponto" ON registros_ponto`,
      
      // Criar políticas corretas
      `CREATE POLICY "admins_rh_all_ponto" ON registros_ponto
        FOR ALL TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE auth_uid = auth.uid()
            AND role IN ('admin', 'rh', 'gestor')
          )
        )
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE auth_uid = auth.uid()
            AND role IN ('admin', 'rh', 'gestor')
          )
        )`,
      
      `CREATE POLICY "funcionarios_view_own_ponto" ON registros_ponto
        FOR SELECT TO authenticated
        USING (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE auth_uid = auth.uid()
            AND colaborador_id = registros_ponto.colaborador_id
          )
        )`,
      
      `CREATE POLICY "funcionarios_insert_own_ponto" ON registros_ponto
        FOR INSERT TO authenticated
        WITH CHECK (
          EXISTS (
            SELECT 1 FROM app_users
            WHERE auth_uid = auth.uid()
            AND colaborador_id = registros_ponto.colaborador_id
          )
        )`,
      
      `CREATE POLICY "service_role_ponto" ON registros_ponto
        FOR ALL TO service_role
        USING (true)
        WITH CHECK (true)`,
      
      `ALTER TABLE registros_ponto ENABLE ROW LEVEL SECURITY`
    ]

    const results = []
    for (const query of queries) {
      try {
        const { error } = await client.rpc('exec_sql', { sql: query })
        if (error) {
          results.push({ query: query.substring(0, 50), error: error.message })
        } else {
          results.push({ query: query.substring(0, 50), success: true })
        }
      } catch (e: any) {
        results.push({ query: query.substring(0, 50), error: e.message })
      }
    }

    return { success: true, results }
  } catch (e: any) {
    console.error('Erro ao executar fix:', e)
    return { success: false, error: e.message }
  }
})
