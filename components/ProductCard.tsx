import React from 'react';
import { Product, WarrantyStatus } from '../types';
import { Calendar, AlertTriangle, CheckCircle, Clock, MoreVertical } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick }) => {
  const calculateDaysRemaining = (purchaseDate: string, durationMonths: number) => {
    const start = new Date(purchaseDate);
    const end = new Date(start.setMonth(start.getMonth() + durationMonths));
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = calculateDaysRemaining(product.purchaseDate, product.warrantyDurationMonths);
  
  let status = WarrantyStatus.Active;
  let statusColor = 'text-success bg-green-100 border-green-200';
  let Icon = CheckCircle;

  if (daysRemaining < 0) {
    status = WarrantyStatus.Expired;
    statusColor = 'text-slate-500 bg-slate-100 border-slate-200';
    Icon = AlertTriangle;
  } else if (daysRemaining < 30) {
    status = WarrantyStatus.ExpiringSoon;
    statusColor = 'text-warning bg-amber-50 border-amber-200';
    Icon = Clock;
  }

  return (
    <div 
      onClick={() => onClick(product)}
      className="bg-white rounded-xl shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group border border-slate-100 relative"
    >
      <div className="h-40 overflow-hidden bg-slate-100 relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale' }}
        />
        <div className="absolute top-2 right-2">
           <button className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-slate-600">
             <MoreVertical size={16} />
           </button>
        </div>
      </div>
      
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">{product.brand}</p>
            <h3 className="font-heading font-semibold text-lg text-primary leading-tight line-clamp-1">{product.name}</h3>
          </div>
        </div>

        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColor} mb-4`}>
          <Icon size={12} className="mr-1.5" />
          {status} {daysRemaining > 0 && `(${daysRemaining} days)`}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
            <div className="flex items-center">
                <Calendar size={14} className="mr-1.5 text-slate-400" />
                <span>Expires {new Date(new Date(product.purchaseDate).setMonth(new Date(product.purchaseDate).getMonth() + product.warrantyDurationMonths)).toLocaleDateString()}</span>
            </div>
        </div>
      </div>
      
      {/* Glow effect on hover bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cta to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default ProductCard;
