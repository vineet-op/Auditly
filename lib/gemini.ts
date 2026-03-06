import { GoogleGenAI } from "@google/genai";

import type { RawAuditData, AuditReport } from './types';
import { AuditReportSchema } from './types';

const ai = new GoogleGenAI({});

export async function analyzeWithGemini(auditData: RawAuditData, reportId: string): Promise<AuditReport> {
  const prompt = `You are a website audit expert. Analyze the following website data and provide a comprehensive audit report.

Website URL: ${auditData.url}

=== PERFORMANCE DATA ===
Performance Score: ${auditData.pageSpeed.performanceScore}/100
Accessibility Score: ${auditData.pageSpeed.accessibilityScore}/100
Best Practices Score: ${auditData.pageSpeed.bestPracticesScore}/100
SEO Score: ${auditData.pageSpeed.seoScore}/100

Core Web Vitals:
- First Contentful Paint (FCP): ${auditData.pageSpeed.fcp}ms
- Largest Contentful Paint (LCP): ${auditData.pageSpeed.lcp}ms
- Cumulative Layout Shift (CLS): ${auditData.pageSpeed.cls}
- Speed Index (SI): ${auditData.pageSpeed.si}ms
- Total Blocking Time (TBT): ${auditData.pageSpeed.tbt}ms
- Time to First Byte (TTFB): ${auditData.pageSpeed.ttfb}ms
- Total Page Size: ${Math.round(auditData.pageSpeed.totalPageSizeBytes / 1024)}KB
- Render Blocking Resources: ${auditData.pageSpeed.renderBlockingResourcesCount}

Performance Opportunities:
${auditData.pageSpeed.opportunities.map(opp => `- ${opp.title}: ${opp.description} (Save ~${opp.savingsMs}ms)`).join('\n') || 'None'}

=== HTML/SEO DATA ===
Title: ${auditData.html.title || 'Missing'}
Meta Description: ${auditData.html.metaDescription || 'Missing'}
H1 Count: ${auditData.html.h1Count} (${auditData.html.h1Text.join(', ') || 'None'})
H2 Count: ${auditData.html.h2Count}
H3 Count: ${auditData.html.h3Count}
Total Images: ${auditData.html.totalImages}
Images Missing Alt Text: ${auditData.html.imagesMissingAlt}
Internal Links: ${auditData.html.internalLinks}
External Links: ${auditData.html.externalLinks}
Has Canonical Tag: ${auditData.html.hasCanonical}
Has Viewport Meta: ${auditData.html.hasViewportMeta}
Robots Meta: ${auditData.html.robotsMeta || 'Not set'}
Open Graph Title: ${auditData.html.ogTitle || 'Missing'}
Open Graph Description: ${auditData.html.ogDescription || 'Missing'}
Open Graph Image: ${auditData.html.ogImage || 'Missing'}
Has JSON-LD Schema: ${auditData.html.hasJsonLd}
Word Count: ${auditData.html.wordCount}

=== SECURITY DATA ===
HTTPS Enabled: ${auditData.security.isHttps}
Security Score: ${auditData.security.securityScore}/100
Security Headers:
- Strict-Transport-Security (HSTS): ${auditData.security.hasHsts}
- Content-Security-Policy (CSP): ${auditData.security.hasCsp}
- X-Frame-Options: ${auditData.security.hasXFrame}
- X-Content-Type-Options: ${auditData.security.hasXContentType}
- Referrer-Policy: ${auditData.security.hasReferrerPolicy}

Please analyze this data and return a JSON object with the following structure:
{
  "overallScore": <number 0-100, weighted average of all categories>,
  "summary": "<brief 2-3 sentence summary of the website's overall health>",
  "quickWins": ["<top 3 quick actionable fixes that will have the most impact>"],
  "categories": {
    "performance": {
      "score": <number 0-100>,
      "grade": "<A/B/C/D/F based on score: 90-100=A, 80-89=B, 70-79=C, 60-69=D, <60=F>",
      "issues": ["<specific issue 1>", "<specific issue 2>", ...],
      "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...]
    },
    "seo": {
      "score": <number 0-100>,
      "grade": "<A/B/C/D/F>",
      "issues": ["<specific issue 1>", "<specific issue 2>", ...],
      "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...]
    },
    "accessibility": {
      "score": <number 0-100>,
      "grade": "<A/B/C/D/F>",
      "issues": ["<specific issue 1>", "<specific issue 2>", ...],
      "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...]
    },
    "security": {
      "score": <number 0-100>,
      "grade": "<A/B/C/D/F>",
      "issues": ["<specific issue 1>", "<specific issue 2>", ...],
      "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...]
    },
    "bestPractices": {
      "score": <number 0-100>,
      "grade": "<A/B/C/D/F>",
      "issues": ["<specific issue 1>", "<specific issue 2>", ...],
      "recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>", ...]
    }
  }
}

IMPORTANT: 
- Return ONLY the JSON object, no additional text or markdown formatting
- Include exactly 3 items in quickWins array
- Assign letter grades based on scores (90-100=A, 80-89=B, 70-79=C, 60-69=D, <60=F)
- Be specific and actionable in issues and recommendations`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  const responseText = response.text;

  const jsonMatch = responseText?.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to extract JSON from Gemini response');
  }

  const parsedData = JSON.parse(jsonMatch[0]);
  
  const fullReport = {
    id: reportId,
    url: auditData.url,
    createdAt: new Date().toISOString(),
    ...parsedData,
    rawMetrics: {
      pageSpeed: auditData.pageSpeed,
      html: auditData.html,
      security: auditData.security,
    },
  };

  const validatedReport = AuditReportSchema.parse(fullReport);

  return validatedReport;
}
