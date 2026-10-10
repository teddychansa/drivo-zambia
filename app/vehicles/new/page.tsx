import type { Metadata } from 'next'
import { getGarageOptions } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { VehicleForm } from '@/components/vehicle-form'

export const metadata: Metadata = { title: 'Add vehicle' }

export default async function NewVehiclePage() {
  const garages = await getGarageOptions()
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Register a vehicle" description="Add a vehicle to the DRIVO Kitwe fleet." />
      <VehicleForm garages={garages} />
    </div>
  )
}
