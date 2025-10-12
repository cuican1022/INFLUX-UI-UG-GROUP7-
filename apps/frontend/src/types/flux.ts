export interface FluxBucket {
  id: string
  name: string
}

export interface FluxMeasurement {
  id: string
  name: string
}

export interface FluxField {
  id: string
  name: string
}

export interface FluxDateRange {
  start: string
  stop?: string
}

export interface FluxFilter {
  type: 'measurement' | 'field'
  value: string | string[]
}

export interface FluxQueryPart {
  type: 'bucket' | 'dateRange' | 'filter'
  bucket?: FluxBucket
  dateRange?: FluxDateRange
  filter?: FluxFilter
}

export interface FluxQueryJSON {
  parts: FluxQueryPart[]
  rawQuery?: string // For manual editing support
}
