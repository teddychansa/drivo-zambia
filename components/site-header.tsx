import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { NavLinks } from '@/components/nav-links'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
            <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
              D
            </span>
            DRIVO
          </Link>
          <NavLinks />
        </div>
        <p className="hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <MapPin className="size-3.5" aria-hidden="true" />
          Zambia
        </p>
      </div>
    </header>
  )
}
