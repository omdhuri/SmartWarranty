import React from 'react';
import { Product, getWarrantyStatus } from '../types';
import { X, Calendar, Tag, DollarSign, FileText, Pencil, Archive, Trash2, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface ProductDetailModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onArchive: (product: Product) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
    product,
    isOpen,
    onClose,
    onEdit,
    onDelete,
    onArchive
}) => {
    if (!isOpen) return null;

    const { status, daysRemaining, color, bgColor } = getWarrantyStatus(product);

    // Calculate warranty progress percentage
    const totalDays = product.warrantyDurationMonths * 30; // Approximate
    const elapsedDays = totalDays - daysRemaining;
    const progressPercentage = Math.max(0, Math.min(100, (elapsedDays / totalDays) * 100));

    // Get warranty end date
    const endDate = product.warranty_end_date
        ? new Date(product.warranty_end_date)
        : new Date(new Date(product.purchaseDate).setMonth(new Date(product.purchaseDate).getMonth() + product.warrantyDurationMonths));

    // Icon selection based on status
    let StatusIcon = CheckCircle;
    if (status === 'Expired') StatusIcon = AlertCircle;
    if (status === 'Expiring Soon') StatusIcon = Clock;

    return (
        <div className="fixed inset-0 z-[70] flex justify-end">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Panel */}
            <div className="relative w-full max-w-lg bg-white shadow-2xl animate-in slide-in-from-right duration-300 overflow-y-auto">
                <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-100 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-heading font-semibold text-primary">Product Details</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Product Image */}
                    <div className="relative group">
                        <div className="aspect-video rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                            <img
                                src={product.imageUrl || product.product_image_url || 'https://picsum.photos/800/600?grayscale'}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://picsum.photos/800/600?grayscale' }}
                            />
                        </div>
                    </div>

                    {/* Product Info Header */}
                    <div>
                        <p className="text-xs font-semibold text-accent uppercase tracking-wider mb-1">{product.brand}</p>
                        <h3 className="text-2xl font-heading font-bold text-primary mb-1">{product.name}</h3>
                        <p className="text-sm text-slate-500">{product.category}</p>
                    </div>

                    {/* Warranty Status Section */}
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <StatusIcon size={18} style={{ color }} />
                                <span className="font-semibold text-slate-800">Warranty Status</span>
                            </div>
                            <span
                                className="px-2.5 py-1 rounded-full text-xs font-medium border"
                                style={{
                                    backgroundColor: bgColor,
                                    borderColor: color + '40',
                                    color: color
                                }}
                            >
                                {status}
                            </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-2">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-500 rounded-full"
                                    style={{
                                        width: `${progressPercentage}%`,
                                        backgroundColor: color
                                    }}
                                />
                            </div>
                        </div>

                        <div className="flex justify-between text-xs text-slate-600">
                            <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Expired'}</span>
                            <span>{product.warrantyDurationMonths} months total</span>
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Calendar size={14} />
                                <span className="text-xs font-medium">Purchase Date</span>
                            </div>
                            <p className="font-semibold text-slate-800">
                                {new Date(product.purchaseDate).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Calendar size={14} />
                                <span className="text-xs font-medium">Expires On</span>
                            </div>
                            <p className="font-semibold text-slate-800">
                                {endDate.toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <DollarSign size={14} />
                                <span className="text-xs font-medium">Price</span>
                            </div>
                            <p className="font-semibold text-slate-800">
                                {product.price !== undefined && product.price !== null
                                    ? `₹${product.price.toLocaleString('en-IN')}`
                                    : 'N/A'}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Tag size={14} />
                                <span className="text-xs font-medium">Model Number</span>
                            </div>
                            <p className="font-semibold text-slate-800 truncate">
                                {product.modelNumber || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Notes Section */}
                    {product.notes && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-amber-800 mb-2">
                                <FileText size={16} />
                                <span className="text-sm font-semibold">Notes</span>
                            </div>
                            <p className="text-sm text-amber-900">{product.notes}</p>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200">
                        <button
                            onClick={() => {
                                onEdit(product);
                                onClose();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-cta hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                        >
                            <Pencil size={16} />
                            <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                            onClick={() => {
                                onArchive(product);
                                onClose();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors"
                        >
                            <Archive size={16} />
                            <span className="hidden sm:inline">Archive</span>
                        </button>
                        <button
                            onClick={() => {
                                onDelete(product);
                                onClose();
                            }}
                            className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-medium transition-colors"
                        >
                            <Trash2 size={16} />
                            <span className="hidden sm:inline">Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailModal;
