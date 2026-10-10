import type { Metadata } from 'next'
import { Car } from 'lucide-react'
import { getVehicles } from '@/lib/data'
import { VEHICLE_STATUSES } from '@/lib/kitwe'
import { PageHeader } from '@/components/page-header'
import { FilterBar } from '@/components/filter-bar'
import { EmptyState } from '@/components/empty-state'
import { VehiclesTable } from '@/components/vehicles-table'

export const metadata: Metadata = { title: 'Vehicles' }

export default async function VehiclesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>
}) {
  const { q = '', status = '' } = await searchParams
  const validStatus = VEHICLE_STATUSES.some((s) => s.value === status) ? status : ''
  const vehicles = await getVehicles({ query: q, status: validStatus || undefined })
  const filtered = Boolean(q || validStatus)

  return (
    <div>
      <PageHeader
        title="Vehicles"
        description={`${vehicles.length} ${vehicles.length === 1 ? 'vehicle' : 'vehicles'}${filtered ? ' matching your filters' : ' registered in Zambia'}`}
        action={{ href: '/vehicles/new', label: 'Add vehicle' }}
      />
      <FilterBar
        basePath="/vehicles"
        query={q}
        placeholder="Search plate, make, model or owner"
        paramName="status"
        options={VEHICLE_STATUSES}
        selected={validStatus}
      />
      {vehicles.length ? (
        <VehiclesTable vehicles={vehicles} />
      ) : filtered ? (
        <EmptyState icon={Car} title="No matching vehicles" description="Try a different search term or clear the status filter." action={{ href: '/vehicles', label: 'Clear filters' }} />
      ) : (
        <EmptyState
          icon={Car}
          title="No vehicles yet"
          description="The drivo_prod.vehicles collection is empty. Register your first vehicle to get started."
          action={{ href: '/vehicles/new', label: 'Register a vehicle' }}
        />
      )}
    </div>
  )
}
