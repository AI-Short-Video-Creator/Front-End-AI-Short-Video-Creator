
import React from "react";
import { Header } from "@/components/navigation/header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, MapPin } from "lucide-react";

const Profile = () => {
  // Mock user data - in a real app would come from auth context/API
  const user = {
    name: "Alex Johnson",
    username: "alexj",
    email: "alex@example.com",
    joinedDate: "January 2023",
    location: "New York, USA",
    avatarUrl: "" // Empty for now to use fallback
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        <h1 className="text-3xl font-bold mb-6 text-creative-500">Your Profile</h1>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Profile Card */}
          <Card className="border-creative-700 md:col-span-1 bg-black/60">
            <CardHeader className="text-center">
              <Avatar className="h-32 w-32 mx-auto mb-4 border-2 border-creative-500">
                {user.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                ) : (
                  <AvatarFallback className="text-3xl bg-creative-800 text-white">
                    {user.name.charAt(0)}
                  </AvatarFallback>
                )}
              </Avatar>
              <CardTitle className="text-2xl mb-0">{user.name}</CardTitle>
              <CardDescription className="text-creative-400">@{user.username}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail size={16} className="text-creative-500" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Calendar size={16} className="text-creative-500" />
                <span>Joined {user.joinedDate}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <MapPin size={16} className="text-creative-500" />
                <span>{user.location}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-creative-500 hover:bg-creative-700">
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          {/* Activity and Stats */}
          <Card className="border-creative-700 md:col-span-2 bg-black/60">
            <CardHeader>
              <CardTitle className="text-creative-500">Activity & Stats</CardTitle>
              <CardDescription>Your content creation statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Content Summary</h3>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 rounded-lg bg-black border border-creative-700">
                    <p className="text-3xl font-bold text-creative-500">12</p>
                    <p className="text-sm text-muted-foreground">Videos</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black border border-creative-700">
                    <p className="text-3xl font-bold text-creative-500">1,204</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                  <div className="p-4 rounded-lg bg-black border border-creative-700">
                    <p className="text-3xl font-bold text-creative-500">83</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                </div>
              </div>
              
              <Separator className="bg-creative-700" />
              
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Recent Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-creative-800">
                    <span className="text-foreground">Created video "Marketing Tips"</span>
                    <span className="text-sm text-muted-foreground">2 days ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-creative-800">
                    <span className="text-foreground">Updated profile information</span>
                    <span className="text-sm text-muted-foreground">1 week ago</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-black/30 border border-creative-800">
                    <span className="text-foreground">Created video "Sales Strategy"</span>
                    <span className="text-sm text-muted-foreground">2 weeks ago</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Profile;
