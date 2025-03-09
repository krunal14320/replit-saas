import { ActivityItem } from '@/components/ui/activity-item';
import { useQuery } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity } from '@shared/schema';

type ActivityWithDetails = Activity & {
  user?: { username: string };
  tenant?: { name: string };
  plan?: { name: string };
};

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery<ActivityWithDetails[]>({
    queryKey: ['/api/activities'],
  });
  
  // Helper to determine the appropriate icon based on the activity action
  const getIconType = (action: string) => {
    if (action.startsWith('user.')) return 'user';
    if (action.startsWith('tenant.')) return 'tenant';
    if (action.startsWith('subscription.') || action.startsWith('plan.')) return 'plan';
    return 'success';
  };
  
  // Helper to format activity title and description
  const formatActivity = (activity: ActivityWithDetails) => {
    return {
      title: activity.description,
      icon: getIconType(activity.action),
      timestamp: activity.timestamp,
    };
  };
  
  if (isLoading) {
    return (
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="px-6 py-4">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  if (!activities || activities.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
        <div className="mt-4 bg-white shadow rounded-lg overflow-hidden p-6 text-center text-gray-500">
          No recent activity found.
        </div>
      </div>
    );
  }
  
  return (
    <div className="mt-8">
      <h2 className="text-lg leading-6 font-medium text-gray-900">Recent Activity</h2>
      <div className="mt-4 bg-white shadow rounded-lg overflow-hidden">
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => {
            const formattedActivity = formatActivity(activity);
            return (
              <li key={activity.id}>
                <ActivityItem
                  icon={formattedActivity.icon as any}
                  title={formattedActivity.title}
                  timestamp={new Date(formattedActivity.timestamp)}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
