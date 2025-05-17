
import * as React from "react"
import { Link, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Home, LogIn, Plus, Search, Settings, User } from "lucide-react"
import { toast } from "sonner"
import { useTheme } from "@/lib/theme"

export function Header() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  // Mock auth state - in a real app this would come from your auth provider
  const [isLoggedIn, setIsLoggedIn] = React.useState(true);

  const handleLogout = () => {
    // Mock logout functionality
    setIsLoggedIn(false);
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <header className={`sticky top-0 z-40 w-full border-b ${
      theme === "light" 
        ? "bg-white/95 border-gray-200 backdrop-blur" 
        : "border-creative-700 bg-black/95 backdrop-blur"
    }`}>
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center">
            <span className="text-xl font-black tracking-wide text-creative-500 uppercase font-sans">QUICKCLIP</span>
            <span className={`ml-1 text-sm font-semibold tracking-wide uppercase font-sans ${theme === "light" ? "text-gray-600" : "text-white/70"}`}>CREATOR</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link to="/" className={`flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase font-sans hover:text-creative-500 transition-colors ${theme === "light" ? "text-gray-800" : ""}`}>
              <Home className="w-5 h-5 text-creative-500" /> HOME
            </Link>
            <Link to="/library" className={`flex items-center gap-2 text-sm font-extrabold tracking-widest uppercase font-sans hover:text-creative-500 transition-colors ${theme === "light" ? "text-gray-800" : ""}`}>
              <User className="w-5 h-5 text-creative-500" /> MY VIDEOS
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            asChild 
            variant="default" 
            size="sm" 
            className={`gap-1 hidden sm:flex bg-creative-500 hover:bg-creative-700 text-white font-extrabold uppercase tracking-wider font-sans`}
          >
            <Link to="/create">
              <Plus className="h-4 w-4 mr-1" /> NEW VIDEO
            </Link>
          </Button>
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className={`rounded-full ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-creative-700"}`}
                >
                  <User className="h-5 w-5 text-creative-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className={theme === "light" ? "bg-white border border-gray-200" : "bg-black border border-creative-800"}
              >
                <DropdownMenuLabel className="font-bold text-creative-500 uppercase">MY ACCOUNT</DropdownMenuLabel>
                <DropdownMenuSeparator className={theme === "light" ? "bg-gray-200" : ""} />
                <DropdownMenuItem 
                  className={`uppercase font-semibold ${theme === "light" ? "text-gray-800" : "text-white/90"}`}
                  onClick={() => navigate('/profile')}
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className={`uppercase font-semibold ${theme === "light" ? "text-gray-800" : "text-white/90"}`}
                  onClick={() => navigate('/settings')}
                >
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className={theme === "light" ? "bg-gray-200" : ""} />
                <DropdownMenuItem onClick={handleLogout} className="uppercase font-bold text-creative-500">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              asChild 
              variant="ghost" 
              size="sm" 
              className={`gap-1 bg-transparent ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-creative-700"} text-creative-500 font-extrabold uppercase tracking-wider font-sans`}
            >
              <Link to="/login">
                <LogIn className="h-4 w-4 mr-1" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
