// PHP-Fusion inspired enhancements for our admin-kit
// Based on what made PHP-Fusion administration excellent

import type { AdminConfig } from "./types"

// Enhanced configuration inspired by PHP-Fusion best practices
export const enhancedAdminConfig: Partial<AdminConfig> = {
  title: "CMS Admin Panel",
  theme: "system",
  
  // PHP-Fusion style navigation with logical grouping
  navigation: [
    {
      id: "dashboard",
      label: "Přehled",
      href: "/admin",
      icon: "Home",
    },
    
    // Content Management Group (PHP-Fusion style grouping)
    {
      id: "content-group",
      label: "Správa obsahu",
      href: "#",
      icon: "FileText",
      children: [
        {
          id: "articles",
          label: "Články",
          href: "/admin/articles",
          icon: "FileText",
          permission: "articles.read",
        },
        {
          id: "categories", 
          label: "Kategorie",
          href: "/admin/categories",
          icon: "Folder",
          permission: "categories.read",
        },
        {
          id: "media",
          label: "Média",
          href: "/admin/media", 
          icon: "Image",
          permission: "media.read",
        },
      ]
    },
    
    // User Management Group
    {
      id: "users-group",
      label: "Uživatelé",
      href: "#",
      icon: "Users", 
      children: [
        {
          id: "users",
          label: "Správa uživatelů",
          href: "/admin/users",
          icon: "User",
          permission: "users.read",
        },
        {
          id: "roles",
          label: "Role a oprávnění", 
          href: "/admin/roles",
          icon: "Shield",
          permission: "roles.read",
        },
      ]
    },
    
    // Communication Group
    {
      id: "communication-group",
      label: "Komunikace",
      href: "#",
      icon: "Mail",
      children: [
        {
          id: "newsletter",
          label: "Newsletter",
          href: "/admin/newsletter", 
          icon: "Mail",
          permission: "newsletter.read",
        },
        {
          id: "comments",
          label: "Komentáře",
          href: "/admin/comments",
          icon: "MessageSquare", 
          permission: "comments.read",
        },
      ]
    },
    
    // Analytics & Reports Group
    {
      id: "analytics-group", 
      label: "Analytika",
      href: "#",
      icon: "BarChart3",
      children: [
        {
          id: "analytics",
          label: "Statistiky",
          href: "/admin/analytics",
          icon: "TrendingUp",
          permission: "analytics.read", 
        },
        {
          id: "reports",
          label: "Reporty",
          href: "/admin/reports", 
          icon: "FileBarChart",
          permission: "reports.read",
        },
      ]
    },
    
    // System Group
    {
      id: "system-group",
      label: "Systém",
      href: "#",
      icon: "Settings",
      children: [
        {
          id: "settings",
          label: "Nastavení",
          href: "/admin/settings",
          icon: "Settings",
          permission: "settings.read",
        },
        {
          id: "backups",
          label: "Zálohy", 
          href: "/admin/backups",
          icon: "Database",
          permission: "backups.read",
        },
        {
          id: "diagnostics",
          label: "Diagnostika",
          href: "/admin/diagnostics",
          icon: "Activity", 
          permission: "diagnostics.read",
        },
      ]
    },
  ],
}

// PHP-Fusion inspired quick actions (context-aware)
export const quickActions = {
  global: [
    { 
      id: "new-article", 
      label: "Nový článek", 
      icon: "Plus", 
      shortcut: "Ctrl+N",
      action: () => window.location.href = "/admin/articles/new"
    },
    { 
      id: "quick-backup", 
      label: "Rychlá záloha", 
      icon: "Download", 
      shortcut: "Ctrl+B",
      action: () => console.log("Creating backup...")
    },
    { 
      id: "view-site", 
      label: "Zobrazit web", 
      icon: "ExternalLink", 
      shortcut: "Ctrl+Shift+V",
      action: () => window.open("/", "_blank")
    },
  ],
  
  contextual: {
    articles: [
      { id: "bulk-publish", label: "Hromadně publikovat", icon: "Send" },
      { id: "export-articles", label: "Exportovat články", icon: "Download" },
    ],
    media: [
      { id: "upload-multiple", label: "Nahrát více souborů", icon: "Upload" },
      { id: "optimize-images", label: "Optimalizovat obrázky", icon: "Zap" },
    ]
  }
}

// PHP-Fusion style dashboard widgets configuration
export const dashboardWidgets = {
  // Always visible core widgets
  core: [
    {
      id: "quick-stats",
      title: "Rychlé statistiky", 
      component: "QuickStatsWidget",
      size: "large",
      position: { row: 1, col: 1, span: 2 }
    },
    {
      id: "recent-activity",
      title: "Nedávná aktivita",
      component: "ActivityWidget", 
      size: "medium",
      position: { row: 1, col: 3, span: 1 }
    },
  ],
  
  // Customizable widgets (user can add/remove)
  optional: [
    {
      id: "top-articles",
      title: "Nejčtenější články",
      component: "TopArticlesWidget"
    },
    {
      id: "system-health", 
      title: "Stav systému",
      component: "SystemHealthWidget"
    },
    {
      id: "pending-tasks",
      title: "Čekající úkoly", 
      component: "PendingTasksWidget"
    }
  ]
}

// PHP-Fusion inspired notification system
export const notificationConfig = {
  types: {
    success: { duration: 3000, icon: "CheckCircle", color: "green" },
    error: { duration: 5000, icon: "XCircle", color: "red" },
    warning: { duration: 4000, icon: "AlertTriangle", color: "orange" },
    info: { duration: 3000, icon: "Info", color: "blue" },
  },
  
  positions: "top-right" as const,
  maxVisible: 5,
  
  // Auto-dismiss except for errors
  autoDismiss: {
    success: true,
    error: false, // Errors require manual dismiss
    warning: true,
    info: true,
  }
}

// PHP-Fusion style bulk operations
export const bulkOperations = {
  articles: [
    { 
      id: "publish", 
      label: "Publikovat", 
      icon: "Send",
      confirmMessage: "Opravdu chcete publikovat {count} článků?",
      permission: "articles.publish"
    },
    { 
      id: "unpublish", 
      label: "Zrušit publikování", 
      icon: "EyeOff",
      confirmMessage: "Opravdu chcete zrušit publikování {count} článků?", 
      permission: "articles.unpublish"
    },
    { 
      id: "delete", 
      label: "Smazat", 
      icon: "Trash2",
      variant: "destructive",
      confirmMessage: "POZOR: Opravdu chcete smazat {count} článků? Tato akce je nevratná!",
      requireDoubleConfirm: true,
      permission: "articles.delete"
    },
  ],
  
  categories: [
    { id: "merge", label: "Sloučit kategorie", icon: "Merge" },
    { id: "delete", label: "Smazat", icon: "Trash2", variant: "destructive" },
  ],
  
  users: [
    { id: "activate", label: "Aktivovat", icon: "UserCheck" },
    { id: "deactivate", label: "Deaktivovat", icon: "UserX" },
    { id: "change-role", label: "Změnit roli", icon: "Shield" },
  ]
}

// PHP-Fusion inspired keyboard shortcuts
export const keyboardShortcuts = {
  global: {
    "ctrl+/": "Zobrazit nápovědu klávesových zkratek",
    "ctrl+s": "Uložit aktuální formulář",
    "ctrl+n": "Nový článek",
    "ctrl+b": "Rychlá záloha",
    "ctrl+shift+v": "Zobrazit web",
    "esc": "Zavřít modální okna",
  },
  
  contextual: {
    tables: {
      "ctrl+a": "Vybrat vše",
      "delete": "Smazat vybrané", 
      "ctrl+e": "Upravit vybrané",
      "space": "Toggle výběr řádku",
    },
    
    editor: {
      "ctrl+b": "Tučné písmo",
      "ctrl+i": "Kurzíva", 
      "ctrl+k": "Vložit odkaz",
      "ctrl+shift+p": "Náhled článku",
    }
  }
}

export default enhancedAdminConfig