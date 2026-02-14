import React, { useState } from 'react';
import { Product } from '../types';
import ProductCard from './ProductCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Search, Filter, Plus } from 'lucide-react';

interface DashboardProps {
  products: Product[];
  onAddProduct: () => void;
  onViewProduct: (product: Product) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ products, onAddProduct, onViewProduct }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Analytics Data
  const activeCount = products.filter(p => new Date(p.purchaseDate).getTime() + p.warrantyDurationMonths * 30 * 24 * 60 * 60 * 1000 > Date.now()).length;
  const expiredCount = products.length - activeCount;
  
  const chartData = [
    { name: 'Active', value: activeCount, color: '#10B981' },
    { name: 'Expired', value: expiredCount, color: '#EF4444' },
  ];

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Top Section: Welcome & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-gradient-to-br from-primary to-slate-900 rounded-2xl p-8 text-white shadow-xl relative overflow-hidden">
           <div className="relative z-10">
               <h1 className="text-3xl font-heading font-bold mb-2">Welcome Back, Alex</h1>
               <p className="text-slate-300 mb-6 max-w-md">Your digital locker is secure. You have {activeCount} active warranties protecting your assets.</p>
               <button 
                 onClick={onAddProduct}
                 className="bg-cta hover:bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-sky-900/20 transition-all hover:scale-105 flex items-center"
               >
                 <Plus size={20} className="mr-2" />
                 Add New Product
               </button>
           </div>
           {/* Abstract BG Shapes */}
           <div className="absolute right-0 top-0 w-64 h-64 bg-accent/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
           <div className="absolute right-20 bottom-0 w-40 h-40 bg-cta/20 rounded-full blur-2xl transform translate-y-1/2"></div>
        </div>

        {/* Mini Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-100 flex flex-col justify-between">
            <h3 className="font-heading font-semibold text-primary">Warranty Status</h3>
            <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
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
            </div>
            <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-success mr-2"></div>Active</div>
                <div className="flex items-center"><div className="w-2 h-2 rounded-full bg-error mr-2"></div>Expired</div>
            </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-heading font-bold text-primary self-start sm:self-center">Your Products</h2>
        <div className="flex space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search products..." 
                    className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-cta focus:border-cta outline-none text-sm transition-shadow"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <button className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600">
                <Filter size={20} />
            </button>
        </div>
      </div>

      {/* Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} onClick={onViewProduct} />
            ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="bg-slate-50 p-4 rounded-full inline-block mb-4">
                <Search size={32} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">No products found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
