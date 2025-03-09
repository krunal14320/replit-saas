import { cn } from '@/lib/utils';
import { Link } from 'wouter';

type StatCardProps = {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconColor: string;
  linkText?: string;
  linkHref?: string;
  className?: string;
};

export function StatsCard({ 
  title, 
  value, 
  icon, 
  iconColor, 
  linkText, 
  linkHref,
  className 
}: StatCardProps) {
  return (
    <div className={cn("bg-white overflow-hidden shadow rounded-lg", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconColor)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      
      {linkText && linkHref && (
        <div className="bg-gray-50 px-5 py-3">
          <div className="text-sm">
            <Link href={linkHref}>
              <a className={cn("font-medium hover:text-blue-700", iconColor.includes('blue') ? 'text-blue-500' : 
                iconColor.includes('indigo') ? 'text-indigo-600' : 
                iconColor.includes('green') ? 'text-green-600' : 
                iconColor.includes('amber') ? 'text-amber-600' : 'text-blue-500')}>
                {linkText}
              </a>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
