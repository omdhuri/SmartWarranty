import React from 'react';
import { ShieldCheck, Bell, User, Menu } from 'lucide-react';

interface NavbarProps {
  onOpenNotifications: () => void;
  notificationCount: number;
}

const Navbar: React.FC<NavbarProps> = ({ onOpenNotifications, notificationCount }) => {
  return (
    <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="bg-cta p-1.5 rounded-lg group-hover:bg-accent transition-colors duration-200">
              <ShieldCheck size={28} className="text-white" />
            </div>
            <span className="text-xl font-heading font-bold tracking-tight">SmartWarranty</span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Dashboard</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">My Locker</a>
            <a href="#" className="text-slate-300 hover:text-white transition-colors">Services</a>
          </div>

          <div className="flex items-center space-x-4">
            <button 
              onClick={onOpenNotifications}
              className="relative p-2 rounded-full hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <Bell size={20} />
              {notificationCount > 0 && (
                <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-primary animate-pulse" />
              )}
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cta to-accent flex items-center justify-center cursor-pointer hover:shadow-glow transition-all">
              <User size={16} className="text-white" />
            </div>
            <button className="md:hidden p-2 text-slate-300">
               <Menu size={24} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
