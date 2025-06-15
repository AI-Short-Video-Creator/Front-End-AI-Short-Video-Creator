
import { Header } from "@/components/navigation/header"
import { AnalyticsDashboard } from "@/components/analytics/analytics-dashboard"

export default function Analytics() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Video Analytics</h1>
          <p className="text-muted-foreground">Analyze the performance of your videos.</p>
        </div>
        <AnalyticsDashboard />
      </main>
    </div>
  )
}
