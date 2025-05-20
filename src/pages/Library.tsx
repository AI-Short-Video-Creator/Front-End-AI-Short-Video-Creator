
import * as React from "react"
import { Header } from "@/components/navigation/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { LibraryGrid } from "@/components/content/library-grid"

export default function Library() {
  const [searchQuery, setSearchQuery] = React.useState("")
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Searching for:", searchQuery)
    // Implement search logic
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Videos</h1>
            <p className="text-muted-foreground">Manage and organize your created videos</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative flex-1">
              <Input 
                className="pr-10"
                placeholder="Search videos..."
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
        </div>
        
        <LibraryGrid />
      </main>
    </div>
  )
}
