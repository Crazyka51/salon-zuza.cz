'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message?: string
  duration?: number
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'primary' | 'secondary'
  }>
}

interface NotificationSystemProps {
  notifications: Notification[]
  onRemove: (id: string) => void
}

export default function NotificationSystem({ notifications, onRemove }: NotificationSystemProps) {
  useEffect(() => {
    notifications.forEach(notification => {
      if (notification.duration && notification.duration > 0) {
        const timer = setTimeout(() => {
          onRemove(notification.id);
        }, notification.duration);

        return () => clearTimeout(timer);
      }
    });
  }, [notifications, onRemove]);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500 dark:text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
    }
  };

  const getStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-600 text-green-900 dark:text-green-300';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-600 text-red-900 dark:text-red-300';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-600 text-yellow-900 dark:text-yellow-300';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-600 text-blue-900 dark:text-blue-300';
    }
  };

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`border rounded-lg shadow-lg p-4 transition-all duration-300 ${getStyles(notification.type)}`}
        >
          <div className="flex items-start">
            <div className="shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="ml-3 flex-1">
              <h4 className="text-sm font-medium">
                {notification.title}
              </h4>
              
              {notification.message && (
                <p className="text-sm mt-1 opacity-90">
                  {notification.message}
                </p>
              )}
              
              {notification.actions && notification.actions.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {notification.actions.map((action, index) => (
                    <button
                      key={index}
                      onClick={action.onClick}
                      className={`text-xs px-3 py-1 rounded-md font-medium transition-colors ${
                        action.variant === 'primary'
                          ? 'bg-white dark:bg-gray-700 bg-opacity-20 dark:bg-opacity-30 hover:bg-opacity-30 dark:hover:bg-opacity-40 text-current'
                          : 'text-current opacity-75 dark:opacity-70 hover:opacity-100 dark:hover:opacity-100'
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={() => onRemove(notification.id)}
              className="shrink-0 ml-2 text-current opacity-50 dark:opacity-60 hover:opacity-100 dark:hover:opacity-100 transition-opacity"
              title="Zavřít notifikaci"
              aria-label="Zavřít notifikaci"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Hook pro snadné používání notifikací
export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [...prev, { ...notification, id }]);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  // Předpřipravené metody pro různé typy notifikací
  const notify = {
    success: (title: string, message?: string, duration = 5000) => 
      addNotification({ type: 'success', title, message, duration }),
    
    error: (title: string, message?: string, duration = 0) => 
      addNotification({ type: 'error', title, message, duration }),
    
    warning: (title: string, message?: string, duration = 7000) => 
      addNotification({ type: 'warning', title, message, duration }),
    
    info: (title: string, message?: string, duration = 5000) => 
      addNotification({ type: 'info', title, message, duration }),
  };

  return {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    notify
  };
}
