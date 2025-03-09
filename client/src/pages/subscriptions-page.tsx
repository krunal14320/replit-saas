import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlanList } from "@/components/subscription/plan-list";
import { SubscriptionList } from "@/components/subscription/subscription-list";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("plans");
  
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Subscription Management</h1>
              <p className="mt-1 text-sm text-gray-500">Manage subscription plans and customer subscriptions.</p>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid grid-cols-2 w-full max-w-md">
                <TabsTrigger value="plans">Plans</TabsTrigger>
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="plans" className="space-y-4">
                <PlanList />
              </TabsContent>
              
              <TabsContent value="subscriptions" className="space-y-4">
                <SubscriptionList />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}
