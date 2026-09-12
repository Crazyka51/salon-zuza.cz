'use client';

import { useState, useEffect } from 'react';
import { Save, RefreshCw, Search } from 'lucide-react';

interface ContentBlock {
  id: string;
  key: string;
  content: string;
  type: 'TEXT' | 'HTML' | 'MARKDOWN';
  section: string;
  label: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export default function ContentManager() {
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>('hero');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingBlocks, setEditingBlocks] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Načítání content bloků při inicializaci
  useEffect(() => {
    loadContentBlocks();
  }, []);

  const loadContentBlocks = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('/api/admin/content', {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP chyba ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setContentBlocks(result.data);
        // Inicializace editing stavu s aktuálními hodnotami
        const editing: Record<string, string> = {};
        result.data.forEach((block: ContentBlock) => {
          editing[block.id] = block.content;
        });
        setEditingBlocks(editing);
      } else {
        alert(`Chyba při načítání obsahu: ${result.error}`);
      }
    } catch (error) {
      console.error('Chyba při načítání obsahu:', error);
      alert('Chyba při načítání obsahu webu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (blockId: string, newContent: string) => {
    setEditingBlocks(prev => ({
      ...prev,
      [blockId]: newContent
    }));
    
    // Zjistit, zda došlo ke změně oproti původní hodnotě
    const originalBlock = contentBlocks.find(b => b.id === blockId);
    if (originalBlock && originalBlock.content !== newContent) {
      setHasChanges(true);
    } else {
      // Kontrola, zda ještě nějaké změny zbývají
      const stillHasChanges = Object.entries(editingBlocks).some(([id, content]) => {
        const orig = contentBlocks.find(b => b.id === id);
        return orig && orig.content !== content;
      });
      setHasChanges(stillHasChanges);
    }
  };

  const saveChanges = async () => {
    if (!hasChanges) return;
    
    try {
      setIsSaving(true);
      
      // Najít bloky, které byly změněny
      const changedBlocks = Object.entries(editingBlocks)
        .filter(([id, content]) => {
          const originalBlock = contentBlocks.find(b => b.id === id);
          return originalBlock && originalBlock.content !== content;
        })
        .map(([id, content]) => {
          const originalBlock = contentBlocks.find(b => b.id === id)!;
          return {
            id,
            content,
            type: originalBlock.type
          };
        });

      if (changedBlocks.length === 0) {
        setHasChanges(false);
        return;
      }

      // Poslat změny na server (každý blok zvlášť pro lepší error handling)
      let successCount = 0;
      for (const block of changedBlocks) {
        try {
              const response = await fetch('/api/admin/content', {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify(block)
              });

          const result = await response.json();
          if (result.success) {
            successCount++;
          } else {
            throw new Error(result.error || 'Neznámá chyba');
          }
        } catch (error) {
          console.error(`Chyba při ukládání bloku ${block.id}:`, error);
          alert(`Nepodařilo se uložit změny pro: ${block.id}`);
        }
      }

      if (successCount > 0) {
        alert(`Úspěšně uloženo ${successCount} změn`);
        await loadContentBlocks(); // Znovu načíst data
        setHasChanges(false);
      }
      
    } catch (error) {
      console.error('Chyba při ukládání:', error);
      alert('Chyba při ukládání změn');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSection = (section: string) => {
    // Tato funkce již není potřeba - sekce se přepínají přes záložky
    setSelectedSection(section);
  };

  // Filtrování bloků pro aktuálně vybranou sekci
  const filteredBlocks = contentBlocks.filter(block => {
    const matchesSection = block.section === selectedSection;
    const matchesSearch = !searchTerm ||
                         block.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         block.key.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSection && matchesSearch;
  }).sort((a, b) => a.orderIndex - b.orderIndex);

  const sections = [...new Set(contentBlocks.map(block => block.section))];

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600">Načítání obsahu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Správa obsahu webu</h1>
        <p className="text-gray-600">
          Upravte texty a obsah, který se zobrazuje na hlavní stránce webu.
        </p>
      </div>

      {/* Záložky sekcí */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 border-b-2 transition-colors ${
                selectedSection === section
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Ovládací panel */}
      <div className="bg-white rounded-lg shadow-sm border mb-6 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Vyhledávání */}
          <div className="relative grow max-w-md">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Vyhledat obsah..."
              title="Vyhledat obsah podle názvu nebo klíče"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Tlačítka akce */}
          <div className="flex gap-3">
            <button
              onClick={loadContentBlocks}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Obnovit
            </button>
            
            {hasChanges && (
              <button
                onClick={saveChanges}
                disabled={isSaving}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Ukládám...' : 'Uložit změny'}
              </button>
            )}
          </div>
        </div>

        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ Máte neuložené změny. Nezapomeňte je uložit před opuštěním stránky.
            </p>
          </div>
        )}
      </div>

      {/* Obsah a Preview */}
      <div className="grid grid-cols-2 gap-6">
        {/* Levá strana - Editační formulář */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 bg-gray-50 border-b">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                Upravit {selectedSection}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {filteredBlocks.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  Žádné bloky nenalezeny pro tuto sekci.
                </p>
              ) : (
                filteredBlocks.map((block) => (
                  <div key={block.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {block.label}
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Klíč: <code className="bg-gray-100 px-1 rounded">{block.key}</code>
                    </p>
                    {block.type === 'HTML' || block.type === 'MARKDOWN' ? (
                      <textarea
                        value={editingBlocks[block.id] || ''}
                        onChange={(e) => handleContentChange(block.id, e.target.value)}
                        rows={4}
                        placeholder="Zadejte obsah..."
                        title="Editor obsahu"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm dark:focus:ring-blue-400"
                      />
                    ) : (
                      <input
                        type="text"
                        value={editingBlocks[block.id] || ''}
                        onChange={(e) => handleContentChange(block.id, e.target.value)}
                        placeholder="Zadejte text..."
                        title="Editor textu"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                      />
                    )}
                    {editingBlocks[block.id] !== block.content && (
                      <p className="text-xs text-blue-600 mt-1">
                        ✏️ Změněno
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pravá strana - Live Preview */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border sticky top-6">
            <div className="px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Náhled komponenty</h2>
            </div>
            <div className="p-6 bg-gray-50 dark:bg-gray-900 overflow-auto max-h-[calc(100vh-200px)]">
              <div className="flex items-center justify-center p-12 text-gray-500 dark:text-gray-400">
                <div className="text-center">
                  <p className="mb-2">Živý náhled pro sekci "{selectedSection}"</p>
                  <p className="text-sm">Upravujte obsah v levém panelu a sledujte změny</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}