'use server'

import { redirect } from 'next/navigation'

export async function checkMaintenanceMode(pathname: string) {
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'

  // Allowed paths during maintenance
  const allowedPaths = ['/maintenance', '/online-rezervace', '/api']

  if (maintenanceMode && !allowedPaths.some(path => pathname.startsWith(path))) {
    redirect('/maintenance')
  }
}
