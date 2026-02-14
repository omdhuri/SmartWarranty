import React, { useState, useEffect } from 'react';
import { Product, getWarrantyStatus } from '../types';
import { Search, Filter, SlidersHorizontal, Archive, Package, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import ProductCard from './ProductCard';
import { getProducts } from '../services/productService';

interface ProductLockerProps {
    onAddProduct: () => void;
    onViewProduct: (product: Product) => void;
    onEditProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    onArchiveProduct: (product: Product) => void;
}

type FilterTab = 'all' | 'active' | 'expiring' | 'expired';

const ProductLocker: React.FC<ProductLockerProps> = ({
    onAddProduct,
    onViewProduct,
    onEditProduct,
    onDeleteProduct,
    onArchiveProduct
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter products based on warranty status
    const filterByStatus = (products: Product[]): Product[] => {
        if (activeFilter === 'all') return products;

        return products.filter(product => {
            const { status } = getWarrantyStatus(product);
            if (activeFilter === 'active') return status === 'Active';
            if (activeFilter === 'expiring') return status === 'Expiring Soon';
            if (activeFilter === 'expired') return status === 'Expired';
            return true;
        });
    };

    // Filter by search query
    const filterBySearch = (products: Product[]): Product[] => {
        if (!searchQuery) return products;
        const query = searchQuery.toLowerCase();
        return products.filter(
            p =>
                p.name.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
        );
    };

    // Filter by category
    const filterByCategory = (products: Product[]): Product[] => {
        if (selectedCategory === 'all') return products;
        return products.filter(p => p.category === selectedCategory);
    };

    // Get unique categories
    const categories = ['all', ...new Set(products.map(p => p.category))];

    // Apply all filters
    const filteredProducts = filterByCategory(filterBySearch(filterByStatus(products)));

    // Group products by category
    const groupedProducts = filteredProducts.reduce((acc, product) => {
        if (!acc[product.category]) {
            acc[product.category] = [];
        }
        acc[product.category].push(product);
        return acc;
    }, {} as Record<string, Product[]>);

    // Count products by status
    const statusCounts = {
        all: products.length,
        active: products.filter(p => getWarrantyStatus(p).status === 'Active').length,
        expiring: products.filter(p => getWarrantyStatus(p).status === 'Expiring Soon').length,
        expired: products.filter(p => getWarrantyStatus(p).status === 'Expired').length
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-heading font-bold text-primary mb-2">My Product Locker</h1>
                <p className="text-slate-600">Organize and manage all your products with active warranties</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                <button
                    onClick={() => setActiveFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${activeFilter === 'all'
                            ? 'bg-cta text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-cta hover:text-cta'
                        }`}
                >
                    All ({statusCounts.all})
                </button>
                <button
                    onClick={() => setActiveFilter('active')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeFilter === 'active'
                            ? 'bg-emerald-500 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                        }`}
                >
                    <CheckCircle size={16} />
                    Active ({statusCounts.active})
                </button>
                <button
                    onClick={() => setActiveFilter('expiring')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeFilter === 'expiring'
                            ? 'bg-amber-500 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-amber-500 hover:text-amber-600'
                        }`}
                >
                    <Clock size={16} />
                    Expiring Soon ({statusCounts.expiring})
                </button>
                <button
                    onClick={() => setActiveFilter('expired')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${activeFilter === 'expired'
                            ? 'bg-red-500 text-white shadow-sm'
                            : 'bg-white text-slate-700 border border-slate-200 hover:border-red-500 hover:text-red-600'
                        }`}
                >
                    <AlertCircle size={16} />
                    Expired ({statusCounts.expired})
                </button>
            </div>

            {/* Search and Filters */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search products by name, brand, or category..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cta outline-none"
                    />
                </div>

                {/* Category Filter */}
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-cta outline-none bg-white"
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>
                            {cat === 'all' ? 'All Categories' : cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Products Grid - Grouped by Category */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cta"></div>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                    <Package size={64} className="mx-auto text-slate-300 mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        {products.length === 0 ? 'No Products Yet' : 'No Products Found'}
                    </h3>
                    <p className="text-slate-500 mb-6">
                        {products.length === 0
                            ? 'Start by adding your first product to your locker'
                            : 'Try adjusting your filters or search terms'}
                    </p>
                    {products.length === 0 && (
                        <button
                            onClick={onAddProduct}
                            className="px-6 py-3 bg-cta text-white rounded-lg font-semibold hover:bg-sky-600 transition-colors"
                        >
                            + Add Your First Product
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-8">
                    {Object.entries(groupedProducts).map(([category, categoryProducts]) => (
                        <div key={category}>
                            <div className="flex items-center gap-3 mb-4">
                                <h2 className="text-xl font-heading font-bold text-primary">{category}</h2>
                                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-sm font-medium">
                                    {categoryProducts.length}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {categoryProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onView={onViewProduct}
                                        onEdit={onEditProduct}
                                        onDelete={onDeleteProduct}
                                        onArchive={onArchiveProduct}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Product FAB */}
            <button
                onClick={onAddProduct}
                className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-tr from-cta to-accent text-white rounded-full shadow-lg hover:shadow-glow transition-all flex items-center justify-center group z-40"
                title="Add Product"
            >
                <span className="text-2xl group-hover:scale-110 transition-transform">+</span>
            </button>
        </div>
    );
};

export default ProductLocker;
