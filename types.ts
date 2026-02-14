export enum WarrantyStatus {
  Active = 'Active',
  ExpiringSoon = 'Expiring Soon',
  Expired = 'Expired',
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  modelNumber: string;
  serialNumber?: string;
  category: string;
  purchaseDate: string;
  warrantyDurationMonths: number;
  price?: number;
  imageUrl?: string;
  receiptUrl?: string;
  notes?: string;
}

export interface ServiceCenter {
  id: string;
  name: string;
  address: string;
  phone: string;
  distanceKm?: number;
  rating: number;
  lat: number;
  lng: number;
  hours: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  date: string;
  type: 'info' | 'warning' | 'urgent';
  read: boolean;
}

export interface OcrResult {
  productName?: string;
  brand?: string;
  modelNumber?: string;
  purchaseDate?: string;
  warrantyDuration?: number;
}
