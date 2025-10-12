<script setup lang="ts">
import { LogOut } from "lucide-vue-next";
import { Sun } from "lucide-vue-next";
import { Moon } from "lucide-vue-next";

import { useAuthStore } from "../stores/auth";
import { useThemeStore } from "../stores/theme";

import FluxQueryBuilder from "./FluxQueryBuilder.vue";
import FluxCodeEditor from "./FluxCodeEditor.vue";
import Tooltip from "./ui/Tooltip.vue";

const authStore = useAuthStore();
const themeStore = useThemeStore();

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <div class="dashboard" v-bind:class="themeStore.getTheme()">
    <div class="dot-pattern"></div>

    <div class="header">
      <div class="logo-container">
        <img src="/src/assets/atsys-logo.svg" alt="Atsys Logo" class="logo" />
      </div>

      <div class="theme-container">
        <Tooltip text="Theme">
          <button @click="themeStore.toggleLightMode()" class="logout-button">
            <Moon v-show="themeStore.getLightMode()" :size="20" />
            <Sun v-show="!themeStore.getLightMode()" :size="20" />
          </button>
        </Tooltip>
      </div>

      <div class="logout-container">
        <Tooltip text="Logout">
          <button @click="handleLogout" class="logout-button">
            <LogOut :size="20" />
          </button>
        </Tooltip>
      </div>
    </div>

    <div class="dashboard-content">
      <div class="left-panel">
        <FluxQueryBuilder />
      </div>

      <div class="right-panel">
        <FluxCodeEditor />
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  padding: 1rem;
  position: relative;
  height: calc(100vh - 2rem);
}

.dot-pattern {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, #141414 1px, transparent 1px);
  background-size: 1.5vw 1.5vw;
  background-position: 0 0;
  mask: linear-gradient(
    150deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.8) 20%,
    rgba(255, 255, 255, 0.4) 40%,
    rgba(255, 255, 255, 0) 70%
  );
  -webkit-mask: linear-gradient(
    150deg,
    rgba(255, 255, 255, 1) 0%,
    rgba(255, 255, 255, 0.8) 20%,
    rgba(255, 255, 255, 0.4) 40%,
    rgba(255, 255, 255, 0) 70%
  );
  z-index: -1;
}

.header {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  min-height: 3rem;
  gap: 1rem;
}

.logo-container {
  position: relative;
  flex-grow: 1;
  z-index: 1;
}

.logo {
  height: 2.5rem;
  width: auto;
  filter: invert(1);
}

.theme-container {
  position: relative;
  z-index: 1;
}

.logout-container {
  position: relative;
  z-index: 1;
}

.logout-button {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  padding: 0.5rem;
  color: #000;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logout-button:hover {
  background: rgba(255, 255, 255, 1);
  border-color: rgba(0, 0, 0, 0.3);
  color: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.dashboard-content {
  display: flex;
  gap: 1.5rem;
  height: calc(100% - 6rem);
}

.left-panel {
  flex: 0 0 calc(50% - 0.75rem);
  display: flex;
  flex-direction: column;
  opacity: 0.85;
}

.right-panel {
  flex: 0 0 calc(50% - 0.75rem);
  display: flex;
  flex-direction: column;
}
</style>
