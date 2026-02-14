import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import ProductLocker from './components/ProductLocker';
import ServiceFinder from './components/ServiceFinder';
import AddProductModal from './components/AddProductModal';
import ClaimsList from './components/ClaimsList';
import NotificationPanel from './components/NotificationPanel';
import ProductDetailModal from './components/ProductDetailModal';
import { Product, NotificationItem } from './types';
import { getNotifications, markAsRead, markAllAsRead, createNotification } from './services/notificationService';

const App: React.FC = () => {
    const [currentView, setCurrentView] = useState<'dashboard' | 'locker' | 'services' | 'claims'>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    // Initial load of notifications
    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        const data = await getNotifications();
        setNotifications(data);
    };

    const handleMarkAsRead = async (id: string) => {
        await markAsRead(id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    };

    const handleMarkAllAsRead = async () => {
        await markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    };

    const handleProductAdded = async (newProduct: Product) => {
        try {
            // Create notification in DB
            await createNotification(
                'Product Added',
                `${newProduct.name} has been secured in your locker.`,
                'success'
            );

            // Reload dashboard and notifications
            setRefreshKey(prev => prev + 1);
            loadNotifications();
            setIsModalOpen(false);
            setEditingProduct(null);
        } catch (error) {
            console.error('Error creating notification:', error);
        }
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteProduct = async (product: Product) => {
        if (window.confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
            try {
                const { deleteProduct } = await import('./services/productService');
                await deleteProduct(product.id);

                await createNotification(
                    'Product Deleted',
                    `${product.name} has been removed from your locker.`,
                    'info'
                );

                setRefreshKey(prev => prev + 1);
                loadNotifications();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const handleArchiveProduct = async (product: Product) => {
        if (window.confirm(`Archive "${product.name}"? You can view archived products later.`)) {
            try {
                const { deleteProduct } = await import('./services/productService');
                await deleteProduct(product.id); // Uses same soft-delete logic

                await createNotification(
                    'Product Archived',
                    `${product.name} has been archived.`,
                    'info'
                );

                setRefreshKey(prev => prev + 1);
                loadNotifications();
            } catch (error) {
                console.error('Error archiving product:', error);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-text font-sans relative">
            <Navbar
                onOpenNotifications={() => setIsNotificationOpen(!isNotificationOpen)}
                notificationCount={notifications.filter(n => !n.is_read).length}
                currentView={currentView === 'claims' ? 'dashboard' : currentView}
                onNavigate={(view) => setCurrentView(view)}
            />

            {/* Notification Panel as a global overlay/dropdown from navbar */}
            {isNotificationOpen && (
                <div className="fixed inset-0 z-[60] flex justify-end">
                    {/* Backdrop to close */}
                    <div
                        className="fixed inset-0 bg-black/10 z-[50]"
                        onClick={() => setIsNotificationOpen(false)}
                    />

                    {/* The Panel itself - positioned relative to navbar or fixed right */}
                    <div className="relative z-[60] mt-16 mr-4">
                        <NotificationPanel
                            notifications={notifications}
                            onMarkAsRead={handleMarkAsRead}
                            onMarkAllAsRead={handleMarkAllAsRead}
                            onClose={() => setIsNotificationOpen(false)}
                        />
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Simple Tab Navigation */}
                <div className="flex space-x-6 mb-8 border-b border-slate-200 pb-1">
                    <button
                        onClick={() => setCurrentView('dashboard')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 ${currentView === 'dashboard' ? 'border-cta text-cta' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Digital Locker
                    </button>
                    <button
                        onClick={() => setCurrentView('claims')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 ${currentView === 'claims' ? 'border-cta text-cta' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Claims
                    </button>
                    <button
                        onClick={() => setCurrentView('services')}
                        className={`pb-3 px-3 text-sm font-semibold transition-all border-b-2 ${currentView === 'services' ? 'border-cta text-cta' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                    >
                        Service Network
                    </button>
                </div>


                {currentView === 'dashboard' ? (
                    <Dashboard
                        key={refreshKey}
                        onAddProduct={() => setIsModalOpen(true)}
                        onViewProduct={(p) => {
                            setSelectedProduct(p);
                            setIsDetailModalOpen(true);
                        }}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onArchiveProduct={handleArchiveProduct}
                    />
                ) : currentView === 'locker' ? (
                    <ProductLocker
                        onAddProduct={() => setIsModalOpen(true)}
                        onViewProduct={(p) => {
                            setSelectedProduct(p);
                            setIsDetailModalOpen(true);
                        }}
                        onEditProduct={handleEditProduct}
                        onDeleteProduct={handleDeleteProduct}
                        onArchiveProduct={handleArchiveProduct}
                    />
                ) : currentView === 'claims' ? (
                    <ClaimsList />
                ) : (
                    <ServiceFinder />
                )}
            </main>

            <AddProductModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingProduct(null);
                }}
                onSave={handleProductAdded}
                product={editingProduct}
            />

            {/* Product Detail Modal */}
            {selectedProduct && (
                <ProductDetailModal
                    product={selectedProduct}
                    isOpen={isDetailModalOpen}
                    onClose={() => {
                        setIsDetailModalOpen(false);
                        setSelectedProduct(null);
                    }}
                    onEdit={handleEditProduct}
                    onDelete={handleDeleteProduct}
                    onArchive={handleArchiveProduct}
                />
            )}
        </div>
    );
};

export default App;
