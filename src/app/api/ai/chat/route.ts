import { streamText } from 'ai'
import { openai } from '@ai-sdk/openai'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { messages, projectId } = await req.json()

    // Get project context if provided
    let projectContext = ''
    if (projectId) {
      // TODO: Fetch project data from database
      projectContext = `\nProject Context: Working on project ${projectId}`
    }

    const result = await streamText({
      model: openai('gpt-4'),
      messages: [
        {
          role: 'system',
          content: `You are FunnelAI Assistant, an expert AI marketing consultant specializing in high-converting funnel optimization. 

Your expertise includes:
- Market research and competitive analysis
- Customer persona development
- Conversion copywriting and content creation
- Funnel strategy and user experience optimization
- A/B testing and performance optimization
- Marketing psychology and persuasion techniques

Guidelines:
- Provide actionable, data-driven advice
- Focus on conversion optimization and user experience
- Use marketing best practices and proven frameworks
- Be specific and provide examples when helpful
- Ask clarifying questions when needed
- Keep responses concise but comprehensive

${projectContext}

Help users build better, higher-converting marketing funnels.`
        },
        ...messages
      ],
      temperature: 0.7,
      maxTokens: 1000,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error('AI chat error:', error)
    return new Response('Error processing request', { status: 500 })
  }
}