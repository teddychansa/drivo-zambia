import Link from 'next/link'
import { ArrowRight, Car, Warehouse } from 'lucide-react'
import { getFleetStats, getGarages, getVehicles } from '@/lib/data'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { VehiclesTable } from '@/components/vehicles-table'
import { GarageCard } from '@/components/garage-card'

export default async function OverviewPage() {
  const [stats, vehicles, garages] = await Promise.all([
    getFleetStats(),
    getVehicles({ limit: 6 }),
    getGarages({ limit: 3 }),
  ])

  const statItems = [
    { label: 'Total vehicles', value: stats.totalVehicles },
    { label: 'Active', value: stats.active },
    { label: 'In service', value: stats.inService },
    { label: 'Partner garages', value: stats.garages },
  ]

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Fleet overview"
        description="Vehicles and partner garages across Zambia"
        action={{ href: '/vehicles/new', label: 'Add vehicle' }}
      />

      <section aria-label="Fleet statistics" className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-4">
        {statItems.map((s) => (
          <div key={s.label} className="flex flex-col gap-1 bg-card p-5">
            <span className="text-xs text-muted-foreground">{s.label}</span>
            <span className="text-3xl font-semibold tabular-nums tracking-tight">{s.value}</span>
          </div>
        ))}
      </section>

      <section aria-labelledby="recent-vehicles" className="flex flex-col gap-4">
        <SectionTitle id="recent-vehicles" title="Recently added vehicles" href="/vehicles" />
        {vehicles.length ? (
          <VehiclesTable vehicles={vehicles} compact />
        ) : (
          <EmptyState
            icon={Car}
            title="No vehicles yet"
            description="The drivo_prod.vehicles collection is empty. Register your first vehicle to start tracking your Kitwe fleet."
            action={{ href: '/vehicles/new', label: 'Register a vehicle' }}
          />
        )}
      </section>

      <section aria-labelledby="garages" className="flex flex-col gap-4">
        <SectionTitle id="garages" title="Partner garages" href="/garages" />
        {garages.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {garages.map((g) => (
              <GarageCard key={g.id} garage={g} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Warehouse}
            title="No garages yet"
            description="The drivo_prod.garages collection is empty. Add the workshops you work with across Zambia."
            action={{ href: '/garages/new', label: 'Add a garage' }}
          />
        )}
      </section>
    </div>
  )
}

function SectionTitle({ id, title, href }: { id: string; title: string; href: string }) {
  return (
    <div className="flex items-center justify-between">
      <h2 id={id} className="text-base font-medium">
        {title}
      </h2>
      <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        View all
        <ArrowRight className="size-3.5" aria-hidden="true" />
      </Link>
    </div>
  )
}
