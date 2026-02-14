import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ServiceFinder from './components/ServiceFinder';
import AddProductModal from './components/AddProductModal';
import { Product, NotificationItem } from './types';
import { INITIAL_PRODUCTS, INITIAL_NOTIFICATIONS } from './constants';
import { X, Bell } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'dashboard' | 'services'>('dashboard');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);

  const handleAddProduct = (newProduct: Product) => {
    setProducts([newProduct, ...products]);
    // Simulate adding a notification
    const newNotif: NotificationItem = {
        id: Date.now().toString(),
        title: 'Product Added',
        message: `${newProduct.name} has been secured in your locker.`,
        date: new Date().toISOString(),
        type: 'info',
        read: false
    };
    setNotifications([newNotif, ...notifications]);
  };

  const NotificationDrawer = () => (
      <div className={`fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-[60] ${isNotificationOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-heading font-bold text-primary flex items-center">
                  <Bell size={18} className="mr-2" /> Notifications
              </h3>
              <button onClick={() => setIsNotificationOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
              </button>
          </div>
          <div className="overflow-y-auto h-full p-4 space-y-4">
              {notifications.map(n => (
                  <div key={n.id} className={`p-3 rounded-lg border ${n.type === 'warning' ? 'bg-amber-50 border-amber-100' : 'bg-white border-slate-100'} shadow-sm`}>
                      <p className="text-sm font-semibold text-primary mb-1">{n.title}</p>
                      <p className="text-xs text-slate-500 mb-2">{n.message}</p>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wide">{new Date(n.date).toLocaleDateString()}</span>
                  </div>
              ))}
              {notifications.length === 0 && <p className="text-center text-slate-400 text-sm py-4">No new notifications</p>}
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <Navbar 
        onOpenNotifications={() => setIsNotificationOpen(true)} 
        notificationCount={notifications.filter(n => !n.read).length}
      />

      {/* Backdrop for notifications */}
      {isNotificationOpen && (
          <div 
            className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-50" 
            onClick={() => setIsNotificationOpen(false)}
          />
      )}
      <NotificationDrawer />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Simple Tab Navigation */}
        <div className="flex space-x-6 mb-8 border-b border-slate-200 pb-1">
            <button 
                onClick={() => setCurrentView('dashboard')}
                className={`pb-3 px-1 text-sm font-semibold transition-all border-b-2 ${currentView === 'dashboard' ? 'border-cta text-cta' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Digital Locker
            </button>
            <button 
                onClick={() => setCurrentView('services')}
                className={`pb-3 px-1 text-sm font-semibold transition-all border-b-2 ${currentView === 'services' ? 'border-cta text-cta' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Service Network
            </button>
        </div>

        {currentView === 'dashboard' ? (
            <Dashboard 
                products={products} 
                onAddProduct={() => setIsModalOpen(true)}
                onViewProduct={(p) => console.log('View product', p)}
            />
        ) : (
            <ServiceFinder />
        )}
      </main>

      <AddProductModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddProduct}
      />
    </div>
  );
};

export default App;
