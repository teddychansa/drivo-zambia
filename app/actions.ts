'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { ObjectId } from 'mongodb'
import { getDb } from '@/lib/mongodb'
import { VEHICLE_STATUSES, ZAMBIA_PROVINCES } from '@/lib/kitwe'

function provinceField(formData: FormData) {
  const value = field(formData, 'province', 20)
  return (ZAMBIA_PROVINCES as readonly string[]).includes(value) ? value : null
}

export type FormState = { error?: string; fieldErrors?: Record<string, string> }

function field(formData: FormData, name: string, max = 120) {
  const value = formData.get(name)
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

const PHONE_RX = /^\+?[0-9\s-]{9,16}$/

export async function createVehicle(_prev: FormState, formData: FormData): Promise<FormState> {
  const plate = field(formData, 'plateNumber', 16).toUpperCase().replace(/\s+/g, ' ')
  const make = field(formData, 'make', 40)
  const model = field(formData, 'model', 40)
  const yearRaw = field(formData, 'year', 4)
  const color = field(formData, 'color', 30)
  const ownerName = field(formData, 'ownerName', 80)
  const ownerPhone = field(formData, 'ownerPhone', 20)
  const mileageRaw = field(formData, 'mileage', 9)
  const status = field(formData, 'status', 20)
  const garageId = field(formData, 'garageId', 24)

  const fieldErrors: Record<string, string> = {}
  if (!/^[A-Z0-9 ]{2,12}$/.test(plate)) fieldErrors.plateNumber = 'Enter a valid plate, e.g. BAE 4521'
  if (!make) fieldErrors.make = 'Make is required'
  if (!model) fieldErrors.model = 'Model is required'
  const currentYear = new Date().getFullYear()
  const year = yearRaw ? Number(yearRaw) : null
  if (year !== null && (!Number.isInteger(year) || year < 1950 || year > currentYear + 1)) {
    fieldErrors.year = `Year must be between 1950 and ${currentYear + 1}`
  }
  const mileage = mileageRaw ? Number(mileageRaw) : null
  if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0)) fieldErrors.mileage = 'Mileage must be a positive number'
  if (ownerPhone && !PHONE_RX.test(ownerPhone)) fieldErrors.ownerPhone = 'Enter a valid phone, e.g. +260 97 123 4567'
  if (!VEHICLE_STATUSES.some((s) => s.value === status)) fieldErrors.status = 'Choose a status'
  if (garageId && !ObjectId.isValid(garageId)) fieldErrors.garageId = 'Choose a valid garage'

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  try {
    const db = await getDb()
    const existing = await db.collection('vehicles').findOne({ plateNumber: plate }, { projection: { _id: 1 } })
    if (existing) return { fieldErrors: { plateNumber: 'A vehicle with this plate already exists' } }

    await db.collection('vehicles').insertOne({
      plateNumber: plate,
      make,
      model,
      year,
      color: color || null,
      ownerName: ownerName || null,
      ownerPhone: ownerPhone || null,
      mileage,
      status,
      garageId: garageId ? new ObjectId(garageId) : null,
      city: 'Kitwe',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('[drivo] createVehicle failed', error)
    return { error: 'Could not save the vehicle. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/vehicles')
}

export type UpdateVehicleState = FormState & { success?: boolean }

export async function updateVehicle(
  id: string,
  _prev: UpdateVehicleState,
  formData: FormData,
): Promise<UpdateVehicleState> {
  if (!ObjectId.isValid(id)) return { error: 'This vehicle no longer exists.' }

  const plate = field(formData, 'plateNumber', 16).toUpperCase().replace(/\s+/g, ' ')
  const make = field(formData, 'make', 40)
  const model = field(formData, 'model', 40)
  const yearRaw = field(formData, 'year', 4)
  const color = field(formData, 'color', 30)
  const ownerName = field(formData, 'ownerName', 80)
  const ownerPhone = field(formData, 'ownerPhone', 20)
  const mileageRaw = field(formData, 'mileage', 9)

  const fieldErrors: Record<string, string> = {}
  if (!/^[A-Z0-9 ]{2,12}$/.test(plate)) fieldErrors.plateNumber = 'Enter a valid plate, e.g. BAE 4521'
  if (!make) fieldErrors.make = 'Make is required'
  if (!model) fieldErrors.model = 'Model is required'
  const currentYear = new Date().getFullYear()
  const year = yearRaw ? Number(yearRaw) : null
  if (year !== null && (!Number.isInteger(year) || year < 1950 || year > currentYear + 1)) {
    fieldErrors.year = `Year must be between 1950 and ${currentYear + 1}`
  }
  const mileage = mileageRaw ? Number(mileageRaw) : null
  if (mileage !== null && (!Number.isInteger(mileage) || mileage < 0)) fieldErrors.mileage = 'Mileage must be a positive number'
  if (ownerPhone && !PHONE_RX.test(ownerPhone)) fieldErrors.ownerPhone = 'Enter a valid phone, e.g. +260 97 123 4567'

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  const _id = new ObjectId(id)
  try {
    const db = await getDb()
    const duplicate = await db
      .collection('vehicles')
      .findOne({ plateNumber: plate, _id: { $ne: _id } }, { projection: { _id: 1 } })
    if (duplicate) return { fieldErrors: { plateNumber: 'Another vehicle already uses this plate' } }

    const result = await db.collection('vehicles').updateOne(
      { _id },
      {
        $set: {
          plateNumber: plate,
          make,
          model,
          year,
          color: color || null,
          ownerName: ownerName || null,
          ownerPhone: ownerPhone || null,
          mileage,
          updatedAt: new Date(),
        },
      },
    )
    if (result.matchedCount === 0) return { error: 'This vehicle no longer exists.' }
  } catch (error) {
    console.error('[drivo] updateVehicle failed', error)
    return { error: 'Could not update the vehicle. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteVehicle(id: string): Promise<{ error?: string }> {
  if (!ObjectId.isValid(id)) return { error: 'This vehicle no longer exists.' }
  try {
    const db = await getDb()
    await db.collection('vehicles').deleteOne({ _id: new ObjectId(id) })
  } catch (error) {
    console.error('[drivo] deleteVehicle failed', error)
    return { error: 'Could not delete the vehicle. Please try again.' }
  }
  revalidatePath('/', 'layout')
  return {}
}

export type UpdateGarageState = FormState & { success?: boolean }

export async function updateGarage(
  id: string,
  _prev: UpdateGarageState,
  formData: FormData,
): Promise<UpdateGarageState> {
  if (!ObjectId.isValid(id)) return { error: 'This garage no longer exists.' }

  const name = field(formData, 'name', 80)
  const province = provinceField(formData)
  const area = field(formData, 'area', 60)
  const town = field(formData, 'town', 60)
  const phone = field(formData, 'phone', 20)
  const ratingRaw = field(formData, 'rating', 4)
  const checked = formData
    .getAll('services')
    .filter((v): v is string => typeof v === 'string')
    .map((s) => s.trim().slice(0, 40))
  const extra = field(formData, 'otherServices', 300)
    .split(',')
    .map((s) => s.trim().slice(0, 40))
  const services = [...new Set([...checked, ...extra].filter(Boolean))].slice(0, 20)

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Garage name is required'
  if (!province) fieldErrors.province = 'Choose a province'
  if (!town) fieldErrors.town = 'Town is required'
  if (phone && !PHONE_RX.test(phone)) fieldErrors.phone = 'Enter a valid phone, e.g. +260 96 555 0101'
  const rating = ratingRaw ? Number(ratingRaw) : null
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    fieldErrors.rating = 'Rating must be between 0 and 5'
  }

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  try {
    const db = await getDb()
    const result = await db.collection('garages').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          area: area || null,
          town,
          city: town,
          province,
          phone: phone || null,
          services,
          rating: rating === null ? null : Math.round(rating * 10) / 10,
          updatedAt: new Date(),
        },
      },
    )
    if (result.matchedCount === 0) return { error: 'This garage no longer exists.' }
  } catch (error) {
    console.error('[drivo] updateGarage failed', error)
    return { error: 'Could not update the garage. Please try again.' }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function deleteGarage(id: string): Promise<{ error?: string }> {
  if (!ObjectId.isValid(id)) return { error: 'This garage no longer exists.' }
  const _id = new ObjectId(id)
  try {
    const db = await getDb()
    await db.collection('garages').deleteOne({ _id })
    await db.collection('vehicles').updateMany({ garageId: _id }, { $set: { garageId: null, updatedAt: new Date() } })
  } catch (error) {
    console.error('[drivo] deleteGarage failed', error)
    return { error: 'Could not delete the garage. Please try again.' }
  }
  revalidatePath('/', 'layout')
  return {}
}

export async function createGarage(_prev: FormState, formData: FormData): Promise<FormState> {
  const name = field(formData, 'name', 80)
  const province = provinceField(formData)
  const town = field(formData, 'town', 60)
  const area = field(formData, 'area', 60)
  const address = field(formData, 'address', 160)
  const phone = field(formData, 'phone', 20)
  const hours = field(formData, 'hours', 60)
  const services = field(formData, 'services', 300)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12)

  const fieldErrors: Record<string, string> = {}
  if (name.length < 2) fieldErrors.name = 'Garage name is required'
  if (!province) fieldErrors.province = 'Choose a province'
  if (!town) fieldErrors.town = 'Town is required'
  if (phone && !PHONE_RX.test(phone)) fieldErrors.phone = 'Enter a valid phone, e.g. +260 96 555 0101'

  if (Object.keys(fieldErrors).length) return { fieldErrors }

  try {
    const db = await getDb()
    await db.collection('garages').insertOne({
      name,
      province,
      town,
      city: town,
      area: area || null,
      address: address || null,
      phone: phone || null,
      hours: hours || null,
      services,
      rating: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('[drivo] createGarage failed', error)
    return { error: 'Could not save the garage. Please try again.' }
  }

  revalidatePath('/', 'layout')
  redirect('/garages')
}
