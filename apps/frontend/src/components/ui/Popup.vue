<script setup lang="ts">
import Tooltip from "./Tooltip.vue";

interface Props {
  content: string;
  placement?: "top" | "right" | "bottom" | "left";
  offset?: number;
  delay?: number;
  align?: "start" | "center" | "end"; 
}

withDefaults(defineProps<Props>(), {
  placement: "top",
  offset: 6,
  delay: 100,
  align: "center",
});
</script>

<template>
  <Tooltip
    :text="content"
    :side="placement"
    :side-offset="offset"
    :delay-duration="delay"
    :align="align"
  >
    <slot />
  </Tooltip>
</template>
