import { defineStore } from "pinia";
import { ref } from "vue";

export const useThemeStore = defineStore("theme", () => {
  // State
  const lightMode = ref<boolean>(true);

  const getLightMode = () => {
    return lightMode.value;
  };

  const getTheme = () => {
    return lightMode.value ? "light" : "dark";
  };

  const toggleLightMode = () => {
    lightMode.value = !lightMode.value;
    //localStorage.setItem("lightmode", lightMode);
  };

  const initializeTheme = () => {};

  initializeTheme();

  return {
    lightMode,

    // Getters
    getLightMode,
    getTheme,

    // Actions
    toggleLightMode,
  };
});
