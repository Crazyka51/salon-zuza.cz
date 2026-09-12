"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, TrendingUp, Eye, Users, FileText } from "lucide-react"

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytika</h1>
          <p className="text-muted-foreground">
            Sledujte výkonnost vašeho webu
          </p>
        </div>
        <Button>
          <BarChart3 className="mr-2 h-4 w-4" />
          Exportovat report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5" />
            Přehled analytiky
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Analytika v přípravě</h3>
            <p className="mt-2 text-muted-foreground">
              Pokročilá analytika a Google Analytics integrace bude brzy dostupná
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}