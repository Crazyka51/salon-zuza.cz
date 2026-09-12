'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Save, Eye, Clock, Calendar, ArrowLeft } from 'lucide-react';
import dynamic from 'next/dynamic';
import type { Article, Category } from '@/types/cms';

const TiptapEditor = dynamic(
  () => import('./components/TiptapEditor').then(mod => ({ default: mod.TiptapEditor })),
  { 
    ssr: false,
    loading: () => <div className="h-[400px] bg-muted animate-pulse rounded-lg" />
  }
);

interface ArticleEditorPageProps {
  articleId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export function ArticleEditorPage({ articleId, onSave, onCancel }: ArticleEditorPageProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<'draft' | 'published' | 'scheduled'>('draft');
  const [tags, setTags] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  
  // SEO fields
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  
  // Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && !articleId) {
      const newSlug = generateSlug(title);
      setSlug(newSlug);
    }
  }, [title, articleId, generateSlug]);

  // Load categories
  useEffect(() => {
    setCategories([
      { id: '1', name: 'Technologie', slug: 'technologie', active: true },
      { id: '2', name: 'Marketing', slug: 'marketing', active: true },
      { id: '3', name: 'Design', slug: 'design', active: true },
      { id: '4', name: 'Business', slug: 'business', active: true },
    ]);
  }, []);

  // Load article if editing
  useEffect(() => {
    if (articleId) {
      setIsLoading(true);
      // TODO: Load article data
      setTimeout(() => {
        setTitle('Ukázkový článek');
        setSlug('ukazkovy-clanek');
        setContent('<p>Obsah článku...</p>');
        setCategoryId('1');
        setIsLoading(false);
      }, 500);
    }
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        title: 'Chyba',
        description: 'Vyplňte prosím název a obsah článku',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const articleData = {
        title,
        slug,
        content,
        excerpt,
        coverImage,
        categoryId,
        status,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        scheduledAt: scheduledAt || null,
        seo: {
          metaTitle: metaTitle || title,
          metaDescription: metaDescription || excerpt,
        },
      };

      console.log('Saving article:', articleData);

      toast({
        title: 'Uloženo',
        description: `Článek "${title}" byl úspěšně ${articleId ? 'aktualizován' : 'vytvořen'}`,
      });

      // Call onSave callback if provided, otherwise redirect
      if (onSave) {
        setTimeout(() => {
          onSave();
        }, 1000);
      } else {
        setTimeout(() => {
          router.push('/admin/articles');
        }, 1000);
      }

    } catch (error) {
      toast({
        title: 'Chyba',
        description: 'Nepodařilo se uložit článek',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setStatus('draft');
    // Save to localStorage
    const draftData = { title, slug, content, excerpt, categoryId, tags, coverImage };
    localStorage.setItem('article_draft', JSON.stringify(draftData));
    
    toast({
      title: 'Koncept uložen',
      description: 'Váš článek byl uložen jako koncept',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Načítání článku...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">
              {articleId ? 'Upravit článek' : 'Nový článek'}
            </h1>
            <p className="text-muted-foreground">
              {articleId ? 'Upravte existující článek' : 'Vytvořte nový článek'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            Uložit koncept
          </Button>
          <Button
            onClick={() => window.open(`/preview/${slug}`, '_blank')}
            variant="outline"
            disabled={!slug}
          >
            <Eye className="mr-2 h-4 w-4" />
            Náhled
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content - 2 columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Název článku *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Zadejte název článku..."
                      className="text-2xl font-bold h-auto py-3"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="slug">URL slug</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="url-slug-clanku"
                      required
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      URL: /articles/{slug}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card>
              <CardHeader>
                <CardTitle>Obsah článku *</CardTitle>
              </CardHeader>
              <CardContent>
                <TiptapEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Začněte psát svůj článek..."
                />
              </CardContent>
            </Card>

            {/* SEO & Advanced */}
            <Tabs defaultValue="seo" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="seo">SEO</TabsTrigger>
                <TabsTrigger value="advanced">Pokročilé</TabsTrigger>
              </TabsList>
              
              <TabsContent value="seo">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="metaTitle">Meta titulek</Label>
                      <Input
                        id="metaTitle"
                        value={metaTitle}
                        onChange={(e) => setMetaTitle(e.target.value)}
                        placeholder={title || 'Automaticky z názvu'}
                        maxLength={60}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {metaTitle.length}/60 znaků
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="metaDescription">Meta popis</Label>
                      <Textarea
                        id="metaDescription"
                        value={metaDescription}
                        onChange={(e) => setMetaDescription(e.target.value)}
                        placeholder={excerpt || 'Automaticky z perexu'}
                        rows={3}
                        maxLength={160}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        {metaDescription.length}/160 znaků
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="advanced">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div>
                      <Label htmlFor="tags">Štítky</Label>
                      <Input
                        id="tags"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="tag1, tag2, tag3"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Oddělte čárkou
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            {/* Publish Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Nastavení publikace</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="status">Stav</Label>
                  <Select value={status} onValueChange={(v: any) => setStatus(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          Koncept
                        </div>
                      </SelectItem>
                      <SelectItem value="published">
                        <div className="flex items-center">
                          <Eye className="mr-2 h-4 w-4" />
                          Publikováno
                        </div>
                      </SelectItem>
                      <SelectItem value="scheduled">
                        <div className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Naplánováno
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {status === 'scheduled' && (
                  <div>
                    <Label htmlFor="scheduledAt">Datum publikace</Label>
                    <Input
                      id="scheduledAt"
                      type="datetime-local"
                      value={scheduledAt}
                      onChange={(e) => setScheduledAt(e.target.value)}
                    />
                  </div>
                )}

                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Vyberte kategorii" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>Ukládání...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {articleId ? 'Aktualizovat' : 'Publikovat'}
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Excerpt */}
            <Card>
              <CardHeader>
                <CardTitle>Perex</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Krátký popis článku..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Cover Image */}
            <Card>
              <CardHeader>
                <CardTitle>Titulní obrázek</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="URL obrázku..."
                />
                {coverImage && (
                  <div className="mt-4 rounded-lg overflow-hidden border border-border">
                    <img
                      src={coverImage}
                      alt="Cover preview"
                      className="w-full h-auto"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
