<script setup lang="ts">
import Tooltip from "./Tooltip.vue";

defineProps<{
  content?: string;
}>();
</script>

<template>
  <Tooltip text="hello">
    <template #trigger>
      <!-- Default slot for the trigger element -->
      <slot />
    </template>

    <template #content>
      <!-- Tooltip text -->
      <slot name="content">{{ content }}</slot>
    </template>
  </Tooltip>
</template>
