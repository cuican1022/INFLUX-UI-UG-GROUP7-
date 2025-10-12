<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

interface Props {
  title: string
  buttonNames: string[]
  disabled?: boolean
  multiselect?: boolean
  selectedIndices?: number[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [position: number]
  multiselect: [positions: number[]]
}>()

const isOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const selectedIndices = ref<number[]>(props.selectedIndices || [])

const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
}

const closeDropdown = () => {
  isOpen.value = false
}

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

const selectItem = (position: number) => {
  if (props.multiselect) {
    // Toggle selection in multiselect mode
    const index = selectedIndices.value.indexOf(position)
    if (index > -1) {
      selectedIndices.value.splice(index, 1)
    } else {
      selectedIndices.value.push(position)
    }
    // Emit immediately on selection change
    emit('multiselect', [...selectedIndices.value])
  } else {
    emit('select', position)
    closeDropdown()
  }
}

const isSelected = (position: number) => {
  return selectedIndices.value.includes(position)
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

watch(
  () => props.title,
  () => {
    selectedIndices.value = []
    if (props.multiselect) emit('multiselect', [])
    closeDropdown()
  }
)

watch(
  () => props.selectedIndices,
  (val) => {
    if (Array.isArray(val)) {
      selectedIndices.value = [...val]
    } else {
      selectedIndices.value = []
    }
  },
  { immediate: true }
)

watch(
  () => props.buttonNames,
  () => {
    selectedIndices.value = []
    if (props.multiselect) emit('multiselect', [])
  }
)
</script>

<template>
  <div class="dropdown" ref="dropdownRef">
    <button 
      @click="toggleDropdown" 
      class="dropdown-trigger"
      :class="{ 'disabled': disabled }"
      :disabled="disabled"
    >
      {{ title }}
    </button>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-menu">
        <button
          v-for="(name, index) in buttonNames"
          :key="name"
          @click="selectItem(index)"
          :class="['dropdown-item', { 'selected': multiselect && isSelected(index) }]"
        >
          {{ name }}
        </button>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-trigger {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 0.5rem;
  cursor: pointer;
  width: 100%;
  min-width: 8rem;
  text-align: left;
  transition: all 0.2s ease;
}

.dropdown-trigger:hover:not(.disabled) {
  background-color: #efefef;
}

.dropdown-trigger.disabled:hover {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.dropdown-trigger.disabled {
  background-color: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  opacity: 0.6;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  margin-top: 0.25rem;
  padding: 0.25rem;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0,0,0,0.1);
  z-index: 1000;
  min-width: 7.5rem;
}

.dropdown-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  font-size: 0.875rem;
  color: #6b7280;
}

.selection-count {
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #9ca3af;
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 0.25rem;
  width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.close-btn:hover {
  background-color: #f3f4f6;
  color: #6b7280;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  border-radius: 0.5rem;
  font-weight: 400;
  transition: background-color 0.15s ease, font-weight 0.2s ease;
}

.dropdown-item:hover {
  background-color: #f5f5f5;
}

.dropdown-item.selected {
  background-color: #f5f5f5;
  font-weight: 600;
}

/* Dropdown transition styles */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.1s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-5px) scale(0.95);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-5px) scale(0.95);
}

.dropdown-enter-to,
.dropdown-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
