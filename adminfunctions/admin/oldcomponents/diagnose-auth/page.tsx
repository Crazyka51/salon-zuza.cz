"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DiagnoseAuth() {
  const [authStatus, setAuthStatus] = useState<string>('Kontroluji autentizaci...');
  const [cookies, setCookies] = useState<string>('');
  const [localStorage, setLocalStorage] = useState<string>('');
  const [apiTest, setApiTest] = useState<string>('Čekám na test...');
  const [deleteTest, setDeleteTest] = useState<string>('Čekám na test mazání...');
  const [headers, setHeaders] = useState<string>('');

  const router = useRouter();

  useEffect(() => {
    // Kontrola cookies a localStorage
    const checkAuth = async () => {
      try {
        // Zjištění cookies
        setCookies(document.cookie || 'Žádné cookies');

        // Zjištění localStorage
        const accessToken = window.localStorage.getItem('access_token');
        setLocalStorage(accessToken ? 'access_token je nastaven' : 'access_token není nastaven');

        // Test API přístupu
        const response = await fetch('/api/admin/articles', {
          credentials: 'include',
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setAuthStatus('✅ Autentizace úspěšná - API pro články funguje');
          setApiTest(JSON.stringify(data, null, 2).substring(0, 500) + '...');
        } else {
          setAuthStatus('❌ Autentizace selhala - API pro články nefunguje');
          setApiTest(JSON.stringify(data, null, 2));
        }
      } catch (error) {
        setAuthStatus(`❌ Chyba při kontrole autentizace: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
      }
    };

    checkAuth();
  }, []);

  const testDeleteArticle = async () => {
    try {
      setDeleteTest('Probíhá test mazání...');

      // Nejprve vytvoříme testovací článek
      const createResponse = await fetch('/api/admin/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: 'Test mazání článku',
          content: 'Tento článek je určen ke smazání v rámci testování.',
          status: 'DRAFT'
        })
      });

      const createResult = await createResponse.json();
      
      if (!createResult.success) {
        setDeleteTest(`❌ Chyba při vytváření testovacího článku: ${createResult.error || 'Neznámá chyba'}`);
        return;
      }

      const articleId = createResult.data.id;
      
      // Získáme všechny hlavičky, které budeme posílat při mazání
      const requestHeaders = new Headers();
      requestHeaders.append('Content-Type', 'application/json');
      
      // Získáme token z localStorage a přidáme ho do Authorization hlavičky
      const accessToken = window.localStorage.getItem('access_token');
      if (accessToken) {
        requestHeaders.append('Authorization', `Bearer ${accessToken}`);
      }
      
      // Zobrazíme všechny hlavičky
      let headersText = '';
      requestHeaders.forEach((value, key) => {
        headersText += `${key}: ${key === 'Authorization' ? 'Bearer [hidden]' : value}\n`;
      });
      setHeaders(headersText);

      // Pokusíme se smazat článek s explicitní Authorization hlavičkou
      const deleteResponse = await fetch(`/api/admin/articles/${articleId}`, {
        method: 'DELETE',
        headers: requestHeaders,
        credentials: 'include'
      });

      const deleteResult = await deleteResponse.json();
      
      if (deleteResult.success) {
        setDeleteTest(`✅ Test mazání byl úspěšný! Článek s ID ${articleId} byl smazán.`);
      } else {
        setDeleteTest(`❌ Test mazání selhal: ${deleteResult.error || 'Neznámá chyba'}`);
      }
    } catch (error) {
      setDeleteTest(`❌ Chyba při testu mazání: ${error instanceof Error ? error.message : 'Neznámá chyba'}`);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Diagnostika autentizace administrace</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Stav autentizace</h2>
        <div className="p-4 bg-gray-100 rounded mb-4">
          <p className="font-medium">{authStatus}</p>
        </div>
        
        <h3 className="text-lg font-medium mb-2">Cookies</h3>
        <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-32 mb-4 text-sm">
          {cookies}
        </pre>
        
        <h3 className="text-lg font-medium mb-2">Local Storage</h3>
        <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-32 mb-4 text-sm">
          {localStorage}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test API</h2>
        <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-64 mb-4 text-sm">
          {apiTest}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test mazání článku</h2>
        <button 
          onClick={testDeleteArticle} 
          className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Spustit test mazání
        </button>
        
        {headers && (
          <>
            <h3 className="text-lg font-medium mb-2">Hlavičky požadavku</h3>
            <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-32 mb-4 text-sm">
              {headers}
            </pre>
          </>
        )}
        
        <pre className="p-3 bg-gray-100 rounded overflow-auto max-h-64 text-sm">
          {deleteTest}
        </pre>
      </div>
      
      <div className="flex justify-center mt-6">
        <button 
          onClick={() => router.push('/admin')} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Zpět do administrace
        </button>
      </div>
    </div>
  );
}
