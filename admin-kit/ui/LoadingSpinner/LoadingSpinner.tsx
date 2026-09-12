"use client"

import { Card, CardContent } from "@/components/ui/card"

interface LoadingSpinnerProps {
  message?: string
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
  className?: string
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  const containerClasses = fullScreen
    ? "flex items-center justify-center min-h-screen"
    : "flex items-center justify-center py-8"

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className="text-center space-y-4">
        <div className={`animate-spin rounded-full border-b-2 border-primary mx-auto ${sizeClasses[size]}`} />
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
      </div>
    </div>
  )
}

// Card wrapper version
export function LoadingCard({ message, className }: { message?: string; className?: string }) {
  return (
    <Card className={className}>
      <CardContent>
        <LoadingSpinner message={message} />
      </CardContent>
    </Card>
  )
}
