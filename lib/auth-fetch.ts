/**
 * Utility pro autorizované API volání
 * Automaticky přidává JWT token z cookies do requests
 */

import { cookies } from 'next/headers';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Provádí autorizovaný fetch request s JWT tokenem z cookies
 */
export async function authorizedFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    const headers = new Headers(options.headers);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Authorized fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Kontroluje API status a vrací standardizovanou odpověď
 */
export async function checkApiStatus(
  response: Response
): Promise<{ success: boolean; error?: string }> {
  if (!response.ok) {
    try {
      const data = await response.json();
      return {
        success: false,
        error: data.error || data.message || `HTTP ${response.status}`,
      };
    } catch {
      return {
        success: false,
        error: `HTTP ${response.status} ${response.statusText}`,
      };
    }
  }

  return { success: true };
}

/**
 * Client-side varianta authorizedFetch
 */
export async function clientAuthorizedFetch<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    // Token se vezme automaticky z cookies v browser
    const headers = new Headers(options.headers);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Pošle cookies s requestem
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || 'Request failed',
        message: data.message,
      };
    }

    return {
      success: true,
      data: data.data || data,
    };
  } catch (error) {
    console.error('Client authorized fetch error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
