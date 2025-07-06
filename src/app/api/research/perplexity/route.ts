import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const PerplexityRequestSchema = z.object({
  query: z.string().min(1, 'Query is required')
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { query } = PerplexityRequestSchema.parse(body)

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar-deep-research',
        messages: [
          {
            role: 'system',
            content: 'You are a market research expert. Provide comprehensive, data-driven insights with specific numbers, trends, and actionable insights. Always include sources and citations where possible.'
          },
          {
            role: 'user',
            content: query
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        top_p: 0.9,
        return_citations: true,
        return_images: false
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Perplexity API error:', response.status, errorData)
      
      if (response.status === 401) {
        return NextResponse.json(
          { error: 'Invalid Perplexity API key' },
          { status: 500 }
        )
      }
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'Perplexity rate limit exceeded' },
          { status: 429 }
        )
      }
      
      return NextResponse.json(
        { error: 'Perplexity service unavailable' },
        { status: 503 }
      )
    }

    const data = await response.json()
    const choice = data.choices?.[0]

    if (!choice?.message?.content) {
      return NextResponse.json(
        { error: 'No content generated from Perplexity' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      content: choice.message.content,
      citations: data.citations || [],
      usage: {
        promptTokens: data.usage?.prompt_tokens || 0,
        completionTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0
      }
    })

  } catch (error) {
    console.error('Perplexity endpoint error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request format', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}