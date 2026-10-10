import { cn } from '@/lib/utils'
import { statusLabel } from '@/lib/kitwe'

const STYLES: Record<string, { dot: string; text: string }> = {
  active: { dot: 'bg-emerald-600', text: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  in_service: { dot: 'bg-amber-500', text: 'text-amber-900 bg-amber-50 border-amber-200' },
  inactive: { dot: 'bg-stone-400', text: 'text-stone-700 bg-stone-100 border-stone-200' },
}

export function StatusBadge({ status }: { status: string }) {
  const style = STYLES[status] ?? STYLES.inactive
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium capitalize', style.text)}>
      <span aria-hidden="true" className={cn('size-1.5 rounded-full', style.dot)} />
      {statusLabel(status)}
    </span>
  )
}

export function PlateChip({ plate }: { plate: string }) {
  return (
    <span className="inline-flex rounded-md border border-border bg-secondary px-2 py-0.5 font-mono text-xs font-semibold tracking-wider">
      {plate}
    </span>
  )
}
