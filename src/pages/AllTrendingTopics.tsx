import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Header } from "@/components/navigation/header"
import { TrendCard } from "@/components/ui/trend-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function AllTrendingTopics() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState("")
  const [allTopics, setAllTopics] = React.useState([])
  const [filteredTopics, setFilteredTopics] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const API_TRENDING_URL = import.meta.env.VITE_PUBLIC_API_URL+ "/trending/google";

  // Fetch API data on mount
  React.useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(
          `${API_TRENDING_URL}?country=vietnam&topic=technology`
        )
        if (!res.ok) throw new Error("Failed to fetch trending topics")
        const data = await res.json()
        setAllTopics(data)
        setFilteredTopics(data)
      } catch (err: any) {
        setError(err.message || "Unexpected error")
      } finally {
        setLoading(false)
      }
    }

    fetchTrending()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const filtered = allTopics.filter(topic =>
      topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      topic.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredTopics(filtered)
  }

  const handleSelectTopic = (topic: string) => {
    const cleanTopic = topic.replace(/^\d+\.\s*/, ''); // Xóa '5. ' hoặc '12. ' ở đầu
    navigate(`/create?keyword=${encodeURIComponent(cleanTopic)}`);
  }

  React.useEffect(() => {
    if (searchQuery === "") {
      setFilteredTopics(allTopics)
    }
  }, [searchQuery, allTopics])

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

        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className="text-red-500">Error: {error}</p>
        ) : filteredTopics.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl font-semibold mb-2">No matching topics found</p>
            <p className="text-muted-foreground">Try a different search term</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTopics.map((topic: any) => (
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
        )}
      </main>
    </div>
  )
}