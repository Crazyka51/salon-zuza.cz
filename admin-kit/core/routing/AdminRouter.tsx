'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type AdminView = 
  | 'dashboard'
  | 'content'
  | 'editor-obsahu'
  | 'analytics'
  | 'statistiky'
  | 'settings';

interface AdminRouterContextType {
  currentView: AdminView;
  viewData?: any;
  navigate: (view: AdminView, data?: any) => void;
  goBack: () => void;
  history: Array<{ view: AdminView; data?: any }>;
}

const AdminRouterContext = createContext<AdminRouterContextType | undefined>(undefined);

export function AdminRouterProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Array<{ view: AdminView; data?: any }>>([
    { view: 'dashboard' }
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = (view: AdminView, data?: any) => {
    const newEntry = { view, data };
    const newHistory = [...history.slice(0, currentIndex + 1), newEntry];
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const goBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const current = history[currentIndex];

  return (
    <AdminRouterContext.Provider
      value={{
        currentView: current.view,
        viewData: current.data,
        navigate,
        goBack,
        history,
      }}
    >
      {children}
    </AdminRouterContext.Provider>
  );
}

export function useAdminRouter() {
  const context = useContext(AdminRouterContext);
  if (!context) {
    throw new Error('useAdminRouter must be used within AdminRouterProvider');
  }
  return context;
}
