"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, X } from "lucide-react"
import { format } from "date-fns"
import type { FormField } from "../../core/types"
import { useAdminApi } from "../../core/hooks/useAdminApi"
import { validateData } from "../../utils/validation"
import { cn } from "@/lib/utils"

interface FormGeneratorProps {
  title?: string
  description?: string
  fields: FormField[]
  initialData?: Record<string, any>
  onSubmit: (data: Record<string, any>) => Promise<void> | void
  onCancel?: () => void
  submitLabel?: string
  cancelLabel?: string
  loading?: boolean
  className?: string
  layout?: "vertical" | "horizontal" | "grid"
  columns?: number
}

export function FormGenerator({
  title,
  description,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  loading = false,
  className,
  layout = "vertical",
  columns = 2,
}: FormGeneratorProps) {
  const [formData, setFormData] = useState<Record<string, any>>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})

  const api = useAdminApi()

  // Update form data when initialData changes
  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  const handleChange = (fieldName: string, value: any) => {
    setFormData((prev) => ({ ...prev, [fieldName]: value }))
    // Clear field error when user starts typing
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }))
    }
  }

  const handleFileChange = (fieldName: string, files: FileList | null) => {
    if (files) {
      const fileArray = Array.from(files)
      setUploadedFiles((prev) => ({ ...prev, [fieldName]: fileArray }))
      handleChange(fieldName, fileArray)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    fields.forEach((field) => {
      const value = formData[field.name]

      // Required field validation
      if (field.required && (!value || (Array.isArray(value) && value.length === 0))) {
        newErrors[field.name] = `${field.label} is required`
        return
      }

      // Custom validation
      if (field.validation && value) {
        const validation = validateData(field.validation, value)
        if (!validation.success && validation.errors) {
          newErrors[field.name] = Object.values(validation.errors)[0]
        }
      }

      // Type-specific validation
      if (value) {
        switch (field.type) {
          case "email":
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
            if (!emailRegex.test(value)) {
              newErrors[field.name] = "Invalid email address"
            }
            break
          case "number":
            if (isNaN(Number(value))) {
              newErrors[field.name] = "Must be a valid number"
            }
            break
        }
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Form submission error:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderField = (field: FormField) => {
    const value = formData[field.name] ?? field.defaultValue ?? ""
    const hasError = !!errors[field.name]

    const fieldId = `field-${field.name}`

    switch (field.type) {
      case "text":
      case "email":
      case "password":
        return (
          <Input
            id={fieldId}
            type={field.type}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-destructive" : ""}
            disabled={loading || isSubmitting}
          />
        )

      case "number":
        return (
          <Input
            id={fieldId}
            type="number"
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-destructive" : ""}
            disabled={loading || isSubmitting}
          />
        )

      case "textarea":
        return (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-destructive" : ""}
            disabled={loading || isSubmitting}
            rows={4}
          />
        )

      case "select":
        return (
          <Select
            value={value}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={loading || isSubmitting}
          >
            <SelectTrigger className={hasError ? "border-destructive" : ""}>
              <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={fieldId}
              checked={!!value}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
              disabled={loading || isSubmitting}
            />
            <Label htmlFor={fieldId} className="text-sm font-normal">
              {field.placeholder || field.label}
            </Label>
          </div>
        )

      case "radio":
        return (
          <RadioGroup
            value={value}
            onValueChange={(val) => handleChange(field.name, val)}
            disabled={loading || isSubmitting}
          >
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${fieldId}-${option.value}`} />
                <Label htmlFor={`${fieldId}-${option.value}`} className="text-sm font-normal">
                  {option.label}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "date":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !value && "text-muted-foreground",
                  hasError && "border-destructive",
                )}
                disabled={loading || isSubmitting}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => handleChange(field.name, date?.toISOString())}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        )

      case "file":
        return (
          <div className="space-y-2">
            <Input
              id={fieldId}
              type="file"
              onChange={(e) => handleFileChange(field.name, e.target.files)}
              className={hasError ? "border-destructive" : ""}
              disabled={loading || isSubmitting}
              multiple
            />
            {uploadedFiles[field.name] && uploadedFiles[field.name].length > 0 && (
              <div className="flex flex-wrap gap-2">
                {uploadedFiles[field.name].map((file, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {file.name}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => {
                        const newFiles = uploadedFiles[field.name].filter((_, i) => i !== index)
                        setUploadedFiles((prev) => ({ ...prev, [field.name]: newFiles }))
                        handleChange(field.name, newFiles)
                      }}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )

      case "rich-text":
        // For now, use textarea. In production, you'd integrate a rich text editor
        return (
          <Textarea
            id={fieldId}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-destructive" : ""}
            disabled={loading || isSubmitting}
            rows={6}
          />
        )

      default:
        return (
          <Input
            id={fieldId}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className={hasError ? "border-destructive" : ""}
            disabled={loading || isSubmitting}
          />
        )
    }
  }

  const getLayoutClasses = () => {
    switch (layout) {
      case "horizontal":
        return "grid grid-cols-1 md:grid-cols-2 gap-6"
      case "grid":
        return `grid grid-cols-1 md:grid-cols-${columns} gap-6`
      default:
        return "space-y-6"
    }
  }

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={getLayoutClasses()}>
            {fields.map((field) => (
              <div key={field.name} className="space-y-2">
                {field.type !== "checkbox" && (
                  <Label htmlFor={`field-${field.name}`} className="text-sm font-medium">
                    {field.label}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                )}

                {renderField(field)}

                {field.description && <p className="text-xs text-muted-foreground">{field.description}</p>}

                {errors[field.name] && <p className="text-sm text-destructive">{errors[field.name]}</p>}
              </div>
            ))}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="submit" disabled={loading || isSubmitting} className="flex-1 sm:flex-none">
              {isSubmitting ? "Saving..." : submitLabel}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={loading || isSubmitting}>
                {cancelLabel}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
