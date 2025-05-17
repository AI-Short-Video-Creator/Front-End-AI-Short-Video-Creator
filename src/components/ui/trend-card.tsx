
import * as React from "react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ArrowRight, TrendingUp } from "lucide-react"

interface TrendCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  trendScore?: number
}

export function TrendCard({ 
  title, 
  description, 
  trendScore = 0,
  className, 
  ...props 
}: TrendCardProps) {
  return (
    <Card 
      className={cn(
        "border border-border/40 bg-white shadow-sm hover:shadow-md transition-all cursor-pointer overflow-hidden group", 
        className
      )} 
      {...props}
    >
      <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-creative-500" />
          <p className="text-sm font-medium text-creative-800">Trending</p>
        </div>
        {trendScore > 0 && (
          <span className="text-xs px-2 py-0.5 bg-creative-100 text-creative-700 rounded-full">
            {trendScore}%
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
        <div className="mt-3 flex justify-end">
          <ArrowRight size={16} className="text-creative-500 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
        </div>
      </CardContent>
    </Card>
  )
}
