<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { SquarePen, SquareCheckBig, BarChart3 } from "lucide-vue-next";
import { useFluxQueryStore } from "../stores/fluxQuery";
import { grafanaService } from "../services";
import Tooltip from "./ui/Tooltip.vue";
import { toast } from "vue-sonner";

const fluxQueryStore = useFluxQueryStore();

const isEditing = ref(false);
const textareaRef = ref<HTMLTextAreaElement>();
const localCode = ref(fluxQueryStore.fluxCode);

watch(
  () => fluxQueryStore.fluxCode,
  (newValue) => {
    localCode.value = newValue;
  }
);

const displayCode = computed(() => {
  return (
    localCode.value ||
    "// No Flux code available\n// Use the dashboard to generate code"
  );
});

// Syntax highlighting by replacing keywords and operators with spans that have certain classes
const highlightFluxCode = (code: string) => {
  if (!code) return code;

  // Define patterns to highlight
  const patterns = [
    // Strings first (to avoid conflicts)
    { regex: /"([^"\\]|\\.)*"/g, className: "flux-string" },
    { regex: /'([^'\\]|\\.)*'/g, className: "flux-string" },
    // Date values in range() parameters
    {
      regex: /(start|stop)\s*:\s*(-?\d+[smhdwy]|now\(\)|-\d+[smhdwy])/g,
      className: "flux-date",
      group: 2,
    },
    // Keywords
    { regex: /\b(from|range|filter|yield)\b/g, className: "flux-keyword" },
    // Comparison operators
    { regex: /(=>|==)/g, className: "flux-comparison" },
    // Pipe operator
    { regex: /\|>/g, className: "flux-operator" },
  ];

  let highlighted = code;

  // Process each pattern
  patterns.forEach(({ regex, className, group }) => {
    highlighted = highlighted.replace(regex, (match, ...groups) => {
      // Skip if already wrapped in a span
      if (match.includes("<span")) return match;

      // If group is specified, only highlight that capture group
      if (group !== undefined) {
        const targetGroup = groups[group - 1]; // groups are 0-indexed, group parameter is 1-indexed
        return match.replace(
          targetGroup,
          `<span class="${className}">${targetGroup}</span>`
        );
      }

      return `<span class="${className}">${match}</span>`;
    });
  });

  return highlighted;
};

const enableEditing = async () => {
  isEditing.value = true;
  await nextTick();
  textareaRef.value?.focus();
};

const disableEditing = () => {
  isEditing.value = false;
  fluxQueryStore.updateFluxCodeManually(localCode.value);
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    disableEditing();
  }
};

const handleTextareaBlur = () => {
  disableEditing();
};

const handleSendToGrafana = async () => {
  const fluxCode = fluxQueryStore.fluxCode;
  
  if (!fluxCode || fluxCode.trim() === '') {
    toast.error('No Flux code to send to Grafana');
    return;
  }

  const request = {
    fluxQuery: fluxCode,
    title: 'Flux Query Dashboard',
    panelTitle: 'Flux Query Result'
  };

  console.log('Sending to Grafana:', request);
  
  const response = await grafanaService.createDashboard(request);
  if (response.success) {
    window.open(response.dashboard.absoluteUrl, '_blank')
  }
};
</script>

<template>
  <div class="flux-editor">
    <div class="flux-editor-header">
      <h3>Flux Query</h3>
      <div class="header-buttons">
        <Tooltip text="Send to Grafana">
          <button @click="handleSendToGrafana" class="edit-button">
            <BarChart3 :size="16" />
          </button>
        </Tooltip>
        <div v-if="!isEditing">
          <Tooltip text="Edit Flux code">
            <button @click="enableEditing" class="edit-button">
              <SquarePen :size="16" />
            </button>
          </Tooltip>
        </div>
        <div v-else>
          <Tooltip text="Finish editing">
            <button @click="disableEditing" class="edit-button">
              <SquareCheckBig :size="16" />
            </button>
          </Tooltip>
        </div>
      </div>
    </div>

    <div class="flux-editor-content">
      <textarea
        v-if="isEditing"
        ref="textareaRef"
        v-model="localCode"
        @blur="handleTextareaBlur"
        @keydown="handleKeydown"
        class="flux-textarea"
        placeholder="Enter your Flux query here..."
      />
      <pre
        v-else
        class="flux-display"
        @click="enableEditing"
        v-html="highlightFluxCode(displayCode)"
      ></pre>
    </div>
  </div>
</template>

<style scoped>
.flux-editor {
  background: #1a1a1a;
  border-radius: 0.5rem;
  border: 1px solid #333;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

.flux-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #333;
  background: #222;
  border-radius: 0.5rem 0.5rem 0 0;
}

.flux-editor-header h3 {
  margin: 0;
  color: #e5e5e5;
  font-size: 1rem;
  font-weight: 600;
}

.header-buttons {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.edit-button {
  background: #333;
  border: 1px solid #555;
  border-radius: 0.25rem;
  padding: 0.5rem;
  color: #e5e5e5;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edit-button:hover {
  background: #444;
  border-color: #666;
  color: #fff;
}

.flux-editor-content {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.flux-textarea {
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: #e5e5e5;
  font-family: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: none;
  padding: 0;
}

.flux-textarea::placeholder {
  color: #666;
}

.flux-display {
  margin: 0;
  color: #e5e5e5;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
  cursor: pointer;
}

.flux-display:hover {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 0.25rem;
}

/* Syntax highlighting styles */
:deep(.flux-keyword) {
  color: #c792ea;
  font-weight: 600;
}

:deep(.flux-operator) {
  color: #89ddff;
  font-weight: 600;
}

:deep(.flux-comparison) {
  color: #f07178;
  font-weight: 600;
}

:deep(.flux-date) {
  color: #ffcb6b;
  font-weight: 600;
}

:deep(.flux-string) {
  color: #c3e88d;
}

.flux-editor {
  box-shadow: 0 0.25rem 0.5rem rgba(0, 0, 0, 0.3);
}
</style>
