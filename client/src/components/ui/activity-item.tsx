import { formatDistanceToNow } from 'date-fns';
import { User, Check, Building, Tag } from 'lucide-react';

type ActivityItemProps = {
  icon: 'user' | 'success' | 'tenant' | 'plan';
  title: string;
  description?: string;
  timestamp: Date;
};

export function ActivityItem({ icon, title, description, timestamp }: ActivityItemProps) {
  // Determine icon to display
  const getIcon = () => {
    switch (icon) {
      case 'user':
        return (
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
            <User className="h-6 w-6 text-blue-500" />
          </div>
        );
      case 'success':
        return (
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-500" />
          </div>
        );
      case 'tenant':
        return (
          <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
            <Building className="h-6 w-6 text-indigo-500" />
          </div>
        );
      case 'plan':
        return (
          <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
            <Tag className="h-6 w-6 text-amber-500" />
          </div>
        );
      default:
        return (
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-6 w-6 text-gray-500" />
          </div>
        );
    }
  };

  return (
    <div className="px-6 py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {title}
          </p>
          {description && (
            <p className="text-sm text-gray-500 truncate">
              {description}
            </p>
          )}
        </div>
        <div>
          <span className="text-sm text-gray-500">
            {formatDistanceToNow(timestamp, { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
