import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSidebar } from '@/hooks/use-sidebar';
import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';

type NotificationItem = {
  id: string;
  title: string;
  time: string;
  type: 'user' | 'success';
};

export function TopNavbar() {
  const { user, logoutMutation } = useAuth();
  const { toggle } = useSidebar();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  // Mock notification data - this would come from an API in a real app
  const notifications: NotificationItem[] = [
    {
      id: '1',
      title: 'New user registered',
      time: '5 minutes ago',
      type: 'user',
    },
    {
      id: '2',
      title: 'Subscription payment successful',
      time: '1 hour ago',
      type: 'success',
    },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="bg-white shadow">
      <div className="flex justify-between items-center px-4 py-3">
        <div className="flex items-center">
          <button
            onClick={toggle}
            className="text-gray-500 focus:outline-none md:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="relative ml-3 md:ml-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </span>
            <Input
              className="w-full pl-10 pr-4 py-2 md:w-72 rounded-lg text-sm bg-gray-100 focus:outline-none focus:ring focus:ring-blue-100 focus:border-blue-300"
              type="text"
              placeholder="Search..."
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Notifications Dropdown */}
          <DropdownMenu open={notificationsOpen} onOpenChange={setNotificationsOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-6 w-6 text-gray-500" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-4 py-2 border-b border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              </div>
              <div>
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="px-4 py-3 border-b focus:bg-gray-50">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white
                          ${notification.type === 'user' ? 'bg-blue-500' : 'bg-green-500'}`}
                        >
                          {notification.type === 'user' ? <User className="h-5 w-5" /> : 
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          }
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-xs text-gray-500">{notification.time}</p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <Link href="/notifications">
                  <a className="block text-center text-sm font-medium text-blue-500 bg-gray-50 hover:bg-gray-100 py-2 w-full">
                    View all notifications
                  </a>
                </Link>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center focus:outline-none">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.fullName} />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {user?.fullName ? getInitials(user.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {user?.fullName || user?.username || 'User'}
                </span>
                <ChevronDown className="ml-1 h-5 w-5 text-gray-700 hidden md:block" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <a className="cursor-pointer flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Your Profile</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <a className="cursor-pointer flex items-center">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </a>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout} 
                disabled={logoutMutation.isPending}
                className="cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>{logoutMutation.isPending ? 'Signing out...' : 'Sign out'}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
