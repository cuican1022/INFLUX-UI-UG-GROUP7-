import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { bucketService } from '../services'
import { handleError } from '../utils'
import type { Bucket } from '@influxdata/influxdb-client-apis'
import type { FluxQueryJSON } from '../types/flux'
import { 
  jsonToFlux, 
  fluxToJson, 
  createBucketPart, 
  createMeasurementFilterPart, 
  createFieldFilterPart, 
  createDateRangePart 
} from '../utils/fluxUtils'

export const useFluxQueryStore = defineStore('fluxQuery', () => {
  // State
  const buckets = ref<Bucket[]>([])
  const measurements = ref<string[]>([])
  const fields = ref<string[]>([])
  const fluxQuery = ref<FluxQueryJSON>({ parts: [] })

  // Getters
  const fluxCode = computed(() => jsonToFlux(fluxQuery.value))

  const selectedBucket = computed(() => {
    const bucketPart = fluxQuery.value.parts.find(part => part.type === 'bucket')
    return bucketPart?.bucket || null
  })

  const selectedMeasurement = computed(() => {
    const measurementFilter = fluxQuery.value.parts.find(part =>
      part.type === 'filter' && part.filter?.type === 'measurement'
    )
    return measurementFilter?.filter?.value || null
  })

  const selectedField = computed(() => {
    const fieldFilter = fluxQuery.value.parts.find(part =>
      part.type === 'filter' && part.filter?.type === 'field'
    )
    return fieldFilter?.filter?.value || null
  })

  const selectedFields = computed(() => {
    const fieldFilter = fluxQuery.value.parts.find(part =>
      part.type === 'filter' && part.filter?.type === 'field'
    )
    const value = fieldFilter?.filter?.value
    return Array.isArray(value) ? value : (value ? [value] : [])
  })

  const selectedDateRange = computed(() => {
    const dateRangePart = fluxQuery.value.parts.find(part => part.type === 'dateRange')
    return dateRangePart?.dateRange || null
  })

  const isBucketSelected = computed(() => !!selectedBucket.value)
  const isMeasurementSelected = computed(() => !!selectedMeasurement.value)
  const isFieldSelected = computed(() => selectedFields.value.length > 0)
  const isDateRangeSelected = computed(() => !!selectedDateRange.value)

  const getBucketsTitle = computed(() => {
    if (buckets.value.length === 0) {
      return 'No buckets found'
    }
    return selectedBucket.value?.name || 'Select a bucket'
  })

  const getMeasurementsTitle = computed(() => {
    if (!selectedBucket.value) {
      return 'Select a bucket first'
    }
    if (measurements.value.length === 0) {
      return 'No measurements found'
    }
    return selectedMeasurement.value || 'Select a measurement'
  })

  const getFieldsTitle = computed(() => {
    if (!selectedBucket.value) {
      return 'Select a bucket first'
    }
    if (!selectedMeasurement.value) {
      return 'Select a measurement first'
    }
    if (fields.value.length === 0) {
      return 'No fields found'
    }
    const selectedFieldsList = selectedFields.value
    if (selectedFieldsList.length === 0) {
      return 'Select fields'
    }
    if (selectedFieldsList.length === 1) {
      return selectedFieldsList[0]
    }
    return `${selectedFieldsList.length} fields selected`
  })

  const getDateRangeTitle = computed(() => {
    const dateRange = selectedDateRange.value
    if (!dateRange) {
      return 'Select date range'
    }
    const stop = dateRange.stop ? ` to ${dateRange.stop}` : ''
    return `${dateRange.start}${stop}`
  })

  // Actions
  const fetchBuckets = async () => {
    try {
      const bucketsData = await bucketService.getBuckets()
      buckets.value = bucketsData.buckets || []
    } catch (error) {
      handleError('Error fetching buckets', error)
    }
  }

  const selectBucket = async (position: number) => {
    const bucket = buckets.value[position]
    if (!bucket) return

    // Clear existing parts and add new bucket part
    fluxQuery.value = {
      parts: [
        createBucketPart({
          id: bucket.id || bucket.name,
          name: bucket.name
        }),
        createDateRangePart({ start: '-1h' })
      ]
    }

    // Clear measurements and fields
    measurements.value = []
    fields.value = []

    try {
      const measurementsData = await bucketService.getMeasurements(bucket.name)
      measurements.value = measurementsData
    } catch (error) {
      handleError('Error fetching measurements', error)
    }
  }

  const selectMeasurement = async (position: number) => {
    const measurement = measurements.value[position]
    if (!measurement || !selectedBucket.value) return

    // Remove existing measurement and field filters, then add new measurement filter
    const newParts = fluxQuery.value.parts.filter(part =>
      !(part.type === 'filter' && (part.filter?.type === 'measurement' || part.filter?.type === 'field'))
    )

    newParts.push(createMeasurementFilterPart(measurement))

    fluxQuery.value = { parts: newParts }

    // Clear fields
    fields.value = []

    try {
      const fieldsData = await bucketService.getFields(selectedBucket.value.name, measurement)
      fields.value = fieldsData
    } catch (error) {
      handleError('Error fetching fields', error)
    }
  }

  const selectField = (positions: number | number[]) => {
    const positionsArray = Array.isArray(positions) ? positions : [positions]

    if (positionsArray.length === 0) {
      // If no positions selected, remove field filter
      const newParts = fluxQuery.value.parts.filter(part =>
        !(part.type === 'filter' && part.filter?.type === 'field')
      )
      fluxQuery.value = { parts: newParts }
      return
    }

    const selectedFieldNames = positionsArray
      .map(pos => fields.value[pos])
      .filter(field => field !== undefined)

    if (selectedFieldNames.length === 0) return

    // Remove existing field filter, then add new field filter
    const newParts = fluxQuery.value.parts.filter(part =>
      !(part.type === 'filter' && part.filter?.type === 'field')
    )

    newParts.push(createFieldFilterPart(selectedFieldNames))

    fluxQuery.value = { parts: newParts }
  }

  const selectDateRange = (start: string, stop?: string) => {
    // Remove existing date range, then add new date range
    const newParts = fluxQuery.value.parts.filter(part => part.type !== 'dateRange')

    newParts.push(createDateRangePart({ start, stop }))

    fluxQuery.value = { parts: newParts }
  }

  const updateFluxCodeManually = (newCode: string) => {
    // Convert the manual flux code to JSON structure
    fluxQuery.value = fluxToJson(newCode)
  }

  const removePart = (index: number) => {
    console.log('Removing part from store', index)
    const newParts = fluxQuery.value.parts.filter((_, i) => i !== index)
    fluxQuery.value = { parts: newParts }

    // Clear dependent data if needed
    if (index === 0) { // If removing bucket, clear everything
      measurements.value = []
      fields.value = []
    } else if (index === 1) { // If removing measurement filter, clear fields
      fields.value = []
    }
  }

  const resetSelection = () => {
    fluxQuery.value = { parts: [] }
    measurements.value = []
    fields.value = []
  }

  return {
    // State
    buckets,
    measurements,
    fields,
    fluxQuery,

    // Computed getters
    selectedBucket,
    selectedMeasurement,
    selectedField,
    selectedFields,
    selectedDateRange,
    fluxCode,

    // Getters
    isBucketSelected,
    isMeasurementSelected,
    isFieldSelected,
    isDateRangeSelected,
    getBucketsTitle,
    getMeasurementsTitle,
    getFieldsTitle,
    getDateRangeTitle,

    // Actions
    fetchBuckets,
    selectBucket,
    selectMeasurement,
    selectField,
    selectDateRange,
    updateFluxCodeManually,
    removePart,
    resetSelection
  }
})
