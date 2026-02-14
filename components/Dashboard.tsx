import React, { useState, useEffect } from 'react';
import { Product, getWarrantyStatus } from '../types';
import { getProducts, ProductFilters } from '../services/productService';
import ProductCard from './ProductCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Search, Filter, Plus, Loader2, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onAddProduct: () => void;
  onViewProduct: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
  onDeleteProduct?: (product: Product) => void;
  onArchiveProduct?: (product: Product) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onAddProduct, onViewProduct, onEditProduct, onDeleteProduct, onArchiveProduct }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Fix for Recharts hydration/sizing issue
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch products from Supabase
  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async (filters?: ProductFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getProducts(filters);
      setProducts(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to connect to database.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search with debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm || categoryFilter !== 'all') {
        loadProducts({ search: searchTerm, category: categoryFilter });
      } else {
        loadProducts();
      }
    }, 300); // Debounce for performance (UI.md guideline)

    return () => clearTimeout(timer);
  }, [searchTerm, categoryFilter]);

  // Analytics Data
  const activeCount = products.filter(p => {
    const { status } = getWarrantyStatus(p);
    return status !== 'Expired';
  }).length;
  const expiringCount = products.filter(p => getWarrantyStatus(p).status === 'Expiring Soon').length;
  const expiredCount = products.length - activeCount;

  const chartData = [
    { name: 'Active', value: activeCount, color: '#10B981' },
    { name: 'Expiring', value: expiringCount, color: '#F59E0B' },
    { name: 'Expired', value: expiredCount, color: '#EF4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">

      {/* Top Section: Welcome & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Hero Card with gradient - UI.md: 60-30-10 rule, premium effects */}
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
          <div className="relative z-10">
            <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back, Alex</h1>
            <p className="text-slate-300 mb-6 max-w-md">
              Your digital locker is secure. You have {activeCount} active warranties protecting your assets.
            </p>
            <button
              onClick={onAddProduct}
              className="bg-cta hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-sky-900/20 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center focus:ring-4 focus:ring-sky-400/50 outline-none"
            >
              <Plus size={20} className="mr-2" />
              Add New Product
            </button>
          </div>
          {/* Abstract BG Shapes - UI.md: Layered depth */}
          <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute right-20 bottom-0 w-40 h-40 bg-cta/20 rounded-full blur-2xl transform translate-y-1/2"></div>
        </div>

        {/* Mini Chart - UI.md: Subtle shadows, clean design */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col justify-between transition-all duration-300 hover:shadow-lg">
          <h3 className="font-heading font-semibold text-primary">Warranty Status</h3>
          {chartData.length > 0 ? (
            <>
              <div style={{ width: '100%', height: '200px', minHeight: '200px', position: 'relative' }}>
                {mounted ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full w-full bg-slate-50 rounded-lg animate-pulse">
                    <Loader2 className="animate-spin text-slate-300" size={24} />
                  </div>
                )}
              </div>
              <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-success mr-2"></div>Active</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-warning mr-2"></div>Expiring</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-error mr-2"></div>Expired</div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-32 text-slate-400 text-sm">
              No products yet
            </div>
          )}
        </div>
      </div>

      {/* Controls - UI.md: High contrast focus rings, accessible */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-heading font-bold text-primary self-start sm:self-center">
          Your Products {!loading && `(${products.length})`}
        </h2>
        <div className="flex space-x-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-cta focus:border-cta outline-none text-sm transition-all duration-150"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <button
            className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-all duration-150 hover:shadow-md focus:ring-2 focus:ring-cta outline-none"
            aria-label="Filter products"
          >
            <Filter size={20} />
          </button>
        </div>
      </div>

      {/* Loading State - UI.md: Shimmer effect, performance-first */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 animate-pulse">
              <div className="bg-slate-200 h-40 rounded-lg mb-4"></div>
              <div className="bg-slate-200 h-4 rounded w-3/4 mb-2"></div>
              <div className="bg-slate-200 h-3 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      )}

      {/* Error State - UI.md: Clear error messaging, WCAG compliant */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
          <AlertCircle className="text-red-500" size={24} />
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Products</h3>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button
            onClick={() => loadProducts()}
            className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-150"
          >
            Retry
          </button>
        </div>
      )}

      {/* Product Grid - UI.md: Staggered entrance, premium interactions */}
      {!loading && !error && products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <div
              key={product.id}
              style={{ animationDelay: `${index * 100}ms` }}
              className="animate-in fade-in slide-in-from-bottom-4 duration-300"
            >
              <ProductCard
                product={product}
                onClick={onViewProduct}
                onEdit={onEditProduct}
                onDelete={onDeleteProduct}
                onArchive={onArchiveProduct}
              />
            </div>
          ))}
        </div>
      )}

      {/* Empty State - UI.md: Helpful, not frustrating */}
      {!loading && !error && products.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
          <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
            <Search size={32} className="text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium mb-2">
            {searchTerm ? `No products found matching "${searchTerm}"` : 'No products in your locker yet'}
          </p>
          {!searchTerm && (
            <button
              onClick={onAddProduct}
              className="mt-4 text-cta hover:text-sky-700 font-semibold transition-colors duration-150"
            >
              Add your first product →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
