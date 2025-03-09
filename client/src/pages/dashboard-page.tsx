import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { UserManagement } from "@/components/dashboard/user-management";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome to your SaaS admin dashboard. Here's what's happening.</p>
            </div>
            
            {/* Dashboard Stats */}
            <StatsGrid />
            
            {/* Recent Activity */}
            <RecentActivity />
            
            {/* User Management Section */}
            <UserManagement />
          </div>
        </main>
      </div>
    </div>
  );
}
