
import * as React from "react"
import { Link } from "react-router-dom"
import { Header } from "@/components/navigation/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Sparkles } from "lucide-react"
import { TrendingTopics } from "@/components/content/trending-topics"

export default function Index() {
  const [searchQuery, setSearchQuery] = React.useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // Implement search logic
  }

  const handleSelectTopic = (topic: string) => {
    console.log("Selected topic:", topic)
    // Implement topic selection logic
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <section className="container py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl mb-4">
              Create Trending <span className="text-gradient">Short Videos</span> with AI
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Transform ideas into engaging short-form videos in minutes. 
              Powered by AI to help you create content that trends.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="gap-2">
                <Link to="/create">
                  <Sparkles className="h-5 w-5 mr-1" />
                  Create a Video
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/library">
                  View My Videos
                </Link>
              </Button>
            </div>

            <form onSubmit={handleSearch} className="relative max-w-xl mx-auto">
              <Input 
                className="pr-10 h-12 text-base"
                placeholder="Search for trending topics, ideas, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button 
                type="submit" 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1 h-10 w-10"
              >
                <Search className="h-5 w-5" />
              </Button>
            </form>

            <div className="mt-8">
              <div className="flex items-center justify-center gap-2">
                <span className="h-px w-5 bg-border"></span>
                <span className="text-sm text-muted-foreground">Popular topics</span>
                <span className="h-px flex-1 bg-border"></span>
              </div>
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {["AI", "Tech", "Fashion", "Health", "Finance", "Education"].map((tag) => (
                  <button 
                    key={tag}
                    className="px-3 py-1 rounded-full text-sm bg-creative-50 text-creative-600 hover:bg-creative-100"
                    onClick={() => setSearchQuery(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <TrendingTopics onSelectTopic={handleSelectTopic} />

          <div className="mt-20 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border bg-background shadow-sm">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-creative-100 text-creative-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M14 12C14 9.79 12.21 8 10 8C7.79 8 6 9.79 6 12C6 14.21 7.79 16 10 16" />
                    <path d="M18 12C18 14.21 16.21 16 14 16C11.79 16 10 14.21 10 12C10 9.79 11.79 8 14 8" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Trending Topics</h3>
                <p className="text-muted-foreground">
                  Discover what's trending and create content that resonates with your audience.
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-background shadow-sm">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-creative-100 text-creative-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M12 18V6" />
                    <path d="M7 13l5 5 5-5" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">AI Script Generation</h3>
                <p className="text-muted-foreground">
                  Transform ideas into engaging scripts ready for production with AI assistance.
                </p>
              </div>
              
              <div className="p-6 rounded-lg border bg-background shadow-sm">
                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-creative-100 text-creative-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Natural Voices</h3>
                <p className="text-muted-foreground">
                  Choose from a variety of natural-sounding AI voices in multiple languages.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container py-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">© 2025 QuickClip Creator. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-creative-600">Terms</Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-creative-600">Privacy</Link>
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-creative-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
