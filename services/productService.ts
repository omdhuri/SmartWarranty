import { supabase, DEMO_USER_ID } from './supabase';
import { Product } from '../types';

/**
 * Product Service
 * Handles all product CRUD operations with Supabase
 * Following UI.md guidelines: Performance-first, error handling, loading states
 */

export interface ProductFilters {
    search?: string;
    category?: string;
    status?: 'active' | 'expiring' | 'expired' | 'all';
}

/**
 * Fetch all products for the current user
 * Returns empty array on error for graceful degradation
 */
// ... imports

export async function getProducts(filters?: ProductFilters): Promise<Product[]> {
    try {
        let query = supabase
            .from('products')
            .select('*')
            .eq('owner_id', DEMO_USER_ID)
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        // Apply search filter
        if (filters?.search) {
            query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%,model_number.ilike.%${filters.search}%`);
        }

        // Apply category filter
        if (filters?.category && filters.category !== 'all') {
            query = query.eq('category', filters.category);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching products:', error);
            throw error; // Throw to let UI handle it
        }

        // Transform database format to app format
        return (data || []).map(transformDbProductToApp);
    } catch (error) {
        console.error('Unexpected error fetching products:', error);
        throw error;
    }
}

/**
 * Create a new product
 */
export async function createProduct(product: Partial<Product>): Promise<Product | null> {
    try {
        // Calculate warranty end date
        const warrantyEndDate = new Date(product.purchaseDate!);
        warrantyEndDate.setMonth(warrantyEndDate.getMonth() + product.warrantyDurationMonths!);

        const dbProduct = {
            owner_id: DEMO_USER_ID,
            name: product.name,
            brand: product.brand,
            category: product.category,
            model_number: product.modelNumber,
            serial_number: product.serialNumber,
            purchase_date: product.purchaseDate,
            purchase_price: product.price,
            retailer: product.retailer,
            warranty_duration_months: product.warrantyDurationMonths,
            warranty_start_date: product.purchaseDate,
            warranty_end_date: warrantyEndDate.toISOString().split('T')[0],
            receipt_url: product.receiptUrl,
            product_image_url: product.imageUrl,
            notes: product.notes,
            tags: product.tags || [],
        };

        const { data, error } = await supabase
            .from('products')
            .insert(dbProduct)
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            return null;
        }

        return transformDbProductToApp(data);
    } catch (error) {
        console.error('Unexpected error creating product:', error);
        return null;
    }
}

/**
 * Update an existing product
 */
export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    try {
        const dbUpdates: any = {};

        if (updates.name) dbUpdates.name = updates.name;
        if (updates.brand) dbUpdates.brand = updates.brand;
        if (updates.category) dbUpdates.category = updates.category;
        if (updates.modelNumber) dbUpdates.model_number = updates.modelNumber;
        if (updates.notes) dbUpdates.notes = updates.notes;
        if (updates.price) dbUpdates.purchase_price = updates.price;

        dbUpdates.updated_at = new Date().toISOString();

        const { data, error } = await supabase
            .from('products')
            .update(dbUpdates)
            .eq('id', id)
            .eq('owner_id', DEMO_USER_ID)
            .select()
            .single();

        if (error) {
            console.error('Error updating product:', error);
            return null;
        }

        return transformDbProductToApp(data);
    } catch (error) {
        console.error('Unexpected error updating product:', error);
        return null;
    }
}

/**
 * Delete a product (soft delete by archiving)
 */
export async function deleteProduct(id: string): Promise<boolean> {
    try {
        const { error } = await supabase
            .from('products')
            .update({ is_archived: true, updated_at: new Date().toISOString() })
            .eq('id', id)
            .eq('owner_id', DEMO_USER_ID);

        if (error) {
            console.error('Error deleting product:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Unexpected error deleting product:', error);
        return false;
    }
}

/**
 * Upload product image to Supabase Storage
 */
export async function uploadProductImage(file: File): Promise<string | null> {
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${DEMO_USER_ID}/${Date.now()}.${fileExt}`;

        const { data, error } = await supabase.storage
            .from('product-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false,
            });

        if (error) {
            console.error('Error uploading image:', error);
            return null;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('product-images')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error('Unexpected error uploading image:', error);
        return null;
    }
}

/**
 * Transform database product format to app format
 */
function transformDbProductToApp(dbProduct: any): Product {
    return {
        id: dbProduct.id,
        owner_id: dbProduct.owner_id,
        name: dbProduct.name,
        brand: dbProduct.brand,
        modelNumber: dbProduct.model_number,
        serialNumber: dbProduct.serial_number,
        category: dbProduct.category,
        purchaseDate: dbProduct.purchase_date,
        warrantyDurationMonths: dbProduct.warranty_duration_months,
        warranty_start_date: dbProduct.warranty_start_date,
        warranty_end_date: dbProduct.warranty_end_date,
        price: dbProduct.purchase_price,
        retailer: dbProduct.retailer,
        imageUrl: dbProduct.product_image_url,
        product_image_url: dbProduct.product_image_url,
        receiptUrl: dbProduct.receipt_url,
        receipt_url: dbProduct.receipt_url,
        warranty_card_url: dbProduct.warranty_card_url,
        notes: dbProduct.notes,
        tags: dbProduct.tags,
        is_archived: dbProduct.is_archived,
        created_at: dbProduct.created_at,
        updated_at: dbProduct.updated_at,
    };
}
