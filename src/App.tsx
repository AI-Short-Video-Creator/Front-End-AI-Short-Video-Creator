
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Create from "./pages/Create";
//import Library from "./pages/Library";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import AllTrendingTopics from "./pages/AllTrendingTopics";
import { ThemeProvider } from "./lib/theme";
import AuthShield from "./components/auth/AuthShield";
import Share from "./pages/Share";
import Analytics from "./pages/Analytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthShield>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/all-trending-topics" element={<AllTrendingTopics />} />
              
              {/* Protected Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/create" element={<Create />} />
              {/* <Route path="/library" element={<Library />} /> */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/share" element={<Share />} />
              <Route path="/analytics" element={<Analytics />} />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthShield>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;