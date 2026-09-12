'use client';

import { X, Calendar, Tag, ExternalLink } from 'lucide-react';

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

interface ArticlePreviewProps {
  article: Article
  onClose: () => void
}

export default function ArticlePreview({ article, onClose }: ArticlePreviewProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Náhled článku</h1>
              <p className="text-sm text-gray-600">
                {article.published ? 'Publikováno' : 'Koncept'} • {formatDate(article.updatedAt)}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Zavřít náhled
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Featured image */}
          {article.imageUrl && (
            <div className="aspect-video w-full overflow-hidden">
              <img 
                src={article.imageUrl} 
                alt={article.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-8">
            {/* Meta info */}
            <div className="flex items-center gap-4 mb-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span className="px-2 py-1 bg-primary-100 text-primary-800 rounded-full font-medium">
                  {article.category}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              {!article.published && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full font-medium text-xs">
                  KONCEPT
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <div className="text-xl text-gray-600 mb-8 font-medium leading-relaxed border-l-4 border-primary-500 pl-6">
                {article.excerpt}
              </div>
            )}

            {/* Content */}
            <div 
              className="prose prose-lg max-w-none mb-8"
              style={{
                fontSize: '16px',
                lineHeight: '1.7',
                color: '#374151'
              }}
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Štítky:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Article meta */}
            <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-gray-500">
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2">
                <div>
                  Vytvořeno: {formatDate(article.createdAt)}
                </div>
                {article.updatedAt !== article.createdAt && (
                  <div>
                    Upraveno: {formatDate(article.updatedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </article>

        {/* Preview notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ExternalLink className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-blue-900">Náhled článku</h3>
              <p className="text-blue-700 text-sm mt-1">
                Toto je náhled, jak bude článek vypadat na webu. 
                {!article.published && ' Článek ještě není publikován a nebude viditelný pro návštěvníky.'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
