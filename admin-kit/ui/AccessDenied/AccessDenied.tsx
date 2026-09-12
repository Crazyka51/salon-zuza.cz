"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ShieldX, ArrowLeft, Home } from "lucide-react"

interface AccessDeniedProps {
  requiredPermissions?: string[]
  message?: string
  showBackButton?: boolean
  showHomeButton?: boolean
}

export function AccessDenied({
  requiredPermissions = [],
  message = "Nemáte oprávnění k přístupu na tuto stránku.",
  showBackButton = true,
  showHomeButton = true,
}: AccessDeniedProps) {
  const handleGoBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = "/admin"
    }
  }

  const handleGoHome = () => {
    window.location.href = "/admin"
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <ShieldX className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Přístup odepřen</CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredPermissions.length > 0 && (
            <Alert>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">Požadovaná oprávnění:</p>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {requiredPermissions.map((permission) => (
                      <li key={permission} className="font-mono">
                        {permission}
                      </li>
                    ))}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {showBackButton && (
              <Button variant="outline" onClick={handleGoBack} className="flex-1 bg-transparent">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Zpět
              </Button>
            )}
            {showHomeButton && (
              <Button onClick={handleGoHome} className="flex-1">
                <Home className="h-4 w-4 mr-2" />
                Přehled
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
