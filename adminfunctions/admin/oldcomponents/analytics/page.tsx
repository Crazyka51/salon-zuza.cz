'use client';

import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import AnalyticsManager from '../components/AnalyticsManager';

export default function AnalyticsPage() {
  const [currentSection, setCurrentSection] = useState('analytics');

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/';
  };

  return (
    <AdminLayout 
      currentSection={currentSection}
      onSectionChange={setCurrentSection}
      onLogout={handleLogout}
    >
      <AnalyticsManager />
    </AdminLayout>
  );
}
