import * as React from "react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import { TrendCard } from "@/components/ui/trend-card"

interface Topic {
  id: number
  title: string
  description: string
  trendScore: number
}

interface TrendingTopicsProps {
  onSelectTopic?: (topic: string) => void
}

export function TrendingTopics({ onSelectTopic }: TrendingTopicsProps) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const country = searchParams.get("country") || "vietnam"
  const topicFilter = searchParams.get("topic") || "technology"

  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API_TRENDING_URL = import.meta.env.VITE_PUBLIC_API_URL + "/trending/google";

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `${API_TRENDING_URL}?country=${encodeURIComponent(country)}&topic=${encodeURIComponent(topicFilter)}`
        )
        if (!res.ok) throw new Error("Failed to fetch trending topics")
        const data = await res.json()
        setTopics(data)
      } catch (err: any) {
        setError(err.message || "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [country, topicFilter])

  const handleTrendClick = (topic: string) => {
    if (onSelectTopic) {
      onSelectTopic(topic)
    } else {
      navigate(`/create?topic=${encodeURIComponent(topic)}`)
    }
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trending Topics</h2>
        <Link to="/all-trending-topics" className="text-sm text-creative-600 hover:underline">
          See All
        </Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : topics.length === 0 ? (
        <p>No trending topics found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topics.slice(0, 6).map((trend) => (
            <TrendCard
              key={trend.id}
              title={trend.title}
              description={trend.description}
              trendScore={trend.trendScore}
              onClick={() => handleTrendClick(trend.title)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
