import React, { useState, useRef, useEffect } from 'react';
import { User, Settings, BarChart3, Download, Moon, Sun, HelpCircle, FileText, LogOut } from 'lucide-react';

interface UserProfileDropdownProps {
    onClose?: () => void;
}

const UserProfileDropdown: React.FC<UserProfileDropdownProps> = ({ onClose }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleExportData = () => {
        alert('Export functionality coming soon! Your warranty data will be exported as CSV/PDF.');
        setIsOpen(false);
    };

    const handleToggleDarkMode = () => {
        setDarkMode(!darkMode);
        alert('Dark mode coming soon!');
    };

    const handleLogout = () => {
        if (confirm('Are you sure you want to logout?')) {
            alert('Logout functionality will be implemented with authentication.');
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Avatar Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="h-8 w-8 rounded-full bg-gradient-to-tr from-cta to-accent flex items-center justify-center cursor-pointer hover:shadow-glow transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                aria-label="User menu"
            >
                <User size={16} className="text-white" />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-cta to-accent flex items-center justify-center">
                                <User size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">User Name</p>
                                <p className="text-xs text-slate-500">user@example.com</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                alert('Settings coming soon!');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <Settings size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Settings</span>
                        </button>

                        <button
                            onClick={() => {
                                alert('Statistics view coming soon!');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <BarChart3 size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">My Statistics</span>
                        </button>

                        <button
                            onClick={handleExportData}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <Download size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Export Data</span>
                        </button>

                        <button
                            onClick={handleToggleDarkMode}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            {darkMode ? (
                                <>
                                    <Sun size={18} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon size={18} className="text-slate-500" />
                                    <span className="text-sm font-medium text-slate-700">Dark Mode</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-2"></div>

                    {/* Help Section */}
                    <div className="py-2">
                        <button
                            onClick={() => {
                                alert('Help & Support coming soon!');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <HelpCircle size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Help & Support</span>
                        </button>

                        <button
                            onClick={() => {
                                alert('Terms & Privacy coming soon!');
                                setIsOpen(false);
                            }}
                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-slate-50 transition-colors text-left"
                        >
                            <FileText size={18} className="text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">Terms & Privacy</span>
                        </button>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 my-2"></div>

                    {/* Logout */}
                    <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                    >
                        <LogOut size={18} className="text-red-500" />
                        <span className="text-sm font-medium text-red-600">Logout</span>
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserProfileDropdown;
