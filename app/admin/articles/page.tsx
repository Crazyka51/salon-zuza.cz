"use client"

import ArticleManager from "@/features/articles/ArticleManager"

export default function ArticlesPage() {
  return (
    <div className="p-6">
      <ArticleManager 
        onCreateNew={() => {
          console.log("Vytvořit nový článek")
        }}
        onEditArticle={(article) => {
          console.log("Editovat článek:", article)
        }}
      />
    </div>
  )
}
