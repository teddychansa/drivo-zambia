import 'server-only'
import { connection } from 'next/server'
import { ObjectId, type Document, type Filter } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { normalizeProvince, type Province } from '@/lib/kitwe'

export type VehicleStatus = 'active' | 'in_service' | 'inactive'

export type Vehicle = {
  id: string
  plate: string
  make: string
  model: string
  year: number | null
  color: string | null
  ownerName: string | null
  ownerPhone: string | null
  status: string
  mileage: number | null
  garageId: string | null
  garageName: string | null
  createdAt: string | null
}

export type Garage = {
  id: string
  name: string
  area: string | null
  town: string | null
  province: Province | null
  address: string | null
  phone: string | null
  services: string[]
  rating: number | null
  hours: string | null
}

function str(value: unknown): string | null {
  if (value === null || value === undefined) return null
  const s = String(value).trim()
  return s.length ? s : null
}

function num(value: unknown): number | null {
  const n = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(n) ? n : null
}

function nested(doc: Document, key: string, field: string): unknown {
  const parent = doc[key]
  return parent && typeof parent === 'object' ? (parent as Document)[field] : undefined
}

function toIso(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString()
  if (value instanceof ObjectId) return value.getTimestamp().toISOString()
  const s = str(value)
  if (!s) return null
  const d = new Date(s)
  return Number.isNaN(d.getTime()) ? null : d.toISOString()
}

function normalizeStatus(value: unknown): string {
  const s = str(value)?.toLowerCase().replace(/[\s-]+/g, '_')
  if (!s) return 'active'
  if (['in_service', 'servicing', 'maintenance', 'in_repair', 'repair'].includes(s)) return 'in_service'
  if (['inactive', 'retired', 'off_road', 'disabled'].includes(s)) return 'inactive'
  return s
}

function normalizeVehicle(doc: Document, garages: Map<string, string>): Vehicle {
  const garageId = str(doc.garageId ?? nested(doc, 'garage', '_id'))
  const owner = typeof doc.owner === 'string' ? doc.owner : undefined
  return {
    id: String(doc._id),
    plate:
      str(doc.plateNumber ?? doc.plate ?? doc.registrationNumber ?? doc.registration ?? doc.regNo) ??
      'No plate',
    make: str(doc.make ?? doc.brand) ?? 'Unknown',
    model: str(doc.model) ?? '',
    year: num(doc.year),
    color: str(doc.color ?? doc.colour),
    ownerName: str(doc.ownerName ?? nested(doc, 'owner', 'name') ?? owner ?? doc.driverName),
    ownerPhone: str(doc.ownerPhone ?? nested(doc, 'owner', 'phone') ?? doc.phone),
    status: normalizeStatus(doc.status),
    mileage: num(doc.mileage ?? doc.odometer),
    garageId,
    garageName: (garageId && garages.get(garageId)) || str(nested(doc, 'garage', 'name') ?? doc.garageName),
    createdAt: toIso(doc.createdAt ?? doc._id),
  }
}

function normalizeGarage(doc: Document): Garage {
  const rawServices = doc.services ?? doc.specialties
  const services = Array.isArray(rawServices)
    ? rawServices.map((s) => String(s)).filter(Boolean)
    : (str(rawServices)?.split(',').map((s) => s.trim()).filter(Boolean) ?? [])
  return {
    id: String(doc._id),
    name: str(doc.name ?? doc.garageName) ?? 'Unnamed garage',
    area: str(doc.area ?? doc.suburb ?? nested(doc, 'location', 'area') ?? nested(doc, 'address', 'area')),
    town: str(doc.town ?? doc.city ?? nested(doc, 'location', 'city') ?? nested(doc, 'address', 'city')),
    province: normalizeProvince(
      doc.province ?? nested(doc, 'location', 'province') ?? nested(doc, 'address', 'province'),
    ),
    address: str(
      typeof doc.address === 'string' ? doc.address : (nested(doc, 'location', 'address') ?? nested(doc, 'address', 'street')),
    ),
    phone: str(doc.phone ?? doc.phoneNumber ?? nested(doc, 'contact', 'phone')),
    services,
    rating: num(doc.rating),
    hours: str(doc.hours ?? doc.openingHours),
  }
}

function escapeRegex(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

async function garageNameMap(): Promise<Map<string, string>> {
  const db = await getDb()
  const docs = await db
    .collection('garages')
    .find({}, { projection: { name: 1, garageName: 1 } })
    .limit(1000)
    .toArray()
  return new Map(docs.map((d) => [String(d._id), String(d.name ?? d.garageName ?? 'Garage')]))
}

export async function getVehicles(options: { query?: string; status?: string; limit?: number } = {}) {
  await connection()
  const db = await getDb()
  const filter: Filter<Document> = {}
  const q = options.query?.trim().slice(0, 64)
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = ['plateNumber', 'plate', 'registrationNumber', 'registration', 'make', 'model', 'ownerName', 'owner.name'].map(
      (field) => ({ [field]: rx }),
    )
  }
  const [docs, garages] = await Promise.all([
    db
      .collection('vehicles')
      .find(filter)
      .sort({ _id: -1 })
      .limit(options.limit ?? 200)
      .toArray(),
    garageNameMap(),
  ])
  const vehicles = docs.map((d) => normalizeVehicle(d, garages))
  return options.status ? vehicles.filter((v) => v.status === options.status) : vehicles
}

export async function getGarages(options: { query?: string; province?: string; limit?: number } = {}) {
  await connection()
  const db = await getDb()
  const filter: Filter<Document> = {}
  const q = options.query?.trim().slice(0, 64)
  if (q) {
    const rx = new RegExp(escapeRegex(q), 'i')
    filter.$or = ['name', 'area', 'suburb', 'town', 'city', 'province', 'address', 'services', 'location.area'].map(
      (field) => ({ [field]: rx }),
    )
  }
  const docs = await db
    .collection('garages')
    .find(filter)
    .sort({ name: 1 })
    .limit(options.limit ?? 200)
    .toArray()
  const garages = docs.map(normalizeGarage)
  return options.province ? garages.filter((g) => g.province === options.province) : garages
}

export async function getGarageOptions() {
  await connection()
  const map = await garageNameMap()
  return [...map.entries()].map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
}

export async function getFleetStats() {
  await connection()
  const db = await getDb()
  const [statusGroups, garageCount] = await Promise.all([
    db
      .collection('vehicles')
      .aggregate<{ _id: unknown; count: number }>([{ $group: { _id: '$status', count: { $sum: 1 } } }])
      .toArray(),
    db.collection('garages').countDocuments(),
  ])
  const byStatus: Record<string, number> = {}
  let total = 0
  for (const g of statusGroups) {
    const key = normalizeStatus(g._id)
    byStatus[key] = (byStatus[key] ?? 0) + g.count
    total += g.count
  }
  return {
    totalVehicles: total,
    active: byStatus.active ?? 0,
    inService: byStatus.in_service ?? 0,
    inactive: byStatus.inactive ?? 0,
    garages: garageCount,
  }
}
