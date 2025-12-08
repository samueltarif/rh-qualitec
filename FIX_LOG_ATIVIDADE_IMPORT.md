# ✅ Correção: Import do serverSupabaseClient

## 🔴 Problema

Erro ao acessar o sistema:
```
Could not load server/utils/log-atividade
ENOENT: no such file or directory
```

## 🎯 Causa

O arquivo `server/utils/log-atividade.ts` estava faltando o import do `serverSupabaseClient`.

## ✅ Correção

Adicionado o import correto no arquivo:

```typescript
import type { H3Event } from 'h3'
import { serverSupabaseClient } from '#supabase/server'  // ✅ ADICIONADO

export const logAtividade = async (
  event: H3Event,
  tipoAcao: string,
  modulo: string,
  descricao: string,
  detalhes?: any
) => {
  try {
    const supabase = await serverSupabaseClient(event)
    // ...
  }
}
```

## 🚀 Resultado

Agora o sistema deve funcionar normalmente! Reinicie o servidor se necessário.

```bash
# No terminal do nuxt-app
npm run dev
```

Ou simplesmente recarregue a página.
