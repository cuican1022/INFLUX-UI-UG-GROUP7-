import type { FluxQueryJSON, FluxQueryPart, FluxBucket, FluxDateRange, FluxFilter } from '../types/flux'

// Converts a FluxQueryJSON object to a Flux query string
export const jsonToFlux = (json: FluxQueryJSON): string => {
  if (json.rawQuery) {
    return json.rawQuery
  }

  if (json.parts.length === 0) {
    return ''
  }

  let fluxParts: string[] = []

  // Process each part in order
  for (const part of json.parts) {
    switch (part.type) {
      case 'bucket':
        if (part.bucket) {
          fluxParts.push(`from(bucket: "${part.bucket.name}")`)
        }
        break

      case 'dateRange':
        if (part.dateRange) {
          const stop = part.dateRange.stop ? `, stop: ${part.dateRange.stop}` : ''
          fluxParts.push(`    |> range(start: ${part.dateRange.start}${stop})`)
        }
        break

      case 'filter':
        if (part.filter) {
          const fieldName = part.filter.type === 'measurement' ? '_measurement' : '_field'
          const value = part.filter.value

          if (Array.isArray(value)) {
            // For multiple field values, create an OR condition
            const conditions = value.map(v => `r.${fieldName} == "${v}"`).join(' or ')
            fluxParts.push(`    |> filter(fn: (r) => ${conditions})`)
          } else {
            // Single value
            fluxParts.push(`    |> filter(fn: (r) => r.${fieldName} == "${value}")`)
          }
        }
        break
    }
  }

  // Add yield if we have parts
  if (fluxParts.length > 0) {
    fluxParts.push(`    |> yield(name: "result")`)
  }

  return fluxParts.join('\n')
}

/**
 * Converts a Flux query string to a FluxQueryJSON object
 * This is a basic parser for now. It can handle:
 * - buckets
 * - date range
 * - filters: measurement and field
 */
export const fluxToJson = (flux: string): FluxQueryJSON => {
  if (!flux.trim()) {
    return { parts: [] }
  }

  const lines = flux.split('\n').map(line => line.trim()).filter(line => line)

  // Simple pattern matching for basic queries
  const parts: FluxQueryPart[] = []
  let hasComplexQuery = false

  for (const line of lines) {
    // Skip yield and empty lines
    if (line.includes('yield') || !line) continue

    // Bucket from clause
    const bucketMatch = line.match(/from\(bucket:\s*"([^"]+)"\)/)
    if (bucketMatch) {
      parts.push({
        type: 'bucket',
        bucket: {
          id: bucketMatch[1],
          name: bucketMatch[1]
        }
      })
      continue
    }

    // Range clause
    const rangeMatch = line.match(/range\(start:\s*([^,\s)]+)(?:\s*,\s*stop:\s*([^)]+))?\)/)
    if (rangeMatch) {
      parts.push({
        type: 'dateRange',
        dateRange: {
          start: rangeMatch[1],
          stop: rangeMatch[2]
        }
      })
      continue
    }

    // Filter clause
    const filterMatch = line.match(/filter\(fn:\s*\(r\)\s*=>\s*r\.(_measurement|_field)\s*==\s*"([^"]+)"\)/)
    if (filterMatch) {
      const [, fieldType, value] = filterMatch
      parts.push({
        type: 'filter',
        filter: {
          type: fieldType === '_measurement' ? 'measurement' : 'field',
          value
        }
      })
      continue
    }

    // If we can't parse a line, mark as complex query
    // I.e. if there is a line that the parser was not able to parse, then its out of the scope currently
    // and just returns as the raw query (handle as warning in UI or something)
    if (line.includes('|')) {
      hasComplexQuery = true
    }
  }

  if (hasComplexQuery) {
    return { parts: [], rawQuery: flux }
  }

  return { parts }
}

// Creates a FluxQueryJSON with a bucket part
export const createBucketPart = (bucket: FluxBucket): FluxQueryPart => {
  return {
    type: 'bucket',
    bucket
  }
}

// Creates a FluxQueryJSON with a date range part
export const createDateRangePart = (dateRange: FluxDateRange): FluxQueryPart => {
  return {
    type: 'dateRange',
    dateRange
  }
}

// Creates a FluxQueryJSON with a filter part
export const createFilterPart = (filter: FluxFilter): FluxQueryPart => {
  return {
    type: 'filter',
    filter
  }
}

// Creates a measurement filter part
export const createMeasurementFilterPart = (measurement: string): FluxQueryPart => {
  return {
    type: 'filter',
    filter: {
      type: 'measurement',
      value: measurement
    }
  }
}

// Creates a field filter part
export const createFieldFilterPart = (field: string | string[]): FluxQueryPart => {
  return {
    type: 'filter',
    filter: {
      type: 'field',
      value: field
    }
  }
}

// Adds a part to an existing FluxQueryJSON
export const addPart = (json: FluxQueryJSON, part: FluxQueryPart): FluxQueryJSON => {
  // Remove rawQuery when adding structured parts
  const newJson: FluxQueryJSON = {
    parts: [...json.parts, part]
  }

  // If there was a rawQuery, we need to decide whether to keep it or replace with structured parts
  // For now, we'll replace it since we're adding a structured part
  return newJson
}

// Removes a part from FluxQueryJSON by index
export const removePart = (json: FluxQueryJSON, index: number): FluxQueryJSON => {
  const newParts = [...json.parts]
  newParts.splice(index, 1)

  return {
    parts: newParts,
    rawQuery: json.parts.length === 0 ? json.rawQuery : undefined
  }
}

// Updates a part in FluxQueryJSON
export const updatePart = (json: FluxQueryJSON, index: number, part: FluxQueryPart): FluxQueryJSON => {
  const newParts = [...json.parts]
  newParts[index] = part

  return {
    parts: newParts,
    rawQuery: json.rawQuery
  }
}
