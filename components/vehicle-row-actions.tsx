'use client'

import { useActionState, useState, useTransition } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteVehicle, updateVehicle, type UpdateVehicleState } from '@/app/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormField } from '@/components/form-field'
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
import type { Vehicle } from '@/lib/data'

export function VehicleRowActions({ vehicle }: { vehicle: Vehicle }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} aria-label={`Edit ${vehicle.plate}`}>
        <Pencil aria-hidden="true" />
        Edit
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setDeleteOpen(true)}
        aria-label={`Delete ${vehicle.plate}`}
        className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
      >
        <Trash2 aria-hidden="true" />
        Delete
      </Button>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-lg">
          {editOpen ? <EditVehicleForm vehicle={vehicle} onSaved={() => setEditOpen(false)} /> : null}
        </DialogContent>
      </Dialog>

      <DeleteVehicleDialog vehicle={vehicle} open={deleteOpen} onOpenChange={setDeleteOpen} />
    </div>
  )
}

function EditVehicleForm({ vehicle, onSaved }: { vehicle: Vehicle; onSaved: () => void }) {
  const [state, action, pending] = useActionState<UpdateVehicleState, FormData>(async (prev, formData) => {
    const result = await updateVehicle(vehicle.id, prev, formData)
    if (result.success) onSaved()
    return result
  }, {})
  const err = state.fieldErrors ?? {}
  const a11y = (name: string) => ({
    'aria-invalid': err[name] ? true : undefined,
    'aria-describedby': err[name] ? `edit-${name}-error` : undefined,
  })
  const plateValue = vehicle.plate === 'No plate' ? '' : vehicle.plate

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Edit vehicle</DialogTitle>
        <DialogDescription>
          Update details for <span className="font-mono font-medium text-foreground">{vehicle.plate}</span>.
        </DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="edit-plateNumber" label="Plate number" error={err.plateNumber}>
          <Input id="edit-plateNumber" name="plateNumber" defaultValue={plateValue} required autoComplete="off" className="font-mono uppercase" {...a11y('plateNumber')} />
        </FormField>
        <FormField id="edit-year" label="Year" error={err.year}>
          <Input id="edit-year" name="year" type="number" inputMode="numeric" defaultValue={vehicle.year ?? ''} {...a11y('year')} />
        </FormField>
        <FormField id="edit-make" label="Make" error={err.make}>
          <Input id="edit-make" name="make" defaultValue={vehicle.make === 'Unknown' ? '' : vehicle.make} required {...a11y('make')} />
        </FormField>
        <FormField id="edit-model" label="Model" error={err.model}>
          <Input id="edit-model" name="model" defaultValue={vehicle.model} required {...a11y('model')} />
        </FormField>
        <FormField id="edit-color" label="Colour">
          <Input id="edit-color" name="color" defaultValue={vehicle.color ?? ''} />
        </FormField>
        <FormField id="edit-mileage" label="Mileage (km)" error={err.mileage}>
          <Input id="edit-mileage" name="mileage" type="number" inputMode="numeric" defaultValue={vehicle.mileage ?? ''} {...a11y('mileage')} />
        </FormField>
        <FormField id="edit-ownerName" label="Owner name">
          <Input id="edit-ownerName" name="ownerName" autoComplete="name" defaultValue={vehicle.ownerName ?? ''} />
        </FormField>
        <FormField id="edit-ownerPhone" label="Owner phone" error={err.ownerPhone}>
          <Input id="edit-ownerPhone" name="ownerPhone" type="tel" autoComplete="tel" defaultValue={vehicle.ownerPhone ?? ''} {...a11y('ownerPhone')} />
        </FormField>
      </div>

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

function DeleteVehicleDialog({
  vehicle,
  open,
  onOpenChange,
}: {
  vehicle: Vehicle
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    startTransition(async () => {
      const result = await deleteVehicle(vehicle.id)
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
          <AlertDialogTitle>Delete vehicle?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-mono font-medium text-foreground">{vehicle.plate}</span>?
            This cannot be undone.
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
