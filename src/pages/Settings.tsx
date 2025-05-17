
import React, { useState } from "react";
import { Header } from "@/components/navigation/header";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Moon, Sun, Bell, Shield, Key } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Menubar, MenubarContent, MenubarItem, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";

const Settings = () => {
  // State for theme mode
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  
  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // State for privacy settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  
  // Handle theme change
  const handleThemeChange = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    
    // Apply the theme to the document
    if (newTheme === "light") {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    }
    
    toast.success(`${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)} mode activated`);
  };
  
  // Handle save settings
  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  return (
    <div className={`min-h-screen ${theme === "light" ? "bg-white text-gray-900" : "bg-background text-foreground"}`}>
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="text-creative-500" size={28} />
          <h1 className="text-3xl font-bold text-creative-500">Settings</h1>
        </div>
        
        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="mb-8 bg-black/60 border border-creative-800">
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="privacy">Privacy & Security</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appearance">
            <Card className={`border-creative-700 ${theme === "light" ? "bg-white" : "bg-black/60"}`}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-gray-900" : "text-creative-500"}>Appearance Settings</CardTitle>
                <CardDescription className={theme === "light" ? "text-gray-500" : ""}>
                  Customize how QuickClip looks for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {theme === "dark" ? (
                          <Moon className="text-creative-500" size={18} />
                        ) : (
                          <Sun className="text-amber-500" size={18} />
                        )}
                        <Label htmlFor="theme-mode" className="text-base font-medium">
                          {theme === "dark" ? "Dark Mode" : "Light Mode"}
                        </Label>
                      </div>
                      <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-muted-foreground"}`}>
                        Switch between dark and light mode
                      </p>
                    </div>
                    <Switch
                      id="theme-mode"
                      checked={theme === "light"}
                      onCheckedChange={handleThemeChange}
                    />
                  </div>

                  <Separator className={theme === "light" ? "bg-gray-200" : "bg-creative-700"} />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="language" className="text-base font-medium">Language</Label>
                        <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-muted-foreground"}`}>
                          Select your preferred language
                        </p>
                      </div>
                      <Menubar className={theme === "light" ? "bg-white border-gray-200" : "bg-black/60 border-creative-800"}>
                        <MenubarMenu>
                          <MenubarTrigger className={theme === "light" ? "text-gray-900" : ""}>English (US)</MenubarTrigger>
                          <MenubarContent className={theme === "light" ? "bg-white" : "bg-black border-creative-800"}>
                            <MenubarItem>English (US)</MenubarItem>
                            <MenubarItem>Español</MenubarItem>
                            <MenubarItem>Français</MenubarItem>
                            <MenubarItem>Deutsch</MenubarItem>
                            <MenubarItem>Tiếng Việt</MenubarItem>
                          </MenubarContent>
                        </MenubarMenu>
                      </Menubar>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  className={theme === "light" ? "bg-creative-500 hover:bg-creative-600 text-white" : "bg-creative-500 hover:bg-creative-700"}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className={`border-creative-700 ${theme === "light" ? "bg-white" : "bg-black/60"}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Bell className="text-creative-500" size={20} />
                  <CardTitle className={theme === "light" ? "text-gray-900" : "text-creative-500"}>Notification Settings</CardTitle>
                </div>
                <CardDescription className={theme === "light" ? "text-gray-500" : ""}>
                  Choose how you want to be notified
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notif" className="text-base font-medium">Email Notifications</Label>
                    <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-muted-foreground"}`}>
                      Receive updates via email
                    </p>
                  </div>
                  <Switch
                    id="email-notif"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>
                
                <Separator className={theme === "light" ? "bg-gray-200" : "bg-creative-700"} />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="push-notif" className="text-base font-medium">Push Notifications</Label>
                    <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-muted-foreground"}`}>
                      Receive push notifications in browser
                    </p>
                  </div>
                  <Switch
                    id="push-notif"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  className={theme === "light" ? "bg-creative-500 hover:bg-creative-600 text-white" : "bg-creative-500 hover:bg-creative-700"}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="privacy">
            <Card className={`border-creative-700 ${theme === "light" ? "bg-white" : "bg-black/60"}`}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="text-creative-500" size={20} />
                  <CardTitle className={theme === "light" ? "text-gray-900" : "text-creative-500"}>Privacy & Security</CardTitle>
                </div>
                <CardDescription className={theme === "light" ? "text-gray-500" : ""}>
                  Manage your privacy and security settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="profile-visibility" className="text-base font-medium">Profile Visibility</Label>
                    <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-muted-foreground"}`}>
                      Make your profile visible to others
                    </p>
                  </div>
                  <Switch
                    id="profile-visibility"
                    checked={profileVisibility}
                    onCheckedChange={setProfileVisibility}
                  />
                </div>
                
                <Separator className={theme === "light" ? "bg-gray-200" : "bg-creative-700"} />
                
                <div className="space-y-2">
                  <Label className="text-base font-medium">Account Security</Label>
                  <Button
                    variant="outline"
                    className={theme === "light" ? "border-gray-200 text-gray-900" : "border-creative-800"}
                  >
                    <Key className="mr-2 h-4 w-4 text-creative-500" />
                    Change Password
                  </Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  className={theme === "light" ? "bg-creative-500 hover:bg-creative-600 text-white" : "bg-creative-500 hover:bg-creative-700"}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="account">
            <Card className={`border-creative-700 ${theme === "light" ? "bg-white" : "bg-black/60"}`}>
              <CardHeader>
                <CardTitle className={theme === "light" ? "text-gray-900" : "text-creative-500"}>Account Settings</CardTitle>
                <CardDescription className={theme === "light" ? "text-gray-500" : ""}>
                  Manage your account details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="name" className="text-left">Full Name</Label>
                    <input
                      id="name"
                      type="text"
                      className={`rounded-md border px-3 py-2 ${
                        theme === "light" 
                          ? "bg-white border-gray-200 text-gray-900" 
                          : "bg-black/60 border-creative-800 text-foreground"
                      }`}
                      defaultValue="Alex Johnson"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    <Label htmlFor="email" className="text-left">Email</Label>
                    <input
                      id="email"
                      type="email"
                      className={`rounded-md border px-3 py-2 ${
                        theme === "light" 
                          ? "bg-white border-gray-200 text-gray-900" 
                          : "bg-black/60 border-creative-800 text-foreground"
                      }`}
                      defaultValue="alex@example.com"
                    />
                  </div>
                </div>
                
                <Separator className={theme === "light" ? "bg-gray-200" : "bg-creative-700"} />
                
                <div>
                  <Button variant="destructive">Delete Account</Button>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleSaveSettings}
                  className={theme === "light" ? "bg-creative-500 hover:bg-creative-600 text-white" : "bg-creative-500 hover:bg-creative-700"}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Settings;
