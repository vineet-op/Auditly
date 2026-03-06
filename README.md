# Auditly

AI-powered website audit tool that provides comprehensive analysis of performance, SEO, accessibility, security, and best practices.

## Features

- **Performance Analysis** - Core Web Vitals, Lighthouse scores, optimization opportunities
- **SEO Audit** - Meta tags, Open Graph, structured data, heading structure
- **Accessibility Check** - WCAG compliance and accessibility scores
- **Security Headers** - HTTPS, HSTS, CSP, and other security headers
- **Best Practices** - Industry standards and recommendations
- **AI-Powered Insights** - Gemini AI analyzes data and provides actionable recommendations
- **Quick Wins** - Top 3 high-impact improvements identified by AI
- **Interactive Charts** - Visual representation of scores and metrics
- **Beautiful UI** - Modern design with animations and gradients

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Motion (Framer Motion)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Data Parsing**: Cheerio
- **Validation**: Zod
- **AI**: Google Gemini 2.5 Flash
- **APIs**: Google PageSpeed Insights

## Getting Started

### Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Google Gemini API key
- Google PageSpeed Insights API key

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pnpm install
```

3. Create `.env.local` file in the root directory:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GOOGLE_PSI_API_KEY=your_google_psi_api_key_here
```

### Running the App

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
website-analyzer/
├── app/
│   ├── page.tsx                    # Homepage with URL input
│   ├── layout.tsx                  # Root layout
│   ├── api/
│   │   └── audit/
│   │       └── route.ts            # POST endpoint for audits
│   └── report/
│       └── [id]/
│           └── page.tsx            # Report display page
├── lib/
│   ├── types.ts                    # TypeScript types & Zod schemas
│   ├── scraper.ts                  # Data collection functions
│   ├── gemini.ts                   # AI analysis logic
│   └── utils.ts                    # Utility functions
└── .env.local                      # Environment variables
```

## How It Works

1. **User Input**: Enter a website URL on the homepage
2. **Validation**: URL is validated (blocks localhost and IP addresses)
3. **Parallel Data Collection**:
   - Google PageSpeed Insights API → Lighthouse scores, Core Web Vitals, opportunities
   - Cheerio (HTTP fetch) → HTML parsing, meta tags, Open Graph, structured data
   - HEAD request → Security headers check
4. **AI Analysis**: All data is sent to Gemini AI for comprehensive analysis
5. **Report Generation**: AI returns structured JSON with:
   - Overall score and summary
   - Category scores with grades (A-F)
   - Specific issues and recommendations
   - Top 3 quick wins
6. **Display**: Beautiful, interactive report with charts and animations

## API Endpoints

### POST `/api/audit`

Audit a website and return comprehensive report.

**Request Body:**
```json
{
  "url": "https://example.com"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "base64url_encoded_url",
  "report": {
    "id": "report_id",
    "url": "https://example.com",
    "createdAt": "2026-03-06T...",
    "overallScore": 85,
    "summary": "...",
    "quickWins": ["...", "...", "..."],
    "categories": {
      "performance": { "score": 90, "grade": "A", "issues": [], "recommendations": [] },
      "seo": { "score": 85, "grade": "B", "issues": [], "recommendations": [] },
      "accessibility": { "score": 88, "grade": "B", "issues": [], "recommendations": [] },
      "security": { "score": 75, "grade": "C", "issues": [], "recommendations": [] },
      "bestPractices": { "score": 92, "grade": "A", "issues": [], "recommendations": [] }
    },
    "rawMetrics": { ... }
  }
}
```

## Error Handling

The app implements resilient error handling:
- Each data source (PageSpeed, HTML, Security) has individual try/catch blocks
- Partial audits succeed even if one data source fails
- Error flags are included in raw metrics
- 8-second timeout on HTML fetching to prevent hanging

## Validation Rules

- URLs must be valid HTTP/HTTPS format
- Localhost URLs are blocked
- IP addresses are blocked
- Only public websites can be audited

## Development

### Build for Production

```bash
pnpm build
pnpm start
```

### Linting

```bash
pnpm lint
```

## License

MIT
