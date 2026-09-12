/**
 * Type definice pro CMS systém
 */

// Article status
export type ArticleStatus = 'draft' | 'published' | 'archived' | 'scheduled';

// Article interface
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  coverImage?: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  tags?: string[];
  status: ArticleStatus;
  visibility?: 'public' | 'private' | 'protected';
  publishedAt?: Date | string;
  scheduledAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
  views?: number;
  likes?: number;
  comments?: number;
  featured?: boolean;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];
    ogImage?: string;
  };
}

// Dashboard statistics
export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  draftArticles: number;
  totalViews: number;
  totalComments: number;
  totalLikes: number;
  recentArticles?: Article[];
  popularArticles?: Article[];
}

// Category interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  icon?: string;
  parent?: string;
  order?: number;
  articleCount?: number;
  active?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// Media file interface
export interface MediaFile {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
  alt?: string;
  caption?: string;
  uploadedBy: {
    id: string;
    name: string;
  };
  createdAt: Date | string;
  folder?: string;
}

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'admin' | 'editor' | 'author' | 'viewer';
  permissions?: string[];
  createdAt: Date | string;
  lastLogin?: Date | string;
}

// Settings interface
export interface Settings {
  general?: {
    siteName?: string;
    siteDescription?: string;
    siteUrl?: string;
    logo?: string;
    favicon?: string;
  };
  editor?: {
    defaultCategory?: string;
    defaultVisibility?: 'public' | 'private';
    allowImageUpload?: boolean;
    allowScheduling?: boolean;
    requireApproval?: boolean;
  };
  notifications?: {
    emailNotifications?: boolean;
    notifyOnComment?: boolean;
    notifyOnLike?: boolean;
    notificationEmail?: string;
  };
  seo?: {
    defaultMetaTitle?: string;
    defaultMetaDescription?: string;
    sitemap?: boolean;
    robotsTxt?: string;
  };
}

// Comment interface
export interface Comment {
  id: string;
  articleId: string;
  author: {
    id?: string;
    name: string;
    email: string;
    avatar?: string;
  };
  content: string;
  status: 'pending' | 'approved' | 'spam';
  parentId?: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

// Newsletter campaign
export interface NewsletterCampaign {
  id: string;
  title: string;
  subject: string;
  content: string;
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: Date | string;
  sentAt?: Date | string;
  recipientCount?: number;
  openRate?: number;
  clickRate?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Analytics data
export interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages?: Array<{
    path: string;
    views: number;
  }>;
  topReferrers?: Array<{
    source: string;
    visits: number;
  }>;
  period: {
    start: Date | string;
    end: Date | string;
  };
}
