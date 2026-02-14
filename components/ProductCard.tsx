import React, { useState, useRef, useEffect } from 'react';
import { Product, getWarrantyStatus } from '../types';
import { Calendar, AlertTriangle, CheckCircle, Clock, MoreVertical, Pencil, Archive, Trash2 } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onClick: (product: Product) => void;
  onEdit?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onArchive?: (product: Product) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onClick, onEdit, onDelete, onArchive }) => {
  const { status, daysRemaining, color, bgColor } = getWarrantyStatus(product);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  // Icon selection based on status
  let Icon = CheckCircle;
  if (status === 'Expired') Icon = AlertTriangle;
  if (status === 'Expiring Soon') Icon = Clock;

  // Get warranty end date for display
  const endDate = product.warranty_end_date
    ? new Date(product.warranty_end_date)
    : new Date(new Date(product.purchaseDate).setMonth(new Date(product.purchaseDate).getMonth() + product.warrantyDurationMonths));

  return (
    <div
      onClick={() => onClick(product)}
      className="bg-white rounded-xl shadow-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer group border border-slate-100 relative"
    >
      {/* Image Section - UI.md: Image zoom on hover */}
      <div className="h-40 overflow-hidden bg-slate-100 relative">
        <img
          src={product.imageUrl || product.product_image_url || 'https://picsum.photos/400/300?grayscale'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/400/300?grayscale' }}
        />
        <div className="absolute top-2 right-2" ref={dropdownRef}>
          <button
            className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-slate-600 transition-all duration-150 hover:shadow-md focus:ring-2 focus:ring-cta outline-none"
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            aria-label="More options"
          >
            <MoreVertical size={16} />
          </button>

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-10 animate-in fade-in duration-200">
              {onEdit && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onEdit(product);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Pencil size={14} />
                  Edit
                </button>
              )}
              {onArchive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onArchive(product);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors"
                >
                  <Archive size={14} />
                  Archive
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(false);
                    onDelete(product);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">{product.brand}</p>
            <h3 className="font-heading font-semibold text-lg text-primary leading-tight line-clamp-1">{product.name}</h3>
          </div>
        </div>

        {/* Status Badge with dynamic colors - UI.md: Semantic color tokens */}
        <div
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border mb-4"
          style={{
            backgroundColor: bgColor,
            borderColor: color + '40',  // 25% opacity
            color: color
          }}
        >
          <Icon size={12} className="mr-1.5" />
          {status} {daysRemaining > 0 && `(${daysRemaining} days)`}
        </div>

        {/* Footer - UI.md: Clear information hierarchy */}
        <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center">
            <Calendar size={14} className="mr-1.5 text-slate-400" />
            <span>Expires {endDate.toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Glow effect on hover bottom border - UI.md: Border beam effect */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cta to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </div>
  );
};

export default ProductCard;
