"use client"

import { useState, useEffect } from "react"
import { useForm, ValidationError } from "@formspree/react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Upload } from "lucide-react"

interface ReportIssueDialogProps {
  trigger?: React.ReactNode
}

type Severity = "low" | "medium" | "high"

export function ReportIssueDialog({ trigger }: ReportIssueDialogProps) {
  const { toast } = useToast()
  const [state, handleSubmit] = useForm("xykdlpgw")
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState("")
  const [severity, setSeverity] = useState<Severity>("medium")
  const [file, setFile] = useState<File | null>(null)
  const [fileName, setFileName] = useState("")

  // Po úspěšném odeslání zobrazit toast, resetovat formulář a zavřít dialog
  useEffect(() => {
    if (state.succeeded) {
      toast({
        title: "Úspěch",
        description: "Problém byl úspěšně nahlášen. Děkujeme!",
      })
      setDescription("")
      setSeverity("medium")
      setFile(null)
      setFileName("")
      setOpen(false)
    }
  }, [state.succeeded])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        toast({
          title: "Chyba",
          description: "Soubor je příliš velký (max. 5MB)",
          variant: "destructive"
        })
        return
      }
      setFile(selectedFile)
      setFileName(selectedFile.name)
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!description.trim()) {
      toast({
        title: "Chyba",
        description: "Popište prosím problém",
        variant: "destructive"
      })
      return
    }
    handleSubmit(e)
  }

  const severityLabels: Record<Severity, string> = {
    low: "Nízká (Občasný problém)",
    medium: "Střední (Běžný problém)",
    high: "Vysoká (Blokuje práci)"
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="lg" className="w-full gap-2 text-foreground hover:text-foreground text-base">
            <AlertCircle className="h-5 w-5" />
            <span>Hlásit problém</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Hlášení problému</DialogTitle>
          <DialogDescription>
            Dejte nám vědět, pokud jste narazili na problém. Pošleme to přímo správci.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="message">Popis problému *</Label>
            <Textarea
              id="message"
              name="message"
              placeholder="Detailně popište, co se stalo a co jste dělali..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={state.submitting}
              className="min-h-24 resize-none"
            />
            <ValidationError prefix="Message" field="message" errors={state.errors} className="text-sm text-red-500" />
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <label htmlFor="severity-select" className="text-sm font-medium leading-none">
              Závažnost *
            </label>
            <select
              id="severity-select"
              name="severity"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as Severity)}
              disabled={state.submitting}
              className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="low">{severityLabels.low}</option>
              <option value="medium">{severityLabels.medium}</option>
              <option value="high">{severityLabels.high}</option>
            </select>
          </div>

          {/* File Upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload">Screenshot / Obrázek (volitelně)</Label>
            <div className="flex items-center gap-2">
              <label
                htmlFor="file-upload"
                className="flex items-center justify-center gap-2 px-4 py-2 border border-dashed border-input rounded-md cursor-pointer hover:bg-muted/50 transition-colors flex-1"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm text-foreground/80">
                  {fileName || "Klikněte pro upload"}
                </span>
                <input
                  id="file-upload"
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={state.submitting}
                  className="hidden"
                />
              </label>
              {file && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => { setFile(null); setFileName("") }}
                  disabled={state.submitting}
                >
                  ×
                </Button>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={state.submitting}
            >
              Zrušit
            </Button>
            <Button type="submit" disabled={state.submitting} className="bg-blue-600 hover:bg-blue-700">
              {state.submitting ? "Odesílám..." : "Odeslat hlášení"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
