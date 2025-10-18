<script setup lang="ts">
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from "radix-vue";

interface Props {
  text: string;
  sideOffset?: number;
  delayDuration?: number;
}

withDefaults(defineProps<Props>(), {
  sideOffset: 5,
  delayDuration: 100,
});
</script>

<template>
  <TooltipProvider>
    <TooltipRoot :delay-duration="delayDuration">
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent class="tooltip-content" :side-offset="sideOffset">
          {{ text }}
          <TooltipArrow class="tooltip-arrow" />
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>

<style>
.tooltip-content {
  border-radius: 0.5rem !important;
  padding: 0.5rem 0.75rem !important;
  font-size: 0.875rem !important;
  line-height: 1.25 !important;
  color: #374151 !important;
  background-color: white !important;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.1),
    0 0.0625rem 0.125rem rgba(0, 0, 0, 0.06) !important;
  user-select: none !important;
  animation-duration: 200ms !important;
  animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1) !important;
  will-change: transform, opacity !important;
  border: 1px solid #e5e7eb !important;
  max-width: 12rem !important;
  text-align: center !important;
  z-index: 9 !important;
}

.tooltip-content[data-state="delayed-open"][data-side="top"] {
  animation-name: slideDownAndFade !important;
}

.tooltip-content[data-state="delayed-open"][data-side="right"] {
  animation-name: slideLeftAndFade !important;
}

.tooltip-content[data-state="delayed-open"][data-side="bottom"] {
  animation-name: slideUpAndFade !important;
}

.tooltip-content[data-state="delayed-open"][data-side="left"] {
  animation-name: slideRightAndFade !important;
}

.tooltip-arrow {
  fill: white !important;
  filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.1)) !important;
}

@keyframes slideUpAndFade {
  from {
    opacity: 0;
    transform: translateY(0.125rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideRightAndFade {
  from {
    opacity: 0;
    transform: translateX(-0.125rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideDownAndFade {
  from {
    opacity: 0;
    transform: translateY(-0.125rem);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideLeftAndFade {
  from {
    opacity: 0;
    transform: translateX(0.125rem);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
