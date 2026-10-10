export const KITWE_AREAS = [
  'Kitwe CBD',
  'Nkana East',
  'Nkana West',
  'Parklands',
  'Riverside',
  'Chimwemwe',
  'Ndeke',
  'Kwacha',
  'Buchi',
  'Kamitondo',
  'Chamboli',
  'Mindolo',
  'Garneton',
  'Ipusukilo',
  'Bulangililo',
] as const

export const ZAMBIA_PROVINCES = [
  'Copperbelt',
  'Lusaka',
  'Central',
  'Southern',
  'Eastern',
  'Northern',
  'Muchinga',
  'Luapula',
  'North-Western',
  'Western',
] as const

export type Province = (typeof ZAMBIA_PROVINCES)[number]

export function normalizeProvince(value: unknown): Province | null {
  if (typeof value !== 'string') return null
  const key = value
    .trim()
    .replace(/\s+province$/i, '')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
  return ZAMBIA_PROVINCES.find((p) => p.toLowerCase() === key) ?? null
}

export function formatGarageLocation(town: string | null, province: string | null) {
  return [town, province ? `${province} Province` : null].filter(Boolean).join(', ') || 'Zambia'
}

export const VEHICLE_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'in_service', label: 'In service' },
  { value: 'inactive', label: 'Inactive' },
] as const

export function statusLabel(status: string) {
  return VEHICLE_STATUSES.find((s) => s.value === status)?.label ?? status.replace(/_/g, ' ')
}

export function formatKm(value: number | null) {
  return value === null ? '—' : `${new Intl.NumberFormat('en-ZM').format(value)} km`
}
