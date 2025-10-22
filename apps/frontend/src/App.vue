<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";

import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";
import Tooltip from "./components/ui/Tooltip.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

const isAuthenticated = computed(() => authStore.isLoggedIn);

onMounted(async () => {
  await authStore.initializeAuth();
});
</script>

<template v-bind:class="themeStore.getTheme()">
  <Toaster richColors />

  <Login v-if="!isAuthenticated" />
  <Dashboard v-else />

  <div style="margin: 2rem;">
    <Tooltip text="Hello! I'm a tooltip 😎">
      <button style="padding: 0.5rem 1rem; border: 1px solid #ccc; border-radius: 0.25rem;">
        Hover me
      </button>
    </Tooltip>
  </div>
</template>

<style scoped>
</style>
