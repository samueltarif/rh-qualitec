// Composable para gerenciar dados da admin
export const useAdmin = () => {
  const adminInfo = ref<any>(null)
  const loading = ref(false)

  // Buscar informações da admin (Silvana)
  const buscarAdmin = async () => {
    loading.value = true
    try {
      const { data } = await useFetch('/api/admin/info')
      if (data.value?.success) {
        adminInfo.value = data.value.data
      }
    } catch (error) {
      console.error('Erro ao buscar admin:', error)
    } finally {
      loading.value = false
    }
  }

  // Obter nome da admin para sugestão
  const nomeAdmin = computed(() => {
    return adminInfo.value?.nome || 'Silvana Qualitec'
  })

  // Obter ID da admin
  const idAdmin = computed(() => {
    return adminInfo.value?.id || null
  })

  // Obter email da admin
  const emailAdmin = computed(() => {
    return adminInfo.value?.email || 'silvana@qualitec.com.br'
  })

  return {
    adminInfo: readonly(adminInfo),
    loading: readonly(loading),
    nomeAdmin,
    idAdmin,
    emailAdmin,
    buscarAdmin
  }
}
