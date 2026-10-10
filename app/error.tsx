'use client'

import { Button } from '@/components/ui/button'

export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card px-6 py-14 text-center">
      <h1 className="font-medium">Could not reach the DRIVO database</h1>
      <p className="max-w-sm text-sm text-muted-foreground text-pretty">
        Check that MONGODB_URI is set and that your MongoDB Atlas network access allows this deployment.
      </p>
      <Button variant="outline" onClick={reset}>
        Try again
      </Button>
    </div>
  )
}
