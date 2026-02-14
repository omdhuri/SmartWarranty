import React from 'react';
import { NotificationItem } from '../types';
import { Check, Info, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';

interface NotificationPanelProps {
    notifications: NotificationItem[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onClose
}) => {
    return (
        <div className="absolute right-0 top-12 w-80 md:w-96 bg-white rounded-xl shadow-2xl border border-slate-100 z-50 animate-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
                <div className="flex space-x-2">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-cta hover:text-sky-700 font-medium px-2 py-1 hover:bg-sky-50 rounded transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={18} />
                    </button>
                </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-sm">
                        <div className="bg-slate-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Check className="text-slate-300" />
                        </div>
                        All caught up! No new notifications.
                    </div>
                ) : (
                    <div className="divide-y divide-slate-50">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group ${!notification.is_read ? 'bg-sky-50/30' : ''}`}
                                onClick={() => !notification.is_read && onMarkAsRead(notification.id)}
                            >
                                <div className="flex gap-3">
                                    <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' : ''}
                    ${notification.type === 'success' ? 'bg-green-100 text-green-600' : ''}
                    ${notification.type === 'warning' ? 'bg-amber-100 text-amber-600' : ''}
                    ${notification.type === 'error' ? 'bg-red-100 text-red-600' : ''}
                  `}>
                                        {notification.type === 'info' && <Info size={16} />}
                                        {notification.type === 'success' && <CheckCircle size={16} />}
                                        {notification.type === 'warning' && <AlertTriangle size={16} />}
                                        {notification.type === 'error' && <XCircle size={16} />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className={`text-sm font-medium ${!notification.is_read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.is_read && (
                                                <span className="w-2 h-2 bg-cta rounded-full mt-1.5 flex-shrink-0"></span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">{notification.message}</p>
                                        <p className="text-[10px] text-slate-400 mt-2">
                                            {new Date(notification.created_at).toLocaleDateString()} • {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationPanel;
