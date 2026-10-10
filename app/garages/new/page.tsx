import type { Metadata } from 'next'
import { PageHeader } from '@/components/page-header'
import { GarageForm } from '@/components/garage-form'

export const metadata: Metadata = { title: 'Add garage' }

export default function NewGaragePage() {
  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Add a garage" description="List a partner workshop anywhere in Zambia." />
      <GarageForm />
    </div>
  )
}
