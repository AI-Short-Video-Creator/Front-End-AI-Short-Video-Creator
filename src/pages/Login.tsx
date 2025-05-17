
import * as React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, EyeOff, LogIn, UserPlus } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  
  // Signup form state
  const [signupName, setSignupName] = React.useState("");
  const [signupEmail, setSignupEmail] = React.useState("");
  const [signupPassword, setSignupPassword] = React.useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = React.useState("");
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    
    // Mock authentication
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Login successful!");
      navigate("/");
    }, 1500);
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signupName || !signupEmail || !signupPassword || !signupConfirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    
    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    setIsLoading(true);
    
    // Mock registration
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Account created successfully!");
      navigate("/");
    }, 1500);
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4">
      <Link to="/" className="flex items-center mb-8">
        <span className="text-xl font-black tracking-wide text-creative-500 uppercase font-sans">QUICKCLIP</span>
        <span className="ml-1 text-sm font-semibold tracking-wide uppercase font-sans text-white/70">CREATOR</span>
      </Link>
      
      <div className="w-full max-w-md">
        <Card className="border border-creative-700 bg-black">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-creative-500">Welcome</CardTitle>
            <CardDescription className="text-center text-white/70">
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid grid-cols-2 w-full mb-6 bg-creative-900/40">
                <TabsTrigger value="login" className="data-[state=active]:text-creative-500">Login</TabsTrigger>
                <TabsTrigger value="signup" className="data-[state=active]:text-creative-500">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email</Label>
                    <Input
                      id="email"
                      placeholder="your.email@example.com"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="bg-creative-900/30 border-creative-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-creative-900/30 border-creative-800 text-white pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                    <div className="text-right text-sm">
                      <a href="#" className="text-creative-500 hover:text-creative-400">
                        Forgot password?
                      </a>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-creative-500 hover:bg-creative-600 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Signing in...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <LogIn className="h-4 w-4" />
                        Login
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-white/90">Name</Label>
                    <Input
                      id="name"
                      placeholder="Your name"
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="bg-creative-900/30 border-creative-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-white/90">Email</Label>
                    <Input
                      id="signup-email"
                      placeholder="your.email@example.com"
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="bg-creative-900/30 border-creative-800 text-white"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-white/90">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        className="bg-creative-900/30 border-creative-800 text-white pr-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-white/90">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                      className="bg-creative-900/30 border-creative-800 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-creative-500 hover:bg-creative-600 text-white" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Creating account...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </span>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-creative-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-black px-2 text-white/60">OR CONTINUE WITH</span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
              <Button variant="outline" className="bg-transparent border-creative-800 hover:bg-creative-900/50 text-white flex items-center justify-center">
              <svg
                className="mr-2 h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 48 48"
                fill="none"
              >
                <g>
                <path
                  fill="#4285F4"
                  d="M43.6 20.5H42V20.4H24v7.2h11.2c-1.5 4-5.2 6.8-9.2 6.8-5.6 0-10.2-4.6-10.2-10.2s4.6-10.2 10.2-10.2c2.4 0 4.6.8 6.3 2.2l5.4-5.4C34.2 8.1 29.4 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19c9.5 0 18-7.5 18-19 0-1.3-.1-2.2-.4-3.5z"
                />
                <path
                  fill="#34A853"
                  d="M6.3 14.7l5.9 4.3C14 16.1 18.6 12 24 12c2.4 0 4.6.8 6.3 2.2l5.4-5.4C34.2 8.1 29.4 6 24 6c-7.2 0-13.4 4.1-16.7 8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M24 44c5.4 0 10.2-1.8 13.6-4.9l-6.3-5.2c-1.7 1.2-4 2-7.3 2-4 0-7.7-2.8-9.2-6.8l-6.2 4.8C10.6 39.9 16.8 44 24 44z"
                />
                <path
                  fill="#EA4335"
                  d="M43.6 20.5H42V20.4H24v7.2h11.2c-.7 2-2.1 3.7-3.9 4.9l6.3 5.2c3.7-3.4 5.9-8.4 5.9-14.2 0-1.3-.1-2.2-.4-3.5z"
                />
                </g>
              </svg>
              Google
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <div className="text-center text-sm text-white/60">
              By continuing, you agree to our
              <a href="#" className="underline underline-offset-4 hover:text-creative-500 ml-1">Terms of Service</a>
              <span> and </span>
              <a href="#" className="underline underline-offset-4 hover:text-creative-500">Privacy Policy</a>.
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
