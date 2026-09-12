'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  FileText,
  Calendar,
  Users,
  Clock,
  CheckCircle,
  Eye,
  TrendingUp,
  Edit,
  LayoutDashboard,
  Image,
  User,
  LogOut,
  AlertCircle,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '@/admin-kit/core/auth/AuthProvider';
import { ReportIssueDialog } from '@/features/support/ReportIssueDialog';
import { BookingWidget } from '@/features/booking/BookingWidget';
import { PageContentEditor } from '@/features/content/PageContentEditor';
import { ProfileManager } from '@/features/profile/ProfileManager';
import { EmployeeManager } from '@/features/employees/EmployeeManager';
import { CenikManager } from '@/features/cenik/CenikManager';
import MediaManager from '@/features/media/MediaManager';

interface QuickAction {
  label: string;
  view: any;
  icon: any;
  color: string;
}

interface StatCard {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: any;
  color: string;
}

interface PendingReservation {
  id: number;
  jmeno: string;
  prijmeni: string;
  datum: string;
  casOd: string | null;
  casDo: string | null;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  group: 'main' | 'content' | 'data' | 'user';
}

interface ChartPoint {
  name: string
  date: string
  visitors: number
  pageviews: number
}

// Mapování URL slugů (/admin/<slug>) na záložky dashboardu, aby šlo na ně odkazovat přímo (např. z e-mailu)
const SLUG_TO_TAB: Record<string, string> = {
  rezervace: 'booking',
  obsah: 'content',
  cenik: 'cenik',
  zamestnanci: 'employees',
  media: 'media',
  profil: 'profile',
};

const BOOKING_SUBTAB_TO_TAB: Record<string, 'seznam' | 'kalendar' | 'nastaveni'> = {
  seznam: 'seznam',
  kalendar: 'kalendar',
  nastaveni: 'nastaveni',
};

interface SalonDashboardProps {
  initialSlug?: string[];
}

export function SalonDashboard({ initialSlug = [] }: SalonDashboardProps) {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(() => SLUG_TO_TAB[initialSlug[0] ?? ''] ?? 'overview');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [analyticsConfigured, setAnalyticsConfigured] = useState<boolean | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [totalVisitors, setTotalVisitors] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState<string>('');
  const [pendingReservations, setPendingReservations] = useState<PendingReservation[]>([]);

  // Inicializace a aktualizace času
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formattedTime = now.toLocaleString('cs-CZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(formattedTime);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then((r) => r.json())
      .then((json) => {
        setChartData(json.data ?? []);
        setAnalyticsConfigured(json.configured ?? false);
        if (typeof json.totalVisitors === 'number') {
          setTotalVisitors(json.totalVisitors);
        }
      })
      .catch(() => setAnalyticsConfigured(false))
      .finally(() => setAnalyticsLoading(false));
  }, []);

  // Načtení profilu uživatele
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/admin/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        }
      } catch (error) {
        console.error('Chyba při načítání profilu:', error);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [user]);

  // Načtení nepřevzatých rezervací
  useEffect(() => {
    const fetchPendingReservations = async () => {
      try {
        const response = await fetch('/api/admin/recent-activity');
        if (response.ok) {
          const data = await response.json();
          setPendingReservations(data.pendingReservations ?? []);
        }
      } catch (error) {
        console.error('Chyba při načítání nepřevzatých rezervací:', error);
        setPendingReservations([]);
      }
    };

    fetchPendingReservations();
  }, []);

  const navItems: NavItem[] = [
    { id: 'overview', label: 'Úvodní dashboard', icon: <LayoutDashboard className="h-6 w-6" />, group: 'main' },
    /* ...(user?.jeAdmin ? [{ id: 'content', label: 'Obsah', icon: <FileText className="h-6 w-6" />, group: 'content' as const }] : []), */
    { id: 'booking', label: 'Správa rezervací', icon: <Calendar className="h-6 w-6" />, group: 'content' },
    ...(user?.jeAdmin ? [{ id: 'cenik', label: 'Ceník', icon: <Edit className="h-6 w-6" />, group: 'content' as const }] : []),
    { id: 'employees', label: 'Zaměstnanci', icon: <Users className="h-6 w-6" />, group: 'data' },
    { id: 'media', label: 'Média', icon: <Image className="h-6 w-6" />, group: 'data' },
    ...(user?.jeAdmin ? [{ id: 'content', label: 'Úprava textů', icon: <FileText className="h-6 w-6" />, group: 'content' as const }] : []),
    { id: 'profile', label: 'Profil', icon: <User className="h-6 w-6" />, group: 'user' },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sidebarIsCollapsed = sidebarCollapsed && !sidebarOpen;
  const tabSlugs: Record<string, string> = {
    overview: '/admin',
    booking: '/admin/rezervace/seznam',
    content: '/admin/obsah',
    cenik: '/admin/cenik',
    employees: '/admin/zamestnanci',
    media: '/admin/media',
    profile: '/admin/profil',
  };
  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
    setSidebarOpen(false);
    window.history.pushState(null, '', tabSlugs[tab] ?? '/admin');
  };
  // Mobilní breakpoint
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row items-stretch bg-[#111111]">
      {/* Sidebar - responzivní */}
      {/* Hamburger pro mobil */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-primary text-primary-foreground rounded-full p-2 shadow-lg"
        onClick={() => {
          setSidebarOpen((value) => !value);
          setSidebarCollapsed(false);
        }}
        aria-label={sidebarOpen ? 'Zavřít menu' : 'Otevřít menu'}
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <aside
        className={
          `fixed md:sticky top-0 left-0 h-screen md:h-auto md:min-h-screen md:self-stretch z-40 transition-[transform,width] duration-200 bg-card dark:bg-slate-900 border-b md:border-b-0 md:border-r border-white/10 flex flex-col shrink-0 w-[min(18rem,calc(100vw-1rem))]
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
          ${sidebarIsCollapsed ? 'md:w-20' : 'md:w-64'} overflow-y-auto`
        }
      >
        <div className="flex justify-end p-2 border-b border-border/60 md:block">
          <button
            type="button"
            onClick={() => setSidebarCollapsed((value) => !value)}
            className="hidden md:inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md px-2 text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
            aria-label={sidebarIsCollapsed ? 'Rozbalit sidebar' : 'Skrýt sidebar'}
            >
            {sidebarIsCollapsed ? (
              <>
                <ChevronsRight className="h-4 w-4 shrink-0" />
                <span className="sr-only">Rozbalit sidebar</span>
              </>
            ) : (
              <>
                <ChevronsLeft className="h-4 w-4 shrink-0" />
                <span className="hidden md:inline whitespace-nowrap text-xs font-medium">Skrýt sidebar</span>
              </>
            )}
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-4">
          {/* Main section */}
          {navItems.filter(item => item.group === 'main').map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigateToTab(item.id);
              }}
              className={`w-full flex items-center ${sidebarIsCollapsed ? 'justify-center p-2' : 'gap-3 justify-start px-4 py-2'} text-left rounded-md text-sm font-medium transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-secondary/60 text-foreground'
              }`}
            >
              <span className="shrink-0">
                {item.icon}
              </span>
              {!sidebarIsCollapsed && <span className="truncate">{item.label}</span>}
            </button>
          ))}

          {/* Content section */}
          <div className={`pt-4 mt-4 border-t border-border ${sidebarIsCollapsed ? 'hidden md:block' : ''}`}>
            {!sidebarIsCollapsed && (
              <p className="text-sm font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider hidden md:block">Správa obsahu</p>
            )}
            {navItems.filter(item => item.group === 'content').map(item => (
              <button
                key={item.id}
                onClick={() => {
                  navigateToTab(item.id);
                }}
                className={`w-full flex items-center ${sidebarIsCollapsed ? 'justify-center p-2' : 'gap-3 justify-start px-4 py-2'} text-left rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-secondary/60 text-foreground'
                }`}
              >
                <span className="shrink-0">
                  {item.icon}
                </span>
                {!sidebarIsCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>

          {/* Data section */}
          <div className={`pt-4 mt-4 border-t border-border ${sidebarIsCollapsed ? 'hidden md:block' : ''}`}>
            {!sidebarIsCollapsed && (
              <p className="text-sm font-semibold text-muted-foreground px-4 py-3 uppercase tracking-wider hidden md:block">Správa údajů</p>
            )}
            {navItems.filter(item => item.group === 'data').map(item => (
              <button
                key={item.id}
                onClick={() => {
                  navigateToTab(item.id);
                }}
                className={`w-full flex items-center ${sidebarIsCollapsed ? 'justify-center p-2' : 'gap-3 justify-start px-4 py-2'} text-left rounded-md text-sm font-medium transition-all ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'hover:bg-secondary/60 text-foreground'
                }`}
              >
                <span className="shrink-0">
                  {item.icon}
                </span>
                {!sidebarIsCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* User Profile Section - Bottom of Sidebar */}
        <div className={`p-4 border-t border-white/10 space-y-2 ${sidebarIsCollapsed ? 'flex flex-col items-center' : ''}`}>
          <ReportIssueDialog
            trigger={
              sidebarIsCollapsed ? (
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-md p-0 text-foreground hover:text-foreground">
                  <AlertCircle className="h-5 w-5" />
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="w-full justify-start px-4 text-left gap-2 text-foreground hover:text-foreground text-sm">
                  <AlertCircle className="h-5 w-5" />
                  <span>Hlásit problém</span>
                </Button>
              )
            }
          />

          <button
            onClick={() => {
              navigateToTab('profile');
            }}
            className={`w-full flex items-center ${sidebarIsCollapsed ? 'justify-center p-2' : 'gap-3 justify-start px-4 py-2'} text-left rounded-md text-sm font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-secondary/60 text-foreground shadow-md'
                : 'hover:bg-secondary/60 text-foreground'
            }`}
          >
            <div className="flex items-center gap-3 w-full justify-center md:justify-start">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarImage src={userProfile?.avatar || '/zajac.jpg'} alt={userProfile?.name} />
                <AvatarFallback className="text-sm font-medium">
                  {userProfile?.name?.charAt(0) || user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              {!sidebarIsCollapsed && (
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{userProfile?.name || user?.name || 'Profil'}</p>
                  <p className="text-xs text-muted-foreground truncate">Nastavení</p>
                </div>
              )}
            </div>
          </button>

          <Button
            onClick={logout}
            variant="default"
            size="sm"
            className={`w-full text-sm bg-white hover:bg-red-700/0 ${sidebarIsCollapsed ? 'justify-center px-0' : 'justify-start px-4 text-left'}`}
          >
            <LogOut className="h-5 w-5 md:mr-2" />
            {!sidebarIsCollapsed && <span>Odhlásit se</span>}
          </Button>
        </div>
      </aside>

      {/* Overlay pro zavření sidebaru na mobilu */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="min-w-0 flex-1 p-3 pt-20 sm:p-6 lg:p-8">
        <Tabs value={activeTab} onValueChange={navigateToTab} className="h-full w-full">
            {/* Overview Tab */}
            <TabsContent value="overview" className="p-0 space-y-4 m-0">
          {/* Current Date & Time */}
          <div className="flex min-h-10 flex-col items-stretch justify-between gap-2 rounded-md border border-primary/30 bg-linear-to-r from-primary/20 to-primary/10 pl-14 pr-3 py-2 sm:flex-row sm:items-center sm:px-4">
            <div className="flex min-w-0 items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium leading-none text-foreground sm:text-sm">Aktuální čas</p>
                <p className="truncate text-xs font-semibold capitalize leading-tight text-primary sm:text-sm">{currentTime}</p>
              </div>
            </div>
            <a 
              href="/" 
              className="self-end whitespace-nowrap text-xs font-medium text-white hover:underline sm:ml-2 sm:self-auto sm:text-sm"
              title="Přejít na frontpage"
            >
              Přepnout na hlavní stránku 
            </a>
          </div>

          {/* Návštěvnost a nepřevzaté rezervace */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Website Traffic Chart */}
            <Card className="md:col-span-2 h-96 rounded-md border border-neutral-800">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-sm">Návštěvnost webu za posledních 7 dní (Google Analytics)</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                {analyticsLoading ? (
                  <div className="flex items-center justify-center h-80">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#B8A876]" />
                  </div>
                ) : !analyticsConfigured || chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-80 gap-3 text-center">
                    <Eye className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground max-w-xs">
                      Data nejsou k dispozici. Nastavte tyto proměnné v{' '}
                      <code className="text-xs bg-muted px-1 py-0.5 rounded">.env.local</code>:
                    </p>
                    <ul className="text-xs text-left text-muted-foreground space-y-1">
                      <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_ANALYTICS_PROPERTY_ID</code> - číselné ID GA4 property</li>
                      <li><code className="bg-muted px-1 py-0.5 rounded">GOOGLE_ANALYTICS_CREDENTIALS_BASE64</code> - service account JSON v base64</li>
                    </ul>
                    <a
                      href="https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary underline underline-offset-2"
                    >
                      Povolit Google Analytics Data API →
                    </a>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1e1e2e',
                          border: '1px solid #3f3f5a',
                          borderRadius: '8px',
                          color: '#ffffff',
                        }}
                        labelStyle={{ color: '#a0a0b8', fontWeight: 600, marginBottom: 4 }}
                        itemStyle={{ color: '#ffffff' }}
                        formatter={(value: number, name: string) => [
                          value,
                          name === 'visitors' ? 'Unikátní návštěvníci' : 'Zobrazení stránek',
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="visitors"
                        stroke="#B8A876"
                        strokeWidth={2}
                        name="visitors"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="pageviews"
                        stroke="#8884d8"
                        strokeWidth={2}
                        name="pageviews"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Nepřevzaté rezervace */}
            <Card className="md:col-span-1 rounded-md border border-amber-500/30">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">Nepřevzaté rezervace</CardTitle>
                  <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-semibold text-amber-300">
                    {pendingReservations.length}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-1">
                {pendingReservations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Žádné žádosti ke schválení.</p>
                ) : (
                  <div className="space-y-2">
                    {pendingReservations.map((reservation) => (
                      <div key={reservation.id} className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                        <p className="text-sm font-medium text-foreground">
                          {reservation.jmeno} {reservation.prijmeni}
                        </p>
                        <p className="text-xs text-amber-200/80">
                          {new Date(reservation.datum).toLocaleDateString('cs-CZ')} · {reservation.casOd || '-'}–{reservation.casDo || '-'}
                        </p>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('booking');
                        window.history.replaceState(null, '', '/admin/rezervace/seznam');
                      }}
                      className="pt-1 text-sm font-semibold text-amber-300 transition-colors hover:text-amber-200"
                    >
                      Zobrazit všechny žádosti →
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bug fixes & update notes */}
          <Card className="rounded-md border border-neutral-800 bg-card">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#B8A876]" />
                <CardTitle className="text-sm">Bug fixes &amp; update notes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-1">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#B8A876]">29. 08. 2026</h3>
              <div className="mb-5 grid gap-x-8 gap-y-2 text-sm text-neutral-300 md:grid-cols-2">
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Přidána hromadná změna stavu vybraných rezervací.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Přidán výběr více řádků podržením klávesy Shift.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Opraveno autorizované načítání seznamu rezervací.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Mobilní hamburger menu se nyní otevírá správně rozbalené.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Upravena barva aktivního profilu v postranním menu.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Přidán testovací skript pro e-mailové notifikace rezervací.</span>
                </div>
              </div>

              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#B8A876]">Administrace</h3>
              <div className="grid gap-x-8 gap-y-2 text-sm text-neutral-300 md:grid-cols-2">
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Kalendář má samostatný měsíční, týdenní a denní pohled.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Toolbar kalendáře umožňuje přepínání období i výběr měsíce.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Kliknutí na den v měsíčním pohledu otevře jeho denní detail.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Z denního a týdenního pohledu se lze vrátit zpět na celý měsíc.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Kalendář zobrazuje všechny zaměstnance včetně položky Nepřiřazeno.</span>
                </div>
               
                               <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Časové bloky rezervací mají sjednocený tlumený dark-mode design.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Seznam rezervací zobrazuje aktivní termíny; uplynulé lze filtrovat.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Detail rezervace obsahuje informaci „Pouze telefon“, pokud chybí e-mail.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Celý řádek rezervace je klikací a otevře její náhled.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Potvrzené rezervace se po skončení termínu automaticky označí jako dokončené.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Nepřevzaté rezervace jsou viditelně dostupné přímo na přehledu.</span>
                </div>
              </div>

              <div className="my-5 border-t border-neutral-800/80" />

              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#B8A876]">Online rezervace</h3>
              <div className="grid gap-x-8 gap-y-2 text-sm text-neutral-300 md:grid-cols-2">
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>E-mail klienta je nepovinný, takže rezervaci mohou odeslat i starší klienti bez e-mailu.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Telefon zůstává hlavním kontaktem a je vyžadován pro ověření rezervace.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Pokud klient e-mail nevyplní, zobrazí se doporučení kontaktovat salon telefonicky.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>V detailu rezervace se chybějící e-mail označí jako „Pouze telefon“.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Booking systém je nově více-krokový, takže klient postupně vybírá službu, termín a své údaje. (totožné jako to bylo u předchozí verze webu)</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Online formulář zachovává výběr služby, termínu, zaměstnance a doplňujících údajů.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Odeslaná online rezervace čeká na potvrzení salonem a termín do potvrzení neblokuje.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Údaje bez e-mailu se ukládají korektně i při správě rezervace v administraci.</span>
                </div>
                <div className="flex gap-2">
                  <span className="text-emerald-400">✓</span>
                  <span>Rezervační stránka zůstává responzivní pro mobilní zařízení i větší obrazovky.</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Editor Tab */}
        <TabsContent value="content" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          {!user?.jeAdmin
            ? <div className="flex items-center justify-center h-64 text-muted-foreground">Nemáte oprávnění pro přístup k editoru obsahu.</div>
            : <PageContentEditor />
          }
        </TabsContent>

        {/* Booking System Tab */}
        <TabsContent value="booking" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          <BookingWidget initialTab={BOOKING_SUBTAB_TO_TAB[initialSlug[1] ?? ''] ?? 'seznam'} />
        </TabsContent>

        {/* Employee Management Tab */}
        <TabsContent value="employees" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          <EmployeeManager
            selfOnly={!user?.jeAdmin}
            onOpenReservations={() => navigateToTab('booking')}
          />
        </TabsContent>

        {/* Ceník Management Tab */}
        <TabsContent value="cenik" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          {!user?.jeAdmin
            ? <div className="flex items-center justify-center h-64 text-muted-foreground">Nemáte oprávnění pro přístup ke správě ceníku.</div>
            : <CenikManager />
          }
        </TabsContent>

        {/* Media Management Tab */}
        <TabsContent value="media" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          <MediaManager />
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="p-2 sm:p-4 space-y-2 sm:space-y-4 m-0">
          <ProfileManager />
        </TabsContent>
      </Tabs>
        </div>
      </main>
    </div>
  );
}