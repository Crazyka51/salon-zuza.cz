'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

/**
 * Komponenta pro diagnostiku administračního systému
 * Testuje všechny klíčové funkce včetně publikování článků
 */
export default function DiagnosePage() {
  const { isAuthenticated, user } = useAuth()
  const [testResults, setTestResults] = useState<Record<string, any>>({})
  const [isRunningTests, setIsRunningTests] = useState(false)

  // Test přihlášení uživatele
  const testAuth = () => {
    setTestResults(prev => ({
      ...prev,
      auth: {
        success: isAuthenticated,
        message: isAuthenticated 
          ? `Přihlášen jako ${user?.username} (${user?.role})`
          : 'Uživatel není přihlášen'
      }
    }))
  }

  // Test API pro články
  const testArticlesAPI = async () => {
    try {
      // Získáme token z localStorage a přidáme ho do hlavičky
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/admin/articles', {
        credentials: 'include',
        headers
      })
      const data = await res.json()
      
      setTestResults(prev => ({
        ...prev,
        articlesAPI: {
          success: res.ok,
          message: res.ok
            ? `API vrátilo ${data.length || 0} článků`
            : `Chyba při načítání článků: ${res.status}`
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        articlesAPI: {
          success: false,
          message: `Chyba při volání API: ${error instanceof Error ? error.message : String(error)}`
        }
      }))
    }
  }

  // Test vytvoření a publikování článku
  const testCreateArticle = async () => {
    try {
      const testTitle = `Test článku ${new Date().toISOString().slice(0, 19)}`
      
      // Vytvoření článku
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const createRes = await fetch('/api/admin/articles', {
        method: 'POST',
        headers,
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
        body: JSON.stringify({
          title: testTitle,
          content: '<p>Toto je testovací obsah článku vytvořený diagnostikou.</p>',
          excerpt: 'Testovací článek pro diagnostiku',
          category: 'aktuality',
          published: true
        })
      })
      
      const createData = await createRes.json()
      
      if (!createRes.ok) {
        throw new Error(`Chyba při vytváření článku: ${createRes.status}`)
      }
      
      // Získání článku zpět pro ověření
      const getHeaders: Record<string, string> = {};
      if (token) {
        getHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      const getRes = await fetch(`/api/admin/articles/${createData.id}`, {
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
        headers: getHeaders
      })
      const getArticle = await getRes.json()
      
      setTestResults(prev => ({
        ...prev,
        createArticle: {
          success: getRes.ok && getArticle.title === testTitle,
          message: getRes.ok && getArticle.title === testTitle
            ? `Článek byl úspěšně vytvořen a načten zpět (ID: ${createData.id})`
            : `Článek byl vytvořen, ale není správně načten zpět`
        }
      }))
      
      // Pokus o aktualizaci článku
      const updateHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        updateHeaders['Authorization'] = `Bearer ${token}`;
      }
      
      const updateRes = await fetch(`/api/admin/articles/${createData.id}`, {
        method: 'PUT',
        headers: updateHeaders,
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
        body: JSON.stringify({
          title: `${testTitle} (aktualizováno)`,
          content: '<p>Tento článek byl aktualizován.</p>',
          excerpt: 'Testovací článek byl aktualizován',
          published: true
        })
      })
      
      const updateData = await updateRes.json()
      
      setTestResults(prev => ({
        ...prev,
        updateArticle: {
          success: updateRes.ok,
          message: updateRes.ok
            ? `Článek byl úspěšně aktualizován (ID: ${createData.id})`
            : `Chyba při aktualizaci článku: ${updateRes.status}`
        }
      }))
      
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        createArticle: {
          success: false,
          message: `Chyba při testování vytvoření článku: ${error instanceof Error ? error.message : String(error)}`
        }
      }))
    }
  }

  // Test diagnostických API
  const testDiagnosticAPI = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers: Record<string, string> = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch('/api/admin/auth/diagnostic', {
        credentials: 'include', // Přidáno pro použití HTTP-only cookies
        headers
      })
      const data = await res.json()
      
      setTestResults(prev => ({
        ...prev,
        diagnosticAPI: {
          success: res.ok,
          message: res.ok
            ? `Diagnostické API funguje`
            : `Diagnostické API není dostupné: ${res.status}`
        }
      }))
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        diagnosticAPI: {
          success: false,
          message: `Chyba při volání diagnostického API: ${error instanceof Error ? error.message : String(error)}`
        }
      }))
    }
  }

  // Spustit všechny testy
  const runAllTests = async () => {
    setIsRunningTests(true)
    setTestResults({})
    
    testAuth()
    await testArticlesAPI()
    await testCreateArticle()
    await testDiagnosticAPI()
    
    setIsRunningTests(false)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">Diagnostika administrace</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Diagnostický nástroj</CardTitle>
          <CardDescription>
            Tento nástroj prověří funkčnost administračního systému a klíčových API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Diagnostika prověří následující funkce:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-1">
            <li>Přihlášení uživatele</li>
            <li>Načítání článků přes API</li>
            <li>Vytváření a publikování článků</li>
            <li>Aktualizace existujících článků</li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={runAllTests} 
            disabled={isRunningTests}
          >
            {isRunningTests ? 'Probíhá diagnostika...' : 'Spustit diagnostiku'}
          </Button>
        </CardFooter>
      </Card>
      
      {Object.keys(testResults).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Výsledky diagnostiky</h2>
          
          {Object.entries(testResults).map(([key, result]) => (
            <Alert key={key} variant={result.success ? 'default' : 'destructive'}>
              <div className="flex items-center gap-2">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
                <AlertTitle className="font-medium">
                  {key === 'auth' && 'Autentizace'}
                  {key === 'articlesAPI' && 'API pro články'}
                  {key === 'createArticle' && 'Vytvoření článku'}
                  {key === 'updateArticle' && 'Aktualizace článku'}
                  {key === 'diagnosticAPI' && 'Diagnostické API'}
                </AlertTitle>
              </div>
              <AlertDescription className="mt-1 pl-7">
                {result.message}
              </AlertDescription>
            </Alert>
          ))}
          
          <Alert variant="default" className="bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              <AlertTitle className="font-medium">
                Shrnutí diagnostiky
              </AlertTitle>
            </div>
            <AlertDescription className="mt-1 pl-7">
              {Object.values(testResults).every(r => r.success)
                ? 'Všechny testy byly úspěšné! Administrace funguje správně.'
                : 'Některé testy selhaly. Zkontrolujte výsledky výše.'}
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  )
}
