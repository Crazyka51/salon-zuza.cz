'use client';

import { useState, useEffect } from 'react';
import { Save, X, Eye, FileText } from 'lucide-react';
import { TiptapEditor } from './TiptapEditor';


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
  publishedAt?: string
}

interface SimpleArticleEditorProps {
  article: Article | null
  categories: string[]
  onSave: (article: Partial<Article>) => void
  onCancel: () => void
}

export default function SimpleArticleEditor({ article, categories, onSave, onCancel }: SimpleArticleEditorProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState('');
  const [published, setPublished] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setExcerpt(article.excerpt);
      setCategory(article.category);
      setTags(article.tags.join(', '));
      setPublished(article.published);
      setImageUrl(article.imageUrl || '');
    } else {
      // Reset form for new article
      setTitle('');
      setContent('');
      setExcerpt('');
      setCategory(categories[0] || '');
      setTags('');
      setPublished(false);
      setImageUrl('');
    }
  }, [article, categories]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Název a obsah jsou povinné!');
      return;
    }

    setIsSaving(true);
    
    const articleData = {
      title: title.trim(),
      content: content.trim(),
      excerpt: excerpt.trim() || generateExcerpt(content),
      category,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      published,
      imageUrl: imageUrl.trim() || undefined
    };

    await onSave(articleData);
    setIsSaving(false);
  };

  const generateExcerpt = (content: string) => {
    // Odstraň HTML tagy a vezmi prvních 150 znaků
    const textContent = content.replace(/<[^>]*>/g, '');
    return textContent.length > 150 ? textContent.substring(0, 150) + '...' : textContent;
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-xl font-semibold text-gray-900">Náhled článku</h1>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsPreview(false)}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Zpět k editaci
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSaving ? 'Ukládání...' : 'Uložit'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Preview content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <article className="bg-white rounded-lg shadow-sm border p-8">
            {imageUrl && (
              <img 
                src={imageUrl} 
                alt={title}
                className="w-full h-64 object-cover rounded-lg mb-6"
              />
            )}
            <div className="mb-4">
              <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {category}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{title}</h1>
            {excerpt && (
              <p className="text-xl text-gray-600 mb-6 font-medium">{excerpt}</p>
            )}
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {tags.trim() && (
              <div className="mt-8 pt-6 border-t">
                <div className="flex flex-wrap gap-2">
                  {tags.split(',').map((tag, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-md"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-semibold text-gray-900">
              {article ? 'Upravit článek' : 'Nový článek'}
            </h1>
            
            <div className="flex gap-2">
              <button
                onClick={onCancel}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Zrušit
              </button>
              
              <button
                onClick={() => setIsPreview(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Náhled
              </button>
              
              <button
                onClick={handleSave}
                disabled={isSaving || !title.trim() || !content.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Ukládání...' : 'Uložit'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Editor content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Název článku *
              </label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                placeholder="Zadejte název článku..."
                required
              />
            </div>

            {/* Content - Tiptap Editor */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Obsah článku *
              </label>
              <TiptapEditor
                content={content}
                onChange={setContent}
              />
            </div>


            {/* Excerpt */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
                Perex (automaticky se vygeneruje z obsahu, pokud nevyplníte)
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Krátký popis článku..."
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publikování</h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    id="published"
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publikovat článek
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  {published ? 
                    'Článek bude viditelný na webu.' : 
                    'Článek zůstane jako koncept.'
                  }
                </p>
              </div>
            </div>

            {/* Category */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Kategorie
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Štítky
              </label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="praha4, doprava, životní prostředí"
              />
              <p className="text-sm text-gray-500 mt-1">
                Oddělte štítky čárkami
              </p>
            </div>

            {/* Featured image */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Obrázek článku
              </label>
              <input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/image.jpg"
              />
              {imageUrl && (
                <div className="mt-2">
                  <img 
                    src={imageUrl} 
                    alt="Náhled" 
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-sm text-gray-500 mt-1">
                URL adresa obrázku pro článek
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
