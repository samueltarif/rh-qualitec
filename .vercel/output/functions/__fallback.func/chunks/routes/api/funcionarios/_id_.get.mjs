import { d as defineEventHandler, e as getRouterParam, c as createError } from '../../../_/nitro.mjs';
import { s as serverSupabaseServiceRole } from '../../../_/serverSupabaseServiceRole.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import '@supabase/functions-js';
import '@supabase/postgrest-js';
import '@supabase/realtime-js';
import '@supabase/storage-js';
import '@supabase/auth-js';

const _id__get = defineEventHandler(async (event) => {
  console.log("\u{1F50D} [API] GET /api/funcionarios/[id] - Iniciando busca");
  try {
    const supabase = serverSupabaseServiceRole(event);
    const id = getRouterParam(event, "id");
    console.log("\u{1F4CB} [API] ID recebido:", id);
    if (!id) {
      console.error("\u274C [API] ID do funcion\xE1rio n\xE3o fornecido");
      throw createError({
        statusCode: 400,
        message: "ID do funcion\xE1rio n\xE3o fornecido"
      });
    }
    console.log("\u{1F50D} [API] Buscando funcion\xE1rio no Supabase...");
    const { data: funcionario, error } = await supabase.from("funcionarios").select("*").eq("id", id).single();
    if (error) {
      console.error("\u274C [API] Erro do Supabase:", error);
      throw error;
    }
    if (!funcionario) {
      console.error("\u274C [API] Funcion\xE1rio n\xE3o encontrado para ID:", id);
      throw createError({
        statusCode: 404,
        message: "Funcion\xE1rio n\xE3o encontrado"
      });
    }
    console.log("\u2705 [API] Funcion\xE1rio encontrado:", {
      id: funcionario.id,
      nome: funcionario.nome_completo,
      beneficios: funcionario.beneficios ? "Existe" : "Null",
      beneficiosType: typeof funcionario.beneficios,
      keys: Object.keys(funcionario)
    });
    return funcionario;
  } catch (error) {
    console.error("\u274C [API] Erro geral:", error);
    throw createError({
      statusCode: error.statusCode || 500,
      message: error.message || "Erro ao buscar funcion\xE1rio"
    });
  }
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
