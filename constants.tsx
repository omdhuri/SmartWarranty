import { Product, ServiceCenter, NotificationItem } from './types';
import React from 'react';
import { Smartphone, Monitor, Briefcase, Zap, Home } from 'lucide-react';

export const CATEGORIES = [
  { id: 'electronics', name: 'Electronics', icon: <Smartphone size={18} /> },
  { id: 'appliances', name: 'Appliances', icon: <Home size={18} /> },
  { id: 'furniture', name: 'Furniture', icon: <Briefcase size={18} /> },
  { id: 'computers', name: 'Computers', icon: <Monitor size={18} /> },
  { id: 'other', name: 'Other', icon: <Zap size={18} /> },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'UltraWide Monitor 34"',
    brand: 'LG',
    modelNumber: '34WN80C-B',
    category: 'computers',
    purchaseDate: '2023-06-15',
    warrantyDurationMonths: 36,
    price: 549.99,
    imageUrl: 'https://picsum.photos/400/300?random=1',
  },
  {
    id: '2',
    name: 'Smart Refrigerator',
    brand: 'Samsung',
    modelNumber: 'RF28R7201SR',
    category: 'appliances',
    purchaseDate: '2022-01-10',
    warrantyDurationMonths: 24,
    price: 2199.00,
    imageUrl: 'https://picsum.photos/400/300?random=2',
  },
  {
    id: '3',
    name: 'Noise Cancelling Headphones',
    brand: 'Sony',
    modelNumber: 'WH-1000XM5',
    category: 'electronics',
    purchaseDate: '2023-11-20',
    warrantyDurationMonths: 12,
    price: 348.00,
    imageUrl: 'https://picsum.photos/400/300?random=3',
  }
];

export const MOCK_SERVICE_CENTERS: ServiceCenter[] = [
  {
    id: 'sc1',
    name: 'TechFix Authorized Center',
    address: '123 Tech Park, Innovation Blvd',
    phone: '+1 (555) 123-4567',
    rating: 4.8,
    lat: 34.0522,
    lng: -118.2437,
    hours: 'Mon-Sat: 09:00 - 18:00',
    distanceKm: 2.4
  },
  {
    id: 'sc2',
    name: 'Global Appliance Repair',
    address: '456 Market St, Downtown',
    phone: '+1 (555) 987-6543',
    rating: 4.2,
    lat: 34.0407,
    lng: -118.2468,
    hours: 'Mon-Fri: 08:00 - 17:00',
    distanceKm: 5.1
  },
  {
    id: 'sc3',
    name: 'QuickServe Electronics',
    address: '789 Suburban Ave, Westside',
    phone: '+1 (555) 456-7890',
    rating: 3.9,
    lat: 34.0630,
    lng: -118.3600,
    hours: 'Daily: 10:00 - 20:00',
    distanceKm: 8.7
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n1',
    title: 'Samsung Refrigerator Warranty Expiring',
    message: 'Your warranty for Samsung Refrigerator expires in 7 days. Check coverage options.',
    date: new Date().toISOString(),
    type: 'warning',
    read: false,
  },
  {
    id: 'n2',
    title: 'Welcome to SmartWarranty',
    message: 'You have successfully set up your digital locker.',
    date: new Date(Date.now() - 86400000).toISOString(),
    type: 'info',
    read: true,
  }
];
