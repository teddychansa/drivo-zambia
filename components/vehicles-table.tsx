import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { PlateChip, StatusBadge } from '@/components/status-badge'
import { VehicleRowActions } from '@/components/vehicle-row-actions'
import { formatKm } from '@/lib/kitwe'
import type { Vehicle } from '@/lib/data'

export function VehiclesTable({ vehicles, compact = false }: { vehicles: Vehicle[]; compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary/60 hover:bg-secondary/60">
            <TableHead className="pl-4">Plate</TableHead>
            <TableHead>Vehicle</TableHead>
            <TableHead>Owner</TableHead>
            {!compact && <TableHead>Mileage</TableHead>}
            {!compact && <TableHead>Garage</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="pr-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((v) => (
            <TableRow key={v.id}>
              <TableCell className="pl-4">
                <PlateChip plate={v.plate} />
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">
                    {v.make} {v.model}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {[v.year, v.color].filter(Boolean).join(' · ') || '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{v.ownerName ?? '—'}</span>
                  {v.ownerPhone ? <span className="text-xs text-muted-foreground">{v.ownerPhone}</span> : null}
                </div>
              </TableCell>
              {!compact && <TableCell className="tabular-nums text-muted-foreground">{formatKm(v.mileage)}</TableCell>}
              {!compact && <TableCell className="text-muted-foreground">{v.garageName ?? '—'}</TableCell>}
              <TableCell>
                <StatusBadge status={v.status} />
              </TableCell>
              <TableCell className="pr-4">
                <VehicleRowActions vehicle={v} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
