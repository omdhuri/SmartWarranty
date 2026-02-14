import { supabase, DEMO_USER_ID } from './supabase';
import { NotificationItem } from '../types';

export const getNotifications = async (): Promise<NotificationItem[]> => {
    try {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', DEMO_USER_ID)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return [];
    }
};

export const markAsRead = async (id: string): Promise<void> => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', id);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking notification as read:', error);
    }
};

export const markAllAsRead = async (): Promise<void> => {
    try {
        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', DEMO_USER_ID);

        if (error) throw error;
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
    }
};

export const createNotification = async (
    title: string,
    message: string,
    type: 'info' | 'warning' | 'success' | 'error' = 'info'
): Promise<NotificationItem | null> => {
    try {
        const newNotification = {
            user_id: DEMO_USER_ID,
            title,
            message,
            type,
            is_read: false,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('notifications')
            .insert(newNotification)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
};
