import { v as vueExports } from '../routes/renderer.mjs';

const useCargos = () => {
  const cargos = vueExports.ref([]);
  const loading = vueExports.ref(false);
  const error = vueExports.ref("");
  const carregarCargos = async () => {
    loading.value = true;
    error.value = "";
    try {
      const response = await $fetch("/api/cargos");
      if (response.success && response.data) {
        cargos.value = Array.isArray(response.data) ? response.data : [];
      } else {
        cargos.value = [];
      }
    } catch (err) {
      error.value = "Erro ao carregar cargos";
      console.error("Erro ao carregar cargos:", err);
      cargos.value = [];
    } finally {
      loading.value = false;
    }
  };
  const salvarCargo = async (cargo) => {
    loading.value = true;
    try {
      const response = await $fetch("/api/cargos", {
        method: "POST",
        body: cargo
      });
      if (response.success) {
        await carregarCargos();
        return { success: true, message: response.message || "Cargo salvo com sucesso!" };
      }
      return { success: false, message: "Erro ao salvar cargo" };
    } catch (err) {
      console.error("Erro ao salvar cargo:", err);
      return { success: false, message: err.data?.message || "Erro ao salvar cargo" };
    } finally {
      loading.value = false;
    }
  };
  const opcoesCargos = vueExports.computed(() => {
    if (!Array.isArray(cargos.value)) {
      return [];
    }
    return cargos.value.map((c) => ({
      value: c.id.toString(),
      label: c.nome
    }));
  });
  return {
    cargos: vueExports.readonly(cargos),
    loading: vueExports.readonly(loading),
    error: vueExports.readonly(error),
    opcoesCargos,
    carregarCargos,
    salvarCargo
  };
};

export { useCargos as u };
//# sourceMappingURL=useCargos-CxsoMI2z.mjs.map
