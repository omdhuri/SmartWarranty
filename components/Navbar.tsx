import React, { useState } from 'react';
import { ShieldCheck, Bell, Menu, X, Home, Package, Wrench, Settings, LogOut, User } from 'lucide-react';
import UserProfileDropdown from './UserProfileDropdown';

interface NavbarProps {
  onOpenNotifications: () => void;
  notificationCount: number;
  currentView: 'dashboard' | 'locker' | 'services';
  onNavigate: (view: 'dashboard' | 'locker' | 'services') => void;
}

const Navbar: React.FC<NavbarProps> = ({
  onOpenNotifications,
  notificationCount,
  currentView,
  onNavigate
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (view: 'dashboard' | 'locker' | 'services') => {
    onNavigate(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      <nav className="bg-primary text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="bg-cta p-1.5 rounded-lg group-hover:bg-accent transition-colors duration-200">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <span className="text-xl font-heading font-bold tracking-tight">SmartWarranty</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button
                onClick={() => onNavigate('dashboard')}
                className={`font-medium transition-colors ${currentView === 'dashboard'
                    ? 'text-white border-b-2 border-accent pb-1'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onNavigate('locker')}
                className={`font-medium transition-colors ${currentView === 'locker'
                    ? 'text-white border-b-2 border-accent pb-1'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                My Locker
              </button>
              <button
                onClick={() => onNavigate('services')}
                className={`font-medium transition-colors ${currentView === 'services'
                    ? 'text-white border-b-2 border-accent pb-1'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Services
              </button>
            </div>

            {/* Right Section - Icons */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button
                onClick={onOpenNotifications}
                className="relative p-2 rounded-full hover:bg-secondary transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <Bell size={20} />
                {notificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-error ring-2 ring-primary animate-pulse" />
                )}
              </button>

              {/* User Profile - Desktop */}
              <div className="hidden md:block">
                <UserProfileDropdown />
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-white hover:bg-secondary/50 transition-all duration-200"
                aria-label="Toggle menu"
              >
                <Menu size={24} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar Menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden animate-in fade-in duration-200"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 bottom-0 w-[280px] bg-white z-[70] md:hidden shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex flex-col h-full">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <h2 className="text-lg font-bold text-slate-800">Menu</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                  aria-label="Close menu"
                >
                  <X size={20} className="text-slate-600" />
                </button>
              </div>

              {/* User Profile Card */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-cta to-accent flex items-center justify-center shadow-md">
                    <User size={24} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">User Name</p>
                    <p className="text-xs text-slate-500 truncate">user@example.com</p>
                  </div>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="flex-1 overflow-y-auto py-2">
                <nav className="space-y-1 px-3">
                  {/* Dashboard */}
                  <button
                    onClick={() => handleNavigate('dashboard')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${currentView === 'dashboard'
                        ? 'bg-cta text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <div className="w-5 h-5">
                      <Home className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium">Dashboard</span>
                  </button>

                  {/* My Locker */}
                  <button
                    onClick={() => handleNavigate('locker')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${currentView === 'locker'
                        ? 'bg-cta text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <div className="w-5 h-5">
                      <Package className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium">My Locker</span>
                  </button>

                  {/* Services */}
                  <button
                    onClick={() => handleNavigate('services')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${currentView === 'services'
                        ? 'bg-cta text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                      }`}
                  >
                    <div className="w-5 h-5">
                      <Wrench className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium">Services</span>
                  </button>

                  {/* Separator */}
                  <div className="py-2">
                    <div className="h-px bg-slate-200" />
                  </div>

                  {/* Settings */}
                  <button
                    onClick={() => {
                      alert('Settings coming soon!');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-700 hover:bg-slate-100 transition-all duration-200"
                  >
                    <div className="w-5 h-5">
                      <Settings className="w-full h-full" />
                    </div>
                    <span className="text-sm font-medium">Settings</span>
                  </button>
                </nav>
              </div>

              {/* Logout Button - Fixed at Bottom */}
              <div className="p-3 border-t border-slate-200">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to logout?')) {
                      alert('Logout functionality coming soon!');
                      setMobileMenuOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200"
                >
                  <div className="w-5 h-5">
                    <LogOut className="w-full h-full" />
                  </div>
                  <span className="text-sm font-medium">Log out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Navbar;
