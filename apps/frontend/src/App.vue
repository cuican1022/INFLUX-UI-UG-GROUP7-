<script setup lang="ts">
import { computed, onMounted } from "vue";
import { Toaster } from "vue-sonner";
import "vue-sonner/style.css";
import { useAuthStore } from "./stores/auth";
import { useThemeStore } from "./stores/theme";

import Login from "./components/Login.vue";
import Dashboard from "./components/Dashboard.vue";

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
</template>

<style scoped></style>
