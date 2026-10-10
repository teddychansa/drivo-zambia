'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { createGarage, type FormState } from '@/app/actions'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField, selectClassName } from '@/components/form-field'
import { ZAMBIA_PROVINCES } from '@/lib/kitwe'

export function GarageForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(createGarage, {})
  const err = state.fieldErrors ?? {}
  const a11y = (name: string) => ({
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `${name}-error` : undefined,
  })

  return (
    <form action={action} className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="name" label="Garage name" error={err.name} className="sm:col-span-2">
          <Input id="name" name="name" required placeholder="Copperbelt Auto Clinic" {...a11y('name')} />
        </FormField>
        <FormField id="province" label="Province" error={err.province}>
          <select id="province" name="province" defaultValue="" required className={selectClassName} {...a11y('province')}>
            <option value="" disabled>
              Select a province
            </option>
            {ZAMBIA_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="town" label="Town" error={err.town}>
          <Input id="town" name="town" required placeholder="e.g. Mazabuka, Kitwe, Lusaka" {...a11y('town')} />
        </FormField>
        <FormField id="area" label="Area (optional)">
          <Input id="area" name="area" placeholder="e.g. Nakambala, Nkana East" />
        </FormField>
        <FormField id="phone" label="Phone" error={err.phone}>
          <Input id="phone" name="phone" type="tel" placeholder="+260 96 555 0101" {...a11y('phone')} />
        </FormField>
        <FormField id="address" label="Street address" className="sm:col-span-2">
          <Input id="address" name="address" placeholder="Plot 12, Freedom Avenue" />
        </FormField>
        <FormField id="services" label="Services" hint="Comma separated, e.g. Servicing, Tyres, Panel beating" className="sm:col-span-2">
          <Input id="services" name="services" placeholder="Servicing, Tyres, Diagnostics" />
        </FormField>
        <FormField id="hours" label="Opening hours" className="sm:col-span-2">
          <Input id="hours" name="hours" placeholder="Mon–Sat, 08:00–17:00" />
        </FormField>
      </div>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <div className="flex justify-end gap-2">
        <Link href="/garages" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
          Cancel
        </Link>
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? 'Saving…' : 'Save garage'}
        </Button>
      </div>
    </form>
  )
}
