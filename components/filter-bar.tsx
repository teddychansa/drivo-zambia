import Link from 'next/link'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type Option = { value: string; label: string }

export function FilterBar({
  basePath,
  query,
  placeholder,
  paramName,
  options,
  selected,
}: {
  basePath: string
  query: string
  placeholder: string
  paramName: string
  options: readonly Option[]
  selected: string
}) {
  const hrefFor = (value: string) => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (value) params.set(paramName, value)
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  return (
    <div className="mb-6 flex flex-col gap-3">
      <form action={basePath} role="search" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <label htmlFor={`${basePath}-search`} className="sr-only">
            Search
          </label>
          <Input
            id={`${basePath}-search`}
            name="q"
            type="search"
            defaultValue={query}
            placeholder={placeholder}
            className="h-9 bg-card pl-9"
          />
        </div>
        {selected ? <input type="hidden" name={paramName} value={selected} /> : null}
        <Button type="submit" variant="outline" size="lg">
          Search
        </Button>
      </form>
      <div className="flex flex-wrap gap-1.5" aria-label="Filter">
        {[{ value: '', label: 'All' }, ...options].map((o) => {
          const active = o.value === selected
          return (
            <Link
              key={o.value || 'all'}
              href={hrefFor(o.value)}
              aria-current={active ? 'true' : undefined}
              className={cn(
                'rounded-full border px-3 py-1 text-xs transition-colors',
                active
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-muted-foreground hover:text-foreground',
              )}
            >
              {o.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
