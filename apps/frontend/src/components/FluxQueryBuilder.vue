<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useFluxQueryStore } from "../stores/fluxQuery";
import Dropdown from "./ui/Dropdown.vue";
import Popup from "./ui/Popup.vue";


const fluxQueryStore = useFluxQueryStore();

// Date selection state
const dateValue = ref<number>(1);
const dateFormat = ref<string>("h");
const dateFormats = ["s", "m", "h", "d", "w", "mo", "y"];
const dateFormatLabels = ["Seconds", "Minutes", "Hours", "Days", "Weeks", "Months", "Years"];

onMounted(async () => {
  await fluxQueryStore.fetchBuckets();
});

// Currently defaults to -1h for the date range
const handleBucketSelect = async (position: number) => {
  await fluxQueryStore.selectBucket(position);
};

const handleMeasurementSelect = async (position: number) => {
  await fluxQueryStore.selectMeasurement(position);
};

const handleFieldSelect = (positions: number | number[]) => {
  if (Array.isArray(positions)) {
    fluxQueryStore.selectField(positions);
  } else {
    fluxQueryStore.selectField([positions]);
  }
};

const removePart = (index: number) => {
  console.log("Removing part from component", index);
  fluxQueryStore.removePart(index);
};

const getPartTypeLabel = (type: string) => {
  switch (type) {
    case "bucket":
      return "FROM";
    case "dateRange":
      return "RANGE";
    case "filter":
      return "FILTER";
    default:
      return type.toUpperCase();
  }
};

const getSelectedFieldIndices = () => {
  const selectedFields = fluxQueryStore.selectedFields;
  return fluxQueryStore.fields
    .map((field, index) => (selectedFields.includes(field) ? index : -1))
    .filter((index) => index !== -1);
};

const handleDateFormatSelect = (position: number) => {
  dateFormat.value = dateFormats[position];
  updateDateRange();
};

const getCurrentFormatLabel = () => {
  const index = dateFormats.indexOf(dateFormat.value);
  return index !== -1 ? dateFormatLabels[index] : dateFormat.value;
};

const updateDateRange = () => {
  const start = `-${dateValue.value}${dateFormat.value}`;
  fluxQueryStore.selectDateRange(start);
};
</script>

<template>
  <div class="query-builder">
    <div class="query-builder-header">
      <h3>Build Your Flux Query</h3>
      <p class="query-builder-description">
        Select your data source step by step to build a Flux query
      </p>
    </div>

    <div class="query-builder-content">
      <div class="dropdowns-row">
        <div class="dropdown-group">
          <label class="dropdown-label">Bucket</label>
          <Dropdown
            :button-names="fluxQueryStore.buckets.map((bucket) => bucket.name)"
            @select="handleBucketSelect"
            :title="fluxQueryStore.getBucketsTitle"
            :disabled="fluxQueryStore.buckets.length === 0"
          />
        </div>

        <div class="dropdown-group">
          <label class="dropdown-label">Date Range</label>
          <div class="date-selection">
            <input
              v-model.number="dateValue"
              @input="updateDateRange"
              type="number"
              min="1"
              class="date-input"
              placeholder="1"
            />
            <Dropdown
              :button-names="dateFormatLabels"
              @select="handleDateFormatSelect"
              :title="getCurrentFormatLabel()"
              :disabled="false"
            />
          </div>
        </div>

        <div class="dropdown-group">
          <label class="dropdown-label">Measurement</label>
          <Dropdown
            :button-names="fluxQueryStore.measurements"
            @select="handleMeasurementSelect"
            :title="String(fluxQueryStore.getMeasurementsTitle)"
            :disabled="
              !fluxQueryStore.isBucketSelected ||
              fluxQueryStore.measurements.length === 0
            "
          />
        </div>

        <div class="dropdown-group">
          <label class="dropdown-label">Field</label>
          <Dropdown
            :button-names="fluxQueryStore.fields"
            @select="handleFieldSelect"
            @multiselect="handleFieldSelect"
            :title="String(fluxQueryStore.getFieldsTitle)"
            :disabled="
              !fluxQueryStore.isBucketSelected ||
              !fluxQueryStore.isMeasurementSelected ||
              fluxQueryStore.fields.length === 0
            "
            multiselect
            :selected-indices="getSelectedFieldIndices()"
          />
        </div>
      </div>

      <!-- Query Parts Display -->
      <div
        v-if="fluxQueryStore.fluxQuery.parts.length > 0"
        class="query-parts-section"
      >
        <h4 class="query-parts-title">Query Parts</h4>
        <div class="query-parts-grid">
          <div
            v-for="(part, index) in fluxQueryStore.fluxQuery.parts"
            :key="index"
            :class="['query-part-block', `part-type-${part.type}`]"
          >
            <div class="part-header">
              <span class="part-type">{{ getPartTypeLabel(part.type) }}</span>
              <Popup content="Remove this part" placement="top">
                <button
                @click="removePart(index)"
                class="remove-part-btn"
                aria-label="Remove this part"
                >
                ×
            </button>
            </Popup>

            </div>
            <div class="part-content">
              <template v-if="part.type === 'bucket'">
                <div class="part-value">{{ part.bucket?.name }}</div>
                <div class="part-label">Bucket</div>
              </template>
              <template v-else-if="part.type === 'dateRange'">
                <div class="part-value">
                  {{ part.dateRange?.start }}
                  <span v-if="part.dateRange?.stop"
                    >to {{ part.dateRange.stop }}</span
                  >
                </div>
                <div class="part-label">Time Range</div>
              </template>
              <template v-else-if="part.type === 'filter'">
                <div class="part-value">
                  <template v-if="Array.isArray(part.filter?.value)">
                    {{ part.filter.value.join(", ") }}
                  </template>
                  <template v-else>
                    {{ part.filter?.value }}
                  </template>
                </div>
                <div class="part-label">
                  {{
                    part.filter?.type === "measurement"
                      ? "Measurement"
                      : "Fields"
                  }}
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.query-builder {
  background: var(--bg);
  border-radius: 0.75rem;
  border: 1px solid #e5e7eb;
  height: 100%;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.query-builder-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--accent);
  background: linear-gradient(135deg, var(--bg) 0%, var(--accent) 100%);
  border-radius: 0.75rem 0.75rem 0 0;
}

.query-builder-header h3 {
  margin: 0 0 0.5rem 0;
  color: var(--text);
  font-size: 1.25rem;
  font-weight: 600;
}

.query-builder-description {
  margin: 0;
  color: var(--text);
  font-size: 0.875rem;
  line-height: 1.4;
}

.query-builder-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.dropdowns-row {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  flex-wrap: wrap;
}

.dropdown-group {
  display: flex;
  flex-direction: column;
  min-width: 12rem;
  flex: 1;
}

.dropdown-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  margin-bottom: 0.5rem;
  margin-left: 0.1rem;
}

/* Date Selection Styles */
.date-selection {
  display: flex;
  gap: 0.5rem;
  align-items: stretch;
}

.date-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  background: var(--bg);
  color: var(--text);
  font-weight: 500;
  transition: all 0.2s ease;
  min-width: 0;
  text-align: left;
  box-sizing: border-box;
}

.date-input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(30, 30, 30, 0.1);
}

.date-input::placeholder {
  color: var(--text);
  opacity: 0.6;
}

.date-input[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

/* Query Parts Section */
.query-parts-title {
  margin: 0 0 1rem 0;
  color: var(--text);
  font-size: 1rem;
  font-weight: 600;
}

.query-parts-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.query-part-block {
  background: var(--bg);
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  padding: 1rem;
  position: relative;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.query-part-block:hover {
  border-color: #cbd5e1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.part-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.part-type {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

.part-type-bucket .part-type {
  background: linear-gradient(135deg, #10b981, #059669);
}

.part-type-daterange .part-type {
  background: linear-gradient(135deg, #f59e0b, #d97706);
}

.part-type-filter .part-type {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

.remove-part-btn {
  background: none;
  border: none;
  color: var(--accent);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.2s ease;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-part-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.part-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.part-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text);
  font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace;
}

.part-label {
  font-size: 0.75rem;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 500;
}
</style>
