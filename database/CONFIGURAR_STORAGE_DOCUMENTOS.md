# 📦 Configurar Storage para Documentos RH

## 🎯 Visão Geral

Os **arquivos** (PDFs, imagens, etc) são salvos no **Supabase Storage**.
Os **metadados** (tipo, categoria, datas, status) são salvos no **banco de dados**.

## 📊 Estrutura Atual

### Banco de Dados (já configurado ✅)
- `documentos` - Documentos gerais de colaboradores
- `documentos_rh` - Documentos RH (atestados, declarações, etc)
- `categorias_documentos` - Categorias (Admissão, Médicos, etc)
- `tipos_documentos` - Tipos específicos (RG, CPF, Atestado, etc)

### Storage (precisa configurar ⚠️)
- Bucket para armazenar os arquivos físicos

## 🚀 Passo a Passo - Configurar Storage

### 1️⃣ Criar Bucket no Supabase

1. Acesse seu projeto no Supabase
2. Vá em **Storage** no menu lateral
3. Clique em **New bucket**
4. Configure:

```
Nome do bucket: documentos-rh
Público: NÃO (privado)
Allowed MIME types: 
  - application/pdf
  - image/jpeg
  - image/png
  - image/jpg
  - application/msword
  - application/vnd.openxmlformats-officedocument.wordprocessingml.document
File size limit: 10 MB
```

### 2️⃣ Configurar Políticas de Acesso (RLS)

No Supabase, vá em **Storage > Policies** e adicione:

#### Política 1: Upload de Arquivos
```sql
-- Permitir upload de documentos
CREATE POLICY "Permitir upload de documentos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documentos-rh'
);
```

#### Política 2: Leitura de Arquivos
```sql
-- Permitir leitura de documentos
CREATE POLICY "Permitir leitura de documentos"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'documentos-rh'
);
```

#### Política 3: Atualização de Arquivos
```sql
-- Permitir atualização de documentos
CREATE POLICY "Permitir atualização de documentos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'documentos-rh'
);
```

#### Política 4: Exclusão de Arquivos
```sql
-- Permitir exclusão de documentos
CREATE POLICY "Permitir exclusão de documentos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'documentos-rh'
);
```

### 3️⃣ Estrutura de Pastas no Bucket

Os arquivos serão organizados assim:

```
documentos-rh/
├── colaboradores/
│   ├── {colaborador_id}/
│   │   ├── admissao/
│   │   │   ├── rg.pdf
│   │   │   ├── cpf.pdf
│   │   │   └── ctps.pdf
│   │   ├── medicos/
│   │   │   ├── atestado-2024-01-15.pdf
│   │   │   └── aso-admissional.pdf
│   │   ├── pessoais/
│   │   │   ├── cnh.pdf
│   │   │   └── comprovante-residencia.pdf
│   │   └── outros/
│   │       └── documento.pdf
```

## 💻 Código para Upload (já implementado)

### Composable para Upload

Crie o arquivo: `nuxt-app/app/composables/useDocumentos.ts`

```typescript
export const useDocumentos = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  /**
   * Upload de documento
   */
  const uploadDocumento = async (
    colaboradorId: string,
    categoria: string,
    arquivo: File
  ) => {
    try {
      // Gerar nome único
      const timestamp = Date.now()
      const nomeArquivo = `${timestamp}-${arquivo.name}`
      const caminho = `colaboradores/${colaboradorId}/${categoria}/${nomeArquivo}`

      // Upload para o Storage
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .upload(caminho, arquivo, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) throw error

      // Obter URL pública (assinada)
      const { data: urlData } = await supabase.storage
        .from('documentos-rh')
        .createSignedUrl(caminho, 60 * 60 * 24 * 365) // 1 ano

      return {
        success: true,
        path: data.path,
        url: urlData?.signedUrl || '',
      }
    } catch (error: any) {
      console.error('Erro ao fazer upload:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Baixar documento
   */
  const downloadDocumento = async (caminho: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .download(caminho)

      if (error) throw error

      return {
        success: true,
        data
      }
    } catch (error: any) {
      console.error('Erro ao baixar:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Excluir documento
   */
  const excluirDocumento = async (caminho: string) => {
    try {
      const { error } = await supabase.storage
        .from('documentos-rh')
        .remove([caminho])

      if (error) throw error

      return { success: true }
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  /**
   * Obter URL assinada (temporária)
   */
  const getUrlAssinada = async (caminho: string, expiresIn = 3600) => {
    try {
      const { data, error } = await supabase.storage
        .from('documentos-rh')
        .createSignedUrl(caminho, expiresIn)

      if (error) throw error

      return {
        success: true,
        url: data.signedUrl
      }
    } catch (error: any) {
      console.error('Erro ao gerar URL:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  return {
    uploadDocumento,
    downloadDocumento,
    excluirDocumento,
    getUrlAssinada,
  }
}
```

## 📝 Exemplo de Uso

### Upload de Documento

```vue
<template>
  <div>
    <input type="file" @change="handleUpload" accept=".pdf,.jpg,.png">
    <p v-if="uploading">Enviando...</p>
  </div>
</template>

<script setup>
const { uploadDocumento } = useDocumentos()
const uploading = ref(false)

const handleUpload = async (event) => {
  const arquivo = event.target.files[0]
  if (!arquivo) return

  uploading.value = true

  // Upload do arquivo
  const resultado = await uploadDocumento(
    'id-do-colaborador',
    'medicos', // categoria
    arquivo
  )

  if (resultado.success) {
    // Salvar metadados no banco
    await $fetch('/api/documentos-rh', {
      method: 'POST',
      body: {
        colaborador_id: 'id-do-colaborador',
        tipo_documento_id: 'id-do-tipo',
        categoria_id: 'id-da-categoria',
        arquivo_url: resultado.path, // Salvar o path
        status: 'Pendente'
      }
    })

    alert('Documento enviado com sucesso!')
  } else {
    alert('Erro ao enviar: ' + resultado.error)
  }

  uploading.value = false
}
</script>
```

## ✅ Checklist de Configuração

- [ ] Criar bucket `documentos-rh` no Supabase Storage
- [ ] Configurar como privado (não público)
- [ ] Adicionar 4 políticas RLS (INSERT, SELECT, UPDATE, DELETE)
- [ ] Definir tipos MIME permitidos
- [ ] Definir limite de tamanho (10 MB recomendado)
- [ ] Criar composable `useDocumentos.ts`
- [ ] Testar upload de arquivo
- [ ] Testar download de arquivo
- [ ] Testar exclusão de arquivo

## 🔒 Segurança

### URLs Assinadas
Os arquivos são **privados** e só podem ser acessados via **URLs assinadas** (temporárias).

```typescript
// URL válida por 1 hora
const { url } = await getUrlAssinada(caminho, 3600)

// URL válida por 1 dia
const { url } = await getUrlAssinada(caminho, 86400)

// URL válida por 1 ano
const { url } = await getUrlAssinada(caminho, 31536000)
```

### Validações Recomendadas

```typescript
// Validar tipo de arquivo
const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/png']
if (!tiposPermitidos.includes(arquivo.type)) {
  alert('Tipo de arquivo não permitido')
  return
}

// Validar tamanho (10 MB)
const tamanhoMaximo = 10 * 1024 * 1024 // 10 MB em bytes
if (arquivo.size > tamanhoMaximo) {
  alert('Arquivo muito grande. Máximo: 10 MB')
  return
}
```

## 📊 Fluxo Completo

```
1. Usuário seleciona arquivo
   ↓
2. Frontend valida tipo e tamanho
   ↓
3. Upload para Supabase Storage (bucket documentos-rh)
   ↓
4. Storage retorna path do arquivo
   ↓
5. Frontend salva metadados no banco (documentos_rh)
   - colaborador_id
   - tipo_documento_id
   - categoria_id
   - arquivo_url (path do storage)
   - status, datas, etc
   ↓
6. Para visualizar: gerar URL assinada do path
   ↓
7. Exibir documento (PDF viewer, imagem, etc)
```

## 🎯 Resumo

**Banco de Dados**: Metadados (tipo, categoria, status, datas)
**Storage**: Arquivos físicos (PDFs, imagens)
**Segurança**: Bucket privado + URLs assinadas
**Organização**: Pastas por colaborador e categoria

Após configurar o Storage, o sistema estará 100% funcional para upload e gerenciamento de documentos!

