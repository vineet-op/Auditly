import * as cheerio from 'cheerio';
import type { PageSpeedInsightsData, HTMLData, SecurityData, RawAuditData } from './types';

export async function fetchPageSpeedData(url: string): Promise<PageSpeedInsightsData> {
  try {
    const apiKey = process.env.GOOGLE_PSI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_PSI_API_KEY is not configured');
    }

    const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`PageSpeed Insights API failed: ${response.statusText}`);
    }

    const data = await response.json();
    const lighthouse = data.lighthouseResult;
    const audits = lighthouse.audits;

    const opportunities: Array<{ title: string; description: string; savingsMs: number }> = [];
    
    const opportunityAudits = [
      'render-blocking-resources',
      'unused-css-rules',
      'unused-javascript',
      'modern-image-formats',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript',
    ];

    opportunityAudits.forEach((auditKey) => {
      const audit = audits[auditKey];
      if (audit && audit.details && audit.details.overallSavingsMs > 0) {
        opportunities.push({
          title: audit.title,
          description: audit.description,
          savingsMs: audit.details.overallSavingsMs,
        });
      }
    });

    return {
      performanceScore: Math.round((lighthouse.categories.performance?.score || 0) * 100),
      accessibilityScore: Math.round((lighthouse.categories.accessibility?.score || 0) * 100),
      bestPracticesScore: Math.round((lighthouse.categories['best-practices']?.score || 0) * 100),
      seoScore: Math.round((lighthouse.categories.seo?.score || 0) * 100),
      fcp: audits['first-contentful-paint']?.numericValue || 0,
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      si: audits['speed-index']?.numericValue || 0,
      tbt: audits['total-blocking-time']?.numericValue || 0,
      ttfb: audits['server-response-time']?.numericValue || 0,
      totalPageSizeBytes: audits['total-byte-weight']?.numericValue || 0,
      renderBlockingResourcesCount: audits['render-blocking-resources']?.details?.items?.length || 0,
      opportunities,
    };
  } catch (error) {
    return {
      performanceScore: 0,
      accessibilityScore: 0,
      bestPracticesScore: 0,
      seoScore: 0,
      fcp: 0,
      lcp: 0,
      cls: 0,
      si: 0,
      tbt: 0,
      ttfb: 0,
      totalPageSizeBytes: 0,
      renderBlockingResourcesCount: 0,
      opportunities: [],
      error: error instanceof Error ? error.message : 'Failed to fetch PageSpeed data',
    };
  }
}

export async function fetchHtmlMetrics(url: string): Promise<HTMLData> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Googlebot',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch HTML: ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const h1Elements = $('h1');
    const h1Text = h1Elements.map((_, el) => $(el).text().trim()).get();

    const h2Elements = $('h2');
    const h2Texts = h2Elements.map((_, el) => $(el).text().trim()).get();

    const h3Count = $('h3').length;

    const images = $('img');
    const imagesMissingAlt = images.filter((_, el) => !$(el).attr('alt')).length;

    const urlObj = new URL(url);
    const links = $('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;

    links.each((_, el) => {
      const href = $(el).attr('href');
      if (href) {
        try {
          const linkUrl = new URL(href, url);
          if (linkUrl.hostname === urlObj.hostname) {
            internalLinks++;
          } else {
            externalLinks++;
          }
        } catch {
          if (href.startsWith('/') || href.startsWith('#')) {
            internalLinks++;
          }
        }
      }
    });

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;

    return {
      title: $('title').text() || '',
      metaDescription: $('meta[name="description"]').attr('content') || '',
      h1Count: h1Elements.length,
      h1Text,
      h2Count: h2Elements.length,
      h2Texts,
      h3Count,
      totalImages: images.length,
      imagesMissingAlt,
      internalLinks,
      externalLinks,
      hasCanonical: $('link[rel="canonical"]').length > 0,
      hasViewportMeta: $('meta[name="viewport"]').length > 0,
      robotsMeta: $('meta[name="robots"]').attr('content') || '',
      ogTitle: $('meta[property="og:title"]').attr('content') || '',
      ogDescription: $('meta[property="og:description"]').attr('content') || '',
      ogImage: $('meta[property="og:image"]').attr('content') || '',
      hasJsonLd: $('script[type="application/ld+json"]').length > 0,
      wordCount,
    };
  } catch (error) {
    return {
      title: '',
      metaDescription: '',
      h1Count: 0,
      h1Text: [],
      h2Count: 0,
      h2Texts: [],
      h3Count: 0,
      totalImages: 0,
      imagesMissingAlt: 0,
      internalLinks: 0,
      externalLinks: 0,
      hasCanonical: false,
      hasViewportMeta: false,
      robotsMeta: '',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      hasJsonLd: false,
      wordCount: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch HTML metrics',
    };
  }
}

export async function fetchSecurityHeaders(url: string): Promise<SecurityData> {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AuditlyBot/1.0)',
      },
    });

    const headers = response.headers;
    const isHttps = url.startsWith('https://');
    const hasHsts = headers.has('strict-transport-security');
    const hasCsp = headers.has('content-security-policy');
    const hasXFrame = headers.has('x-frame-options');
    const hasXContentType = headers.has('x-content-type-options');
    const hasReferrerPolicy = headers.has('referrer-policy');

    const securityChecks = [isHttps, hasHsts, hasCsp, hasXFrame, hasXContentType, hasReferrerPolicy];
    const passedChecks = securityChecks.filter(Boolean).length;
    const securityScore = Math.round((passedChecks / 6) * 100);

    return {
      isHttps,
      hasHsts,
      hasCsp,
      hasXFrame,
      hasXContentType,
      hasReferrerPolicy,
      securityScore,
    };
  } catch (error) {
    return {
      isHttps: url.startsWith('https://'),
      hasHsts: false,
      hasCsp: false,
      hasXFrame: false,
      hasXContentType: false,
      hasReferrerPolicy: false,
      securityScore: 0,
      error: error instanceof Error ? error.message : 'Failed to fetch security headers',
    };
  }
}

export async function collectAuditData(url: string): Promise<RawAuditData> {
  const [pageSpeed, html, security] = await Promise.all([
    fetchPageSpeedData(url),
    fetchHtmlMetrics(url),
    fetchSecurityHeaders(url),
  ]);

  return {
    url,
    pageSpeed,
    html,
    security,
  };
}
