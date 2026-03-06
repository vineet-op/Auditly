import { z } from 'zod';

export const AuditInputSchema = z.object({
  url: z.string().url().refine(
    (url) => {
      try {
        const parsed = new URL(url);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
          return false;
        }
        const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
        if (ipPattern.test(parsed.hostname)) {
          return false;
        }
        return true;
      } catch {
        return false;
      }
    },
    { message: 'URL cannot be localhost or an IP address' }
  ),
});

export type AuditInput = z.infer<typeof AuditInputSchema>;

export interface PageSpeedInsightsData {
  performanceScore: number;
  accessibilityScore: number;
  bestPracticesScore: number;
  seoScore: number;
  fcp: number;
  lcp: number;
  cls: number;
  si: number;
  tbt: number;
  ttfb: number;
  totalPageSizeBytes: number;
  renderBlockingResourcesCount: number;
  opportunities: Array<{
    title: string;
    description: string;
    savingsMs: number;
  }>;
  error?: string;
}

export interface HTMLData {
  title: string;
  metaDescription: string;
  h1Count: number;
  h1Text: string[];
  h2Count: number;
  h2Texts: string[];
  h3Count: number;
  totalImages: number;
  imagesMissingAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasCanonical: boolean;
  hasViewportMeta: boolean;
  robotsMeta: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  hasJsonLd: boolean;
  wordCount: number;
  error?: string;
}

export interface SecurityData {
  isHttps: boolean;
  hasHsts: boolean;
  hasCsp: boolean;
  hasXFrame: boolean;
  hasXContentType: boolean;
  hasReferrerPolicy: boolean;
  securityScore: number;
  error?: string;
}

export interface RawAuditData {
  url: string;
  pageSpeed: PageSpeedInsightsData;
  html: HTMLData;
  security: SecurityData;
}

export type Grade = 'A' | 'B' | 'C' | 'D' | 'F';

export interface CategoryReport {
  score: number;
  grade: Grade;
  issues: string[];
  recommendations: string[];
}

export const AuditReportSchema = z.object({
  id: z.string(),
  url: z.string(),
  createdAt: z.string(),
  overallScore: z.number().min(0).max(100),
  summary: z.string(),
  quickWins: z.array(z.string()),
  categories: z.object({
    performance: z.object({
      score: z.number().min(0).max(100),
      grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    seo: z.object({
      score: z.number().min(0).max(100),
      grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    accessibility: z.object({
      score: z.number().min(0).max(100),
      grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    security: z.object({
      score: z.number().min(0).max(100),
      grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
    bestPractices: z.object({
      score: z.number().min(0).max(100),
      grade: z.enum(['A', 'B', 'C', 'D', 'F']),
      issues: z.array(z.string()),
      recommendations: z.array(z.string()),
    }),
  }),
  rawMetrics: z.object({
    pageSpeed: z.any(),
    html: z.any(),
    security: z.any(),
  }),
});

export type AuditReport = z.infer<typeof AuditReportSchema>;
