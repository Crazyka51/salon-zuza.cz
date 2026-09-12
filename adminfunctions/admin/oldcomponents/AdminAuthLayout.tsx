'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
// Pokud usePathname není dostupný v next/navigation, můžeme použít vlastní implementaci
// a vytvořit náhradu za tuto funkci

function useOurPathname(): string {
  // Pokud jsme v prohlížeči, můžeme použít window.location.pathname
  if (typeof window !== 'undefined') {
    return window.location.pathname;
  }
  // Fallback pro SSR
  return '';
}
import { useAuth } from '@/lib/auth-context';

// Jednoduchá LoadingScreen komponenta přímo v souboru, abychom nemuseli řešit import
function LoadingScreen() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-xl font-medium text-gray-700">Načítání...</p>
      </div>
    </div>
  );
}

interface AdminAuthLayoutProps {
  children: React.ReactNode;
}

export default function AdminAuthLayout({ children }: AdminAuthLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = useOurPathname();

  useEffect(() => {
    // Zjištění, zda jsme na přihlašovací stránce
    const isLoginPage = pathname === '/admin/login';

    // Pokud stránka stále načítá, nic neděláme
    if (isLoading) return;

    // Pokud nejsme přihlášeni a nejsme na přihlašovací stránce, přesměrujeme na přihlášení
    if (!isAuthenticated && !isLoginPage) {
      // Použijeme push místo redirect, abychom nezpůsobili nekonečnou smyčku
      router.push('/admin/login');
    }

    // Pokud jsme přihlášeni a jsme na přihlašovací stránce, přesměrujeme na dashboard
    // POUZE pokud neobsahuje force parametr, který explicitně umožní zůstat na login stránce
    if (isAuthenticated && isLoginPage && !window.location.search.includes('force')) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  // Pokud stránka stále načítá autentizaci, zobrazíme načítací obrazovku
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Na přihlašovací stránce nebo když jsme přihlášeni, zobrazíme obsah
  return <>{children}</>;
}
