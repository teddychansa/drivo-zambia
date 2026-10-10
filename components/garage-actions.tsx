'use client'

import { useActionState, useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteGarage, updateGarage, type UpdateGarageState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField, selectClassName } from '@/components/form-field'
import { ZAMBIA_PROVINCES } from '@/lib/kitwe'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import type { Garage } from '@/lib/data'

const COMMON_SERVICES = [
  'Tire service',
  'Oil change',
  'Diagnostics',
  'Brakes',
  'Suspension',
  'Electrical',
  'Engine repair',
  'Wheel alignment',
  'Air conditioning',
  'Panel beating',
] as const

export function GarageActions({ garage }: { garage: Garage }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex-1"
        onClick={() => setEditOpen(true)}
        aria-label={`Edit ${garage.name}`}
      >
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        aria-label={`Delete ${garage.name}`}
        className="flex-1 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
        Delete
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          {editOpen ? <EditGarageForm garage={garage} onSaved={() => setEditOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <DeleteGarageDialog garage={garage} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}

function EditGarageForm({ garage, onSaved }: { garage: Garage; onSaved: () => void }) {
  const [state, action, pending] = useActionState<UpdateGarageState, FormData>(async (prev, formData) => {
    const result = await updateGarage(garage.id, prev, formData)
    if (result.success) onSaved()
    return result
  }, {})
  const err = state.fieldErrors ?? {}
  const a11y = (name: string) => ({
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `edit-garage-${name}-error` : undefined,
  })
  const commonLower = COMMON_SERVICES.map((s) => s.toLowerCase())
  const selected = new Set(garage.services.map((s) => s.toLowerCase()))
  const otherServices = garage.services.filter((s) => !commonLower.includes(s.toLowerCase())).join(', ')

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Edit garage</DialogTitle>
        <DialogDescription>
          Update details for <span className="font-medium text-foreground">{garage.name}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="edit-garage-name" label="Garage name" error={err.name}>
            <Input id="edit-garage-name" name="name" defaultValue={garage.name} required {...a11y('name')} />
          </FormField>
        </div>
        <FormField id="edit-garage-province" label="Province" error={err.province}>
          <select
            id="edit-garage-province"
            name="province"
            defaultValue={garage.province ?? ''}
            required
            className={selectClassName}
            {...a11y('province')}
          >
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
        <FormField id="edit-garage-town" label="Town" error={err.town}>
          <Input
            id="edit-garage-town"
            name="town"
            defaultValue={garage.town ?? ''}
            required
            placeholder="e.g. Mazabuka"
            {...a11y('town')}
          />
        </FormField>
        <FormField id="edit-garage-area" label="Area (optional)">
          <Input id="edit-garage-area" name="area" defaultValue={garage.area ?? ''} placeholder="e.g. Nkana East" />
        </FormField>
        <FormField id="edit-garage-phone" label="Phone" error={err.phone}>
          <Input
            id="edit-garage-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={garage.phone ?? ''}
            {...a11y('phone')}
          />
        </FormField>
        <FormField id="edit-garage-rating" label="Rating (0–5)" error={err.rating}>
          <Input
            id="edit-garage-rating"
            name="rating"
            type="number"
            inputMode="decimal"
            min={0}
            max={5}
            step={0.1}
            defaultValue={garage.rating ?? ''}
            {...a11y('rating')}
          />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2 text-sm font-medium">Services offered</legend>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
          {COMMON_SERVICES.map((service) => (
            <label key={service} className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="services"
                value={service}
                defaultChecked={selected.has(service.toLowerCase())}
                className="size-4 rounded border-input accent-primary"
              />
              {service}
            </label>
          ))}
        </div>
        <FormField id="edit-garage-other" label="Other services (comma separated)">
          <Input
            id="edit-garage-other"
            name="otherServices"
            defaultValue={otherServices}
            placeholder="e.g. Car wash, Towing"
          />
        </FormField>
      </fieldset>

      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function DeleteGarageDialog({
  garage,
  open,
  onOpenChange,
}: {
  garage: Garage
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteGarage(garage.id)
      if (result.error) setError(result.error)
      else onOpenChange(false)
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return
        if (!next) setError(null)
        onOpenChange(next)
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <span className="font-semibold">{garage.name}</span>?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This cannot be undone. Vehicles linked to this garage will be unassigned.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error ? (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={pending}
            className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/40"
          >
            <Trash2 aria-hidden="true" />
            {pending ? 'Deleting…' : 'Delete'}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
