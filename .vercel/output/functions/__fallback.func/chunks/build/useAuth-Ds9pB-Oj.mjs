import { i as useState, n as navigateTo } from './server.mjs';
import { computed } from 'vue';

const useAuth = () => {
  const user = useState("auth-user", () => {
    return null;
  });
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => user.value?.tipo === "admin");
  const login = async (email, senha) => {
    try {
      const response = await $fetch("/api/auth/login", {
        method: "POST",
        body: { email, senha }
      });
      if (response.success && response.user) {
        user.value = response.user;
        if (false) ;
        return { success: true, message: "Login realizado com sucesso!" };
      }
      return { success: false, message: "Email ou senha incorretos. Tente novamente." };
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: error.data?.message || "Email ou senha incorretos. Tente novamente."
      };
    }
  };
  const logout = () => {
    user.value = null;
    navigateTo("/login");
  };
  const updateUser = (updatedData) => {
    if (user.value) {
      user.value = { ...user.value, ...updatedData };
    }
  };
  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    updateUser
  };
};

export { useAuth as u };
//# sourceMappingURL=useAuth-Ds9pB-Oj.mjs.map
