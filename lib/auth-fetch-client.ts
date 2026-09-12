/**
 * Client-side authentication utilities
 * This file contains functions that work in client components only
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Client-side API fetch with automatic authentication
 * This function works in client components and automatically includes cookies for authentication
 */
export async function clientAuthorizedFetch(
  url: string,
  options: RequestInit & { debug?: boolean } = {}
): Promise<Response> {
  const { debug = false, ...fetchOptions } = options;

  try {
    // Pokud je body FormData, NEnastavuj Content-Type - browser jej nastaví sám
    // včetně správného multipart boundary. Jinak použij application/json.
    const isFormData = fetchOptions.body instanceof FormData;

    const headers: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...((fetchOptions.headers as Record<string, string>) || {}),
    };

    if (debug) {
      console.log('🔄 Client authorized fetch:', {
        url,
        method: fetchOptions.method || 'GET',
        headers: Object.keys(headers)
      });
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
      credentials: 'include', // This ensures cookies are sent
    });

    if (debug) {
      console.log('📥 Client response:', {
        status: response.status,
        ok: response.ok,
        url: response.url
      });
    }

    return response;
  } catch (error) {
    if (debug) {
      console.error('❌ Client fetch error:', error);
    }
    throw error;
  }
}

/**
 * Check API accessibility and authentication status
 */
export async function checkApiStatus(): Promise<{ isAccessible: boolean; isAuthenticated: boolean; error?: string }> {
  try {
    const response = await clientAuthorizedFetch('/api/admin/auth/check', {
      method: 'GET',
      debug: false
    });

    const data = await response.json();
    
    return {
      isAccessible: true,
      isAuthenticated: response.ok && data.success,
      error: data.error
    };
  } catch (error) {
    return {
      isAccessible: false,
      isAuthenticated: false,
      error: error instanceof Error ? error.message : 'Neznámá chyba'
    };
  }
}