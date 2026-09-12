'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users,
  Eye,
  MousePointer,
  Clock,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
} from 'lucide-react';

interface AnalyticsOverview {
  users: number;
  sessions: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  usersChange: number;
  sessionsChange: number;
  pageviewsChange: number;
}

interface TopPage {
  path: string;
  views: number;
  change: number;
}

interface DeviceStats {
  category: string;
  users: number;
  percentage: number;
}

export function AnalyticsWidget() {
  const [timeRange, setTimeRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);
  const [overview, setOverview] = useState<AnalyticsOverview>({
    users: 1247,
    sessions: 1856,
    pageviews: 4321,
    bounceRate: 42.3,
    avgSessionDuration: 185,
    usersChange: 12.5,
    sessionsChange: 8.7,
    pageviewsChange: 15.2,
  });
  const [topPages, setTopPages] = useState<TopPage[]>([
    { path: '/', views: 1234, change: 5.2 },
    { path: '/articles/next-js-guide', views: 876, change: 12.3 },
    { path: '/about', views: 543, change: -3.1 },
    { path: '/contact', views: 321, change: 8.9 },
  ]);
  const [devices, setDevices] = useState<DeviceStats[]>([
    { category: 'Desktop', users: 685, percentage: 55.0 },
    { category: 'Mobile', users: 436, percentage: 35.0 },
    { category: 'Tablet', users: 126, percentage: 10.0 },
  ]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-emerald-600 dark:text-emerald-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-muted-foreground';
  };

  const getDeviceIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'desktop':
        return Monitor;
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const refreshData = async () => {
    setIsLoading(true);
    // Simulace načítání dat
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Analytika</h2>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Posledních 7 dní</SelectItem>
              <SelectItem value="30d">Posledních 30 dní</SelectItem>
              <SelectItem value="90d">Posledních 90 dní</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="icon"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uživatelé</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.users.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {overview.usersChange > 0 ? (
                <TrendingUp className={`mr-1 h-3 w-3 ${getChangeColor(overview.usersChange)}`} />
              ) : (
                <TrendingDown className={`mr-1 h-3 w-3 ${getChangeColor(overview.usersChange)}`} />
              )}
              <span className={getChangeColor(overview.usersChange)}>
                {Math.abs(overview.usersChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs. předchozí období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Relace</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.sessions.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {overview.sessionsChange > 0 ? (
                <TrendingUp className={`mr-1 h-3 w-3 ${getChangeColor(overview.sessionsChange)}`} />
              ) : (
                <TrendingDown className={`mr-1 h-3 w-3 ${getChangeColor(overview.sessionsChange)}`} />
              )}
              <span className={getChangeColor(overview.sessionsChange)}>
                {Math.abs(overview.sessionsChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs. předchozí období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zhlédnutí</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.pageviews.toLocaleString()}</div>
            <div className="flex items-center text-xs">
              {overview.pageviewsChange > 0 ? (
                <TrendingUp className={`mr-1 h-3 w-3 ${getChangeColor(overview.pageviewsChange)}`} />
              ) : (
                <TrendingDown className={`mr-1 h-3 w-3 ${getChangeColor(overview.pageviewsChange)}`} />
              )}
              <span className={getChangeColor(overview.pageviewsChange)}>
                {Math.abs(overview.pageviewsChange).toFixed(1)}%
              </span>
              <span className="text-muted-foreground ml-1">vs. předchozí období</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Průměrná doba</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(overview.avgSessionDuration)}</div>
            <div className="text-xs text-muted-foreground">
              Bounce rate: {overview.bounceRate.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Nejnavštěvovanější stránky</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPages.map((page, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium truncate">{page.path}</p>
                    <p className="text-sm text-muted-foreground">
                      {page.views.toLocaleString()} zhlédnutí
                    </p>
                  </div>
                  <Badge variant={page.change > 0 ? 'default' : 'secondary'}>
                    {page.change > 0 ? '+' : ''}{page.change.toFixed(1)}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Devices */}
        <Card>
          <CardHeader>
            <CardTitle>Zařízení</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices.map((device, index) => {
                const Icon = getDeviceIcon(device.category);
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{device.category}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {device.users.toLocaleString()} ({device.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${device.percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
