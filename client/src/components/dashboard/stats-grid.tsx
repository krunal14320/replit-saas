import { StatsCard } from '@/components/ui/stats-card';
import { Users, Building, DollarSign, Layers } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

type DashboardStats = {
  totalUsers: number;
  activeUsers: number;
  totalTenants: number;
  activeTenants: number;
  totalPlans: number;
};

export function StatsGrid() {
  const { data, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
  });
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white overflow-hidden shadow rounded-lg p-5">
            <Skeleton className="h-10 w-10 rounded-md mb-4" />
            <Skeleton className="h-4 w-1/2 mb-2" />
            <Skeleton className="h-8 w-1/3" />
          </div>
        ))}
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatsCard 
        title="Total Users"
        value={data?.totalUsers || 0}
        icon={<Users className="h-6 w-6 text-white" />}
        iconColor="bg-blue-500"
        linkText="View all users"
        linkHref="/users"
      />
      
      <StatsCard 
        title="Active Tenants"
        value={data?.activeTenants || 0}
        icon={<Building className="h-6 w-6 text-white" />}
        iconColor="bg-indigo-500"
        linkText="View all tenants"
        linkHref="/tenants"
      />
      
      <StatsCard 
        title="Monthly Revenue"
        value={`$${(data?.totalTenants || 0) * 89}`}
        icon={<DollarSign className="h-6 w-6 text-white" />}
        iconColor="bg-green-500"
        linkText="View financials"
        linkHref="/subscriptions"
      />
      
      <StatsCard 
        title="Active Plans"
        value={data?.totalPlans || 0}
        icon={<Layers className="h-6 w-6 text-white" />}
        iconColor="bg-amber-500"
        linkText="Manage plans"
        linkHref="/subscriptions"
      />
    </div>
  );
}
