import { Clock, MapPin, Phone, Star } from 'lucide-react'
import type { Garage } from '@/lib/data'
import { GarageActions } from '@/components/garage-actions'
import { formatGarageLocation } from '@/lib/kitwe'

export function GarageCard({ garage }: { garage: Garage }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h3 className="font-medium leading-snug">{garage.name}</h3>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
            {formatGarageLocation(garage.town, garage.province)}
          </p>
          {garage.area ? <p className="pl-5 text-xs text-muted-foreground">{garage.area}</p> : null}
        </div>
        {garage.rating !== null ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-accent px-1.5 py-0.5 text-xs font-medium text-accent-foreground">
            <Star className="size-3 fill-current" aria-hidden="true" />
            <span className="sr-only">Rating</span>
            {garage.rating.toFixed(1)}
          </span>
        ) : null}
      </div>

      {garage.services.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Services">
          {garage.services.slice(0, 6).map((s) => (
            <li key={s} className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground">
              {s}
            </li>
          ))}
        </ul>
      ) : null}

      <dl className="mt-auto flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
        {garage.address ? (
          <div className="flex gap-2 text-muted-foreground">
            <dt className="sr-only">Address</dt>
            <dd>{garage.address}</dd>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <dt>
            <Phone className="size-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="sr-only">Phone</span>
          </dt>
          <dd>
            {garage.phone ? (
              <a href={`tel:${garage.phone.replace(/\s+/g, '')}`} className="hover:text-primary hover:underline">
                {garage.phone}
              </a>
            ) : (
              <span className="text-muted-foreground">No phone listed</span>
            )}
          </dd>
        </div>
        {garage.hours ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <dt>
              <Clock className="size-3.5" aria-hidden="true" />
              <span className="sr-only">Opening hours</span>
            </dt>
            <dd>{garage.hours}</dd>
          </div>
        ) : null}
      </dl>

      <GarageActions garage={garage} />
    </article>
  )
}
