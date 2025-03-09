import { Sidebar } from "@/components/ui/sidebar";
import { TopNavbar } from "@/components/ui/top-navbar";
import { UserManagement } from "@/components/dashboard/user-management";

export default function UsersPage() {
  return (
    <div className="min-h-screen flex overflow-hidden bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          <div className="max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
              <p className="mt-1 text-sm text-gray-500">Create, edit, and manage user accounts across your organization.</p>
            </div>
            
            {/* User Management */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="mb-4">
                <h2 className="text-lg font-medium text-gray-900">All Users</h2>
                <p className="text-sm text-gray-500">Manage all users in the system</p>
              </div>
              
              <UserManagement />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
