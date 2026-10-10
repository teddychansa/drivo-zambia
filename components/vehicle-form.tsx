'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createVehicle, type FormState } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField, selectClassName } from '@/components/form-field'
import { VEHICLE_STATUSES } from '@/lib/kitwe'

export function VehicleForm({ garages }: { garages: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(createVehicle, {})
  const err = state.fieldErrors ?? {}
  const a11y = (name: string) => ({
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `${name}-error` : undefined,
  })

  return (
    <form action={action} className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6" noValidate>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-sm font-medium">Vehicle details</legend>
        <FormField id="plateNumber" label="Plate number" error={err.plateNumber} hint="Zambian format, e.g. BAE 4521">
          <Input id="plateNumber" name="plateNumber" required autoComplete="off" className="font-mono uppercase" {...a11y('plateNumber')} />
        </FormField>
        <FormField id="status" label="Status" error={err.status}>
          <select id="status" name="status" defaultValue="active" className={selectClassName} {...a11y('status')}>
            {VEHICLE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="make" label="Make" error={err.make}>
          <Input id="make" name="make" required placeholder="Toyota" {...a11y('make')} />
        </FormField>
        <FormField id="model" label="Model" error={err.model}>
          <Input id="model" name="model" required placeholder="Hilux" {...a11y('model')} />
        </FormField>
        <FormField id="year" label="Year" error={err.year}>
          <Input id="year" name="year" type="number" inputMode="numeric" placeholder="2019" {...a11y('year')} />
        </FormField>
        <FormField id="color" label="Colour">
          <Input id="color" name="color" placeholder="White" />
        </FormField>
        <FormField id="mileage" label="Mileage (km)" error={err.mileage}>
          <Input id="mileage" name="mileage" type="number" inputMode="numeric" placeholder="84000" {...a11y('mileage')} />
        </FormField>
        <FormField id="garageId" label="Assigned garage" error={err.garageId}>
          <select id="garageId" name="garageId" defaultValue="" className={selectClassName} {...a11y('garageId')}>
            <option value="">None</option>
            {garages.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </FormField>
      </fieldset>

      <fieldset className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
        <legend className="sr-only">Owner</legend>
        <FormField id="ownerName" label="Owner name">
          <Input id="ownerName" name="ownerName" autoComplete="name" placeholder="Mutale Banda" />
        </FormField>
        <FormField id="ownerPhone" label="Owner phone" error={err.ownerPhone}>
          <Input id="ownerPhone" name="ownerPhone" type="tel" autoComplete="tel" placeholder="+260 97 123 4567" {...a11y('ownerPhone')} />
        </FormField>
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Link href="/vehicles" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
          Cancel
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Save vehicle'}
        </Button>
      </div>
    </form>
  )
}
