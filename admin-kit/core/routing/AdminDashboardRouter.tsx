'use client';

import { useAdminRouter } from '../routing/AdminRouter';
import { SalonDashboard } from '../../ui/Dashboard/SalonDashboard';
import { AnalyticsWidget } from '@/features/analytics/AnalyticsWidget';

interface AdminDashboardRouterProps {
  slug?: string[];
}

export function AdminDashboardRouter({ slug = [] }: AdminDashboardRouterProps) {
  const { currentView, viewData, navigate } = useAdminRouter();

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
      default:
        return <SalonDashboard initialSlug={slug} />;

      case 'analytics':
      case 'statistiky':
        return (
          <div className="container mx-auto py-8">
            <AnalyticsWidget />
          </div>
        );
    }
  };

  return <div className="flex-1 overflow-auto">{renderView()}</div>;
}
