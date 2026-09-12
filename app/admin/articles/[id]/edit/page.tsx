import { ArticleEditorPage } from '@/features/articles/ArticleEditorPage';

interface EditArticlePageProps {
  params: {
    id: string;
  };
}

export default function EditArticlePage({ params }: EditArticlePageProps) {
  return <ArticleEditorPage articleId={params.id} />;
}
