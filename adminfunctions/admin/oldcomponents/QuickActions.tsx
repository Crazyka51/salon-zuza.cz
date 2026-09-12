'use client';

import { useState } from 'react';
import { 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  Copy, 
  Share, 
  Download,
  Globe,
  EyeOff,
  Calendar
} from 'lucide-react';

interface Article {
  id: string
  title: string
  content: string
  excerpt: string
  category: string
  tags: string[]
  published: boolean
  createdAt: string
  updatedAt: string
  imageUrl?: string
}

interface QuickActionsProps {
  article: Article
  onEdit: () => void
  onPreview: () => void
  onDelete: () => void
  onDuplicate: () => void
  onTogglePublish: () => void
  onCopyUrl?: () => void
}

export default function QuickActions({ 
  article, 
  onEdit, 
  onPreview, 
  onDelete, 
  onDuplicate, 
  onTogglePublish,
  onCopyUrl 
}: QuickActionsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        title="Více akcí"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          {/* Overlay pro zavření menu */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown menu */}
          <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
            <div className="py-1">
              {/* Náhled */}
              <button
                onClick={() => handleAction(onPreview)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Náhled
              </button>

              {/* Upravit */}
              <button
                onClick={() => handleAction(onEdit)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Upravit
              </button>

              <hr className="my-1 border-gray-200" />

              {/* Publikovat/Zrušit publikování */}
              <button
                onClick={() => handleAction(onTogglePublish)}
                className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors ${
                  article.published 
                    ? 'text-orange-700 hover:bg-orange-50' 
                    : 'text-green-700 hover:bg-green-50'
                }`}
              >
                {article.published ? (
                  <>
                    <EyeOff className="w-4 h-4" />
                    Zrušit publikování
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4" />
                    Publikovat
                  </>
                )}
              </button>

              {/* Duplikovat */}
              <button
                onClick={() => handleAction(onDuplicate)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Copy className="w-4 h-4" />
                Duplikovat
              </button>

              {/* Kopírovat URL (pouze pro publikované) */}
              {article.published && onCopyUrl && (
                <button
                  onClick={() => handleAction(onCopyUrl)}
                  className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Share className="w-4 h-4" />
                  Kopírovat URL
                </button>
              )}

              {/* Export */}
              <button
                onClick={() => handleAction(() => exportArticle(article))}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportovat
              </button>

              <hr className="my-1 border-gray-200" />

              {/* Smazat */}
              <button
                onClick={() => handleAction(onDelete)}
                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Smazat
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Funkce pro export článku
function exportArticle(article: Article) {
  const exportData = {
    ...article,
    exportedAt: new Date().toISOString()
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], {
    type: 'application/json'
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `clanek-${article.title.toLowerCase().replace(/[^a-z0-9]/gi, '-')}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
