
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { TrendCard } from "@/components/ui/trend-card"

// Mock trending data
const trendingTopics = [
  {
    id: 1,
    title: "AI in everyday life",
    description: "How AI is transforming daily tasks",
    trendScore: 92
  },
  {
    id: 2,
    title: "Sustainable living hacks",
    description: "Simple ways to reduce your carbon footprint",
    trendScore: 87
  },
  {
    id: 3,
    title: "Mental health awareness",
    description: "Breaking the stigma around mental health",
    trendScore: 85
  },
  {
    id: 4,
    title: "Future of remote work",
    description: "How companies are adapting to remote work models",
    trendScore: 81
  },
  {
    id: 5,
    title: "Tech gadgets of 2025",
    description: "Latest innovations in consumer technology",
    trendScore: 78
  },
  {
    id: 6,
    title: "Viral TikTok recipes",
    description: "Food trends taking over social media",
    trendScore: 75
  }
]

interface TrendingTopicsProps {
  onSelectTopic?: (topic: string) => void
}

export function TrendingTopics({ onSelectTopic }: TrendingTopicsProps) {
  const navigate = useNavigate();
  
  const handleTrendClick = (topic: string) => {
    if (onSelectTopic) {
      onSelectTopic(topic);
    } else {
      // Navigate to create page with topic
      navigate(`/create?topic=${encodeURIComponent(topic)}`);
    }
  };
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Trending Topics</h2>
        <Link to="/all-trending-topics" className="text-sm text-creative-600 hover:underline">
          See All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {trendingTopics.map((topic) => (
          <TrendCard
            key={topic.id}
            title={topic.title}
            description={topic.description}
            trendScore={topic.trendScore}
            onClick={() => handleTrendClick(topic.title)}
          />
        ))}
      </div>
    </div>
  )
}
