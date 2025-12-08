"use client";

import { useState } from 'react';
import { 
  User, 
  Shield, 
  CreditCard, 
  Bell, 
  Save,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [isSaving, setIsSaving] = useState(false);

  // Mock User Data
  const [user, setUser] = useState({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    phone: "+1 (555) 123-4567",
    language: "en"
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      // Toast notification would go here
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account's profile information and email address.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                 <Avatar className="h-20 w-20">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>AJ</AvatarFallback>
                 </Avatar>
                 <Button variant="outline">Change Avatar</Button>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                     id="name" 
                     value={user.name} 
                     onChange={(e) => setUser({...user, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="email">Email</Label>
                   <Input 
                      id="email" 
                      value={user.email} 
                      onChange={(e) => setUser({...user, email: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="phone">Phone Number</Label>
                   <Input 
                      id="phone" 
                      value={user.phone}
                      onChange={(e) => setUser({...user, phone: e.target.value})}
                   />
                </div>
                <div className="space-y-2">
                   <Label htmlFor="language">Language Preference</Label>
                   <select 
                      id="language"
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      value={user.language}
                      onChange={(e) => setUser({...user, language: e.target.value})}
                   >
                      <option value="en">English (US)</option>
                      <option value="ar">Arabic</option>
                      <option value="fr">French</option>
                   </select>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
               <CardTitle>Security Settings</CardTitle>
               <CardDescription>Manage your password and security preferences.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label>Current Password</Label>
                 <Input type="password" />
               </div>
               <div className="space-y-2">
                 <Label>New Password</Label>
                 <Input type="password" />
               </div>
               <div className="space-y-2">
                 <Label>Confirm New Password</Label>
                 <Input type="password" />
               </div>
               <Separator />
               <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                     <div className="font-medium">Two-Factor Authentication</div>
                     <div className="text-sm text-muted-foreground">Add an extra layer of security to your account.</div>
                  </div>
                  <Button variant="outline">Enable</Button>
               </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-4">
           <Card>
              <CardHeader>
                 <CardTitle>Subscription Plan</CardTitle>
                 <CardDescription>You are currently on the <span className="font-semibold text-primary">Pro Plan</span>.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="bg-muted p-4 rounded-lg flex items-center justify-between">
                    <div>
                       <p className="font-medium">Pro Plan ($29/month)</p>
                       <p className="text-sm text-muted-foreground">Next billing date: Jan 01, 2026</p>
                    </div>
                    <Button variant="outline">Manage</Button>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>

        {/* Notifications Tab */}
         <TabsContent value="notifications" className="space-y-4">
           <Card>
              <CardHeader>
                 <CardTitle>Email Notifications</CardTitle>
                 <CardDescription>Configure what emails you receive from us.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between border-b pb-4">
                    <div className="space-y-0.5">
                       <div className="font-medium">CV Generation Complete</div>
                       <div className="text-sm text-muted-foreground">Receive an email when your CV is ready.</div>
                    </div>
                    {/* Mock Switch */}
                    <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between pb-4">
                    <div className="space-y-0.5">
                       <div className="font-medium">API Usage Alerts</div>
                       <div className="text-sm text-muted-foreground">Get notified when you approach your usage limits.</div>
                    </div>
                     <div className="h-6 w-11 rounded-full bg-primary relative cursor-pointer">
                      <div className="absolute top-1 right-1 h-4 w-4 rounded-full bg-white shadow-sm" />
                    </div>
                 </div>
              </CardContent>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
