import { NextRequest, NextResponse } from 'next/server';
import { collectAuditData } from '@/lib/scraper';
import { analyzeWithGemini } from '@/lib/gemini';
import { AuditInputSchema } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = AuditInputSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Invalid input',
          details: validation.error.message
        },
        { status: 400 }
      );
    }

    const { url } = validation.data;

    const auditData = await collectAuditData(url);

    if (auditData.pageSpeed.error || auditData.html.error || auditData.security.error) {
      const errors = [
        auditData.pageSpeed.error,
        auditData.html.error,
        auditData.security.error,
      ].filter(Boolean);

      console.warn('Partial audit data collected with errors:', errors);
    }

    const reportId = Buffer.from(url).toString('base64url');

    const report = await analyzeWithGemini(auditData, reportId);

    return NextResponse.json({
      success: true,
      reportId,
      report,
    });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      {
        error: 'Failed to audit website',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
