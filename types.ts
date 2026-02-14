export enum WarrantyStatus {
  Active = 'Active',
  ExpiringSoon = 'Expiring Soon',
  Expired = 'Expired',
}

// Database-aligned Product type
export interface Product {
  id: string;
  owner_id?: string;
  name: string;
  brand: string;
  modelNumber: string;
  serialNumber?: string;
  category: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  warranty_start_date?: string;
  warranty_end_date?: string;
  price?: number;
  retailer?: string;
  imageUrl?: string;
  product_image_url?: string;
  receiptUrl?: string;
  receipt_url?: string;
  warranty_card_url?: string;
  notes?: string;
  tags?: string[];
  is_archived?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceCenter {
  id: string;
  manufacturer?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  distanceKm?: number;
  rating: number;
  latitude: number;
  longitude: number;
  lat: number;
  lng: number;
  operating_hours?: any;
  hours: string;
  services_offered?: string[];
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  is_read: boolean;
  created_at: string;
}

export interface OcrResult {
  productName?: string;
  brand?: string;
  modelNumber?: string;
  purchaseDate?: string;
  warrantyDuration?: number;
}

// Utility functions
export function calculateWarrantyEndDate(purchaseDate: string, durationMonths: number): Date {
  const date = new Date(purchaseDate);
  date.setMonth(date.getMonth() + durationMonths);
  return date;
}

export function getWarrantyStatus(product: Product): {
  status: WarrantyStatus;
  daysRemaining: number;
  color: string;
  bgColor: string;
} {
  const endDate = product.warranty_end_date
    ? new Date(product.warranty_end_date)
    : calculateWarrantyEndDate(product.purchaseDate, product.warrantyDurationMonths);

  const today = new Date();
  const daysRemaining = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return {
      status: WarrantyStatus.Expired,
      daysRemaining: 0,
      color: '#EF4444',
      bgColor: '#FEE2E2'
    };
  }
  if (daysRemaining <= 30) {
    return {
      status: WarrantyStatus.ExpiringSoon,
      daysRemaining,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    };
  }
  return {
    status: WarrantyStatus.Active,
    daysRemaining,
    color: '#10B981',
    bgColor: '#D1FAE5'
  };
}

