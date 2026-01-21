import { d as defineEventHandler, a as useRuntimeConfig } from '../../_/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';

const health_get = defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig();
    const envCheck = {
      supabaseUrl: !!config.public.supabaseUrl,
      supabaseKey: !!config.public.supabaseKey,
      supabaseServiceRoleKey: !!config.supabaseServiceRoleKey,
      nodeVersion: process.version,
      platform: process.platform,
      timestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    return {
      status: "ok",
      message: "Health check passed",
      environment: envCheck,
      vercel: {
        region: process.env.VERCEL_REGION || "unknown",
        env: process.env.VERCEL_ENV || "unknown"
      }
    };
  } catch (error) {
    console.error("Health check failed:", error);
    return {
      status: "error",
      message: error.message,
      stack: error.stack
    };
  }
});

export { health_get as default };
//# sourceMappingURL=health.get.mjs.map
