"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Download, Upload, FileText } from "lucide-react"

export function BackupsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Zálohy</h1>
          <p className="text-muted-foreground">
            Spravujte zálohy a export/import dat
          </p>
        </div>
        <Button>
          <Database className="mr-2 h-4 w-4" />
          Vytvořit zálohu
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="mr-2 h-5 w-5" />
            Systém záloh
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Zálohy v přípravě</h3>
            <p className="mt-2 text-muted-foreground">
              Systém záloh a export/import dat bude brzy dostupný
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}