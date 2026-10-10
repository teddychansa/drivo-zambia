import type { Metadata } from 'next'
import { Warehouse } from 'lucide-react'
import { getGarages } from '@/lib/data'
import { ZAMBIA_PROVINCES } from '@/lib/kitwe'
import { PageHeader } from '@/components/page-header'
import { FilterBar } from '@/components/filter-bar'
import { EmptyState } from '@/components/empty-state'
import { GarageCard } from '@/components/garage-card'

export const metadata: Metadata = { title: 'Garages' }

const PROVINCE_OPTIONS = ZAMBIA_PROVINCES.map((p) => ({ value: p, label: p }))

export default async function GaragesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; province?: string }>
}) {
  const { q = '', province: rawProvince = '' } = await searchParams
  const province = (ZAMBIA_PROVINCES as readonly string[]).includes(rawProvince) ? rawProvince : ''
  const garages = await getGarages({ query: q, province: province || undefined })
  const filtered = Boolean(q || province)

  return (
    <div>
      <PageHeader
        title="Garages"
        description={`${garages.length} partner ${garages.length === 1 ? 'garage' : 'garages'}${
          filtered ? (province && !q ? ` in ${province} Province` : ' matching your filters') : ' across Zambia'
        }`}
        action={{ href: '/garages/new', label: 'Add garage' }}
      />
      <FilterBar
        basePath="/garages"
        query={q}
        placeholder="Search name, service, town or area (e.g. Mazabuka)"
        paramName="province"
        options={PROVINCE_OPTIONS}
        selected={province}
      />
      {garages.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {garages.map((g) => (
            <GarageCard key={g.id} garage={g} />
          ))}
        </div>
      ) : filtered ? (
        <EmptyState
          icon={Warehouse}
          title="No matching garages"
          description="Try a different search or province."
          action={{ href: '/garages', label: 'Clear filters' }}
        />
      ) : (
        <EmptyState
          icon={Warehouse}
          title="No garages yet"
          description="The drivo_prod.garages collection is empty. Add the workshops you partner with across Zambia."
          action={{ href: '/garages/new', label: 'Add a garage' }}
        />
      )}
    </div>
  )
}
