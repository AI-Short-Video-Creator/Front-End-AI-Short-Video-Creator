
import * as React from "react"
import { cn } from "@/lib/utils"

interface StepIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  currentStep: number
  totalSteps: number
}

export function StepIndicator({ 
  currentStep, 
  totalSteps, 
  className, 
  ...props 
}: StepIndicatorProps) {
  return (
    <div 
      className={cn("flex items-center gap-1 w-full max-w-md mx-auto my-6", className)}
      {...props}
    >
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-1.5 rounded-full flex-1 transition-all duration-300",
            i < currentStep ? "bg-creative-500" : "bg-gray-200"
          )}
        />
      ))}
    </div>
  )
}
