import Link from 'next/link'
import { Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: { href: string; label: string }
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-balance md:text-3xl">{title}</h1>
        <p className="text-sm text-muted-foreground text-pretty">{description}</p>
      </div>
      {action ? (
        <Link href={action.href} className={buttonVariants({ size: 'lg' })}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          {action.label}
        </Link>
      ) : null}
    </div>
  )
}
