import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/settings/settings-form";
import { useState } from "react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="mt-1 text-sm text-gray-500">Manage your application settings and configurations.</p>
            </div>
            
            <Card>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="p-1">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="appearance">Appearance</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                
                <TabsContent value="general" className="p-4">
                  <SettingsForm section="general" />
                </TabsContent>
                
                <TabsContent value="appearance" className="p-4">
                  <SettingsForm section="appearance" />
                </TabsContent>
                
                <TabsContent value="security" className="p-4">
                  <SettingsForm section="security" />
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
