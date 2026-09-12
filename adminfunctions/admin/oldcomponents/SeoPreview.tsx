'use client';

import { useState, useEffect } from 'react';
import { Globe, Smartphone, Monitor } from 'lucide-react';

interface SeoPreviewProps {
  title: string
  excerpt: string
  url?: string
}

export default function SeoPreview({ title, excerpt, url = 'pavelfiser.cz/aktuality/nazev-clanku' }: SeoPreviewProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  // Generování SEO-optimalizovaných textů
  const seoTitle = title.length > 60 ? title.substring(0, 57) + '...' : title;
  const seoDescription = excerpt.length > 160 ? excerpt.substring(0, 157) + '...' : excerpt;
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">SEO náhled</h3>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          <button
            onClick={() => setDevice('desktop')}
            className={`p-2 flex items-center gap-1 text-xs ${
              device === 'desktop' 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Monitor className="w-3 h-3" />
            Desktop
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`p-2 flex items-center gap-1 text-xs border-l ${
              device === 'mobile' 
                ? 'bg-blue-50 text-blue-600 border-blue-200' 
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            Mobil
          </button>
        </div>
      </div>
      
      {/* Google SERP preview */}
      <div className={`border rounded-lg p-4 bg-gray-50 ${device === 'mobile' ? 'max-w-sm' : ''}`}>
        <div className="flex items-center gap-2 mb-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{url}</span>
        </div>
        
        <h4 className={`text-blue-600 hover:underline cursor-pointer mb-1 ${
          device === 'mobile' ? 'text-lg' : 'text-xl'
        }`}>
          {seoTitle}
        </h4>
        
        <p className={`text-gray-600 ${device === 'mobile' ? 'text-sm' : 'text-base'}`}>
          {seoDescription}
        </p>
      </div>
      
      {/* SEO tips */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Délka titulku:</span>
          <span className={`font-medium ${
            title.length > 60 ? 'text-red-600' : title.length > 50 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {title.length}/60
          </span>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Délka popisu:</span>
          <span className={`font-medium ${
            excerpt.length > 160 ? 'text-red-600' : excerpt.length > 140 ? 'text-yellow-600' : 'text-green-600'
          }`}>
            {excerpt.length}/160
          </span>
        </div>
      </div>
      
      {/* SEO recommendations */}
      {(title.length > 60 || excerpt.length > 160) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h5 className="text-sm font-medium text-yellow-800 mb-1">Doporučení pro SEO:</h5>
          <ul className="text-sm text-yellow-700 space-y-1">
            {title.length > 60 && (
              <li>• Zkraťte titulek na maximálně 60 znaků</li>
            )}
            {excerpt.length > 160 && (
              <li>• Zkraťte popis na maximálně 160 znaků</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
