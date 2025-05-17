
import * as React from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/navigation/header"
import { TrendCard } from "@/components/ui/trend-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

// Extended mock trending data with more topics
const allTrendingTopics = [
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
  },
  {
    id: 7,
    title: "Space tourism",
    description: "Commercial space travel becoming a reality",
    trendScore: 73
  },
  {
    id: 8,
    title: "Digital fashion",
    description: "Virtual clothing and NFT wearables",
    trendScore: 71
  },
  {
    id: 9,
    title: "Microlearning platforms",
    description: "Bite-sized educational content for skill development",
    trendScore: 68
  },
  {
    id: 10,
    title: "Plant-based alternatives",
    description: "Innovations in meat and dairy substitutes",
    trendScore: 67
  },
  {
    id: 11,
    title: "Smart home integration",
    description: "Connected devices for the modern home",
    trendScore: 65
  },
  {
    id: 12,
    title: "Biohacking trends",
    description: "DIY biology and personal optimization techniques",
    trendScore: 63
  }
]

export default function AllTrendingTopics() {
  const [searchQuery, setSearchQuery] = React.useState("")
  const [filteredTopics, setFilteredTopics] = React.useState(allTrendingTopics)
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter topics based on search query
    const filtered = allTrendingTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTopics(filtered)
  }
  
  const handleSelectTopic = (topic: string) => {
    console.log("Selected topic:", topic)
    // Logic to select topic could be implemented here
  }
  
  // Reset search results when query is emptied
  React.useEffect(() => {
    if (searchQuery === "") {
      setFilteredTopics(allTrendingTopics)
    }
  }, [searchQuery])
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="icon" className="rounded-full hover:bg-creative-700">
              <Link to="/">
                <ChevronLeft className="h-5 w-5 text-creative-500" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Trending Topics</h1>
              <p className="text-muted-foreground">Discover what's popular right now</p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-64 lg:w-80">
            <Input 
              className="pr-10"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit" 
              size="icon" 
              variant="ghost" 
              className="absolute right-0 top-0 h-10 w-10"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredTopics.map((topic) => (
            <TrendCard
              key={topic.id}
              title={topic.title}
              description={topic.description}
              trendScore={topic.trendScore}
              onClick={() => handleSelectTopic(topic.title)}
              className="h-full"
            />
          ))}
        </div>
        
        {filteredTopics.length === 0 && (
          <div className="text-center py-16">
            <p className="text-xl font-semibold mb-2">No matching topics found</p>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </main>
    </div>
  )
}
