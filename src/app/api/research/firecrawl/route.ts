import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const FirecrawlRequestSchema = z.object({
  url: z.string().url('Must be a valid URL'),
  options: z.object({
    formats: z.array(z.enum(['markdown', 'html', 'rawHtml'])).optional(),
    onlyMainContent: z.boolean().optional(),
    includeTags: z.array(z.string()).optional(),
    excludeTags: z.array(z.string()).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, options = {} } = FirecrawlRequestSchema.parse(body)

    // Call Firecrawl API
    const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.FIRECRAWL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: options.formats || ['markdown'],
        onlyMainContent: options.onlyMainContent ?? true,
        includeTags: options.includeTags || ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li'],
        excludeTags: options.excludeTags || ['nav', 'footer', 'sidebar', 'ads', 'script', 'style'],
        waitFor: 0
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Firecrawl API error:', response.status, errorData)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Firecrawl API key' },
          { status: 500 }
        )
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Firecrawl rate limit exceeded' },
          { status: 429 }
        )
      }
      if (response.status === 400) {
        return NextResponse.json(
          { error: 'Invalid URL or scraping parameters' },
          { status: 400 }
        )
      }
      
      return NextResponse.json(
        { error: 'Firecrawl service unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      content: data.markdown || data.html || '',
      metadata: data.metadata || {},
      url: url
    })

  } catch (error) {
    console.error('Firecrawl endpoint error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false,
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}