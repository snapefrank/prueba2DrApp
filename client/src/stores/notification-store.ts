import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO date string
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  
  // Acciones
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (notification) => {
        const newNotification: Notification = {
          id: crypto.randomUUID(),
          ...notification,
          read: false,
          createdAt: new Date().toISOString()
        };
        
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1
        }));
      },
      
      markAsRead: (id) => {
        set((state) => {
          const notifications = state.notifications.map((notif) => 
            notif.id === id ? { ...notif, read: true } : notif
          );
          
          const unreadCount = notifications.filter(n => !n.read).length;
          
          return { notifications, unreadCount };
        });
      },
      
      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map(notif => ({ ...notif, read: true })),
          unreadCount: 0
        }));
      },
      
      removeNotification: (id) => {
        set((state) => {
          const notification = state.notifications.find(n => n.id === id);
          const unreadCount = notification && !notification.read 
            ? state.unreadCount - 1 
            : state.unreadCount;
            
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount
          };
        });
      },
      
      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      }
    }),
    {
      name: 'mediconnect-notifications', // Nombre para localStorage
    }
  )
);