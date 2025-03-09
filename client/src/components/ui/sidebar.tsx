import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  Home,
  Users,
  Shield,
  Building,
  Tag,
  Settings,
  ChevronRight,
  Zap
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useSidebar } from "@/hooks/use-sidebar";

type SidebarLinkProps = {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
};

const SidebarLink = ({ href, icon, children, active, onClick }: SidebarLinkProps) => {
  return (
    <Link href={href}>
      <div
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
          active
            ? "text-white bg-gray-800"
            : "text-gray-300 hover:bg-gray-700 hover:text-white"
        )}
        onClick={onClick}
      >
        <div className="mr-3 h-6 w-6 text-gray-400">{icon}</div>
        {children}
      </div>
    </Link>
  );
};

type SubMenuProps = {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
};

const SubMenu = ({ title, icon, children, defaultOpen = false }: SubMenuProps) => {
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Auto-open submenu when one of its children is active
  useEffect(() => {
    const childLinks = Array.isArray(children) 
      ? children
      : [children];
    
    const shouldOpen = childLinks.some((child: React.ReactElement) => {
      return child && child.props && child.props.href === location;
    });
    
    if (shouldOpen) {
      setIsOpen(true);
    }
  }, [location, children]);

  return (
    <div className="mt-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <div className="mr-3 h-6 w-6 text-gray-400">{icon}</div>
        {title}
        <ChevronRight
          className={cn(
            "ml-auto h-5 w-5 transform transition-transform duration-200",
            isOpen ? "rotate-90" : "rotate-0"
          )}
        />
      </button>
      
      {isOpen && (
        <div className="mt-1 pl-4 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
};

export function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { isOpen, toggle, close } = useSidebar();
  const isAdmin = user && user.role === "admin";

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-20 transition-opacity bg-gray-500 bg-opacity-75 md:hidden" 
          onClick={close}
        />
      )}
      
      <div
        className={cn(
          "fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-gray-900 overflow-y-auto md:translate-x-0 md:static md:inset-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Zap className="h-8 w-8 text-blue-500" />
            <span className="ml-2 text-xl font-semibold text-white">SaaS Admin</span>
          </div>
          <button onClick={close} className="text-gray-300 md:hidden">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <SidebarLink 
            href="/" 
            icon={<Home />} 
            active={location === "/"} 
            onClick={close}
          >
            Dashboard
          </SidebarLink>
          
          <SubMenu 
            title="User Management" 
            icon={<Users />}
            defaultOpen={location === "/users" || location === "/roles"}
          >
            <SidebarLink 
              href="/users" 
              icon={<div className="w-1 h-1 rounded-full bg-gray-400 mx-2" />} 
              active={location === "/users"} 
              onClick={close}
            >
              Users
            </SidebarLink>
            
            {isAdmin && (
              <SidebarLink 
                href="/roles" 
                icon={<div className="w-1 h-1 rounded-full bg-gray-400 mx-2" />} 
                active={location === "/roles"} 
                onClick={close}
              >
                Roles & Permissions
              </SidebarLink>
            )}
          </SubMenu>
          
          {isAdmin && (
            <SubMenu 
              title="Tenants" 
              icon={<Building />}
              defaultOpen={location === "/tenants"}
            >
              <SidebarLink 
                href="/tenants" 
                icon={<div className="w-1 h-1 rounded-full bg-gray-400 mx-2" />} 
                active={location === "/tenants"} 
                onClick={close}
              >
                All Tenants
              </SidebarLink>
            </SubMenu>
          )}
          
          {isAdmin && (
            <SubMenu 
              title="Subscriptions" 
              icon={<Tag />}
              defaultOpen={location === "/subscriptions"}
            >
              <SidebarLink 
                href="/subscriptions" 
                icon={<div className="w-1 h-1 rounded-full bg-gray-400 mx-2" />} 
                active={location === "/subscriptions"} 
                onClick={close}
              >
                Plans
              </SidebarLink>
            </SubMenu>
          )}
          
          <SidebarLink 
            href="/settings" 
            icon={<Settings />} 
            active={location === "/settings"} 
            onClick={close}
          >
            Settings
          </SidebarLink>
        </nav>
      </div>
    </>
  );
}
