"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Send, Users, FileText } from "lucide-react"

export function NewsletterPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Newsletter</h1>
          <p className="text-muted-foreground">
            Spravujte newsletter a e-mailové kampaně
          </p>
        </div>
        <Button>
          <Send className="mr-2 h-4 w-4" />
          Nová kampaň
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Mail className="mr-2 h-5 w-5" />
            Newsletter systém
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Mail className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Newsletter v přípravě</h3>
            <p className="mt-2 text-muted-foreground">
              Systém hromadných e-mailů bude brzy dostupný
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}