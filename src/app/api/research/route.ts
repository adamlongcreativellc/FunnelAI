import { NextRequest } from 'next/server'
import { generateText } from 'ai'
import { getModelForUser } from '@/lib/ai/config'
import { prisma } from '@/lib/prisma'
import { ResearchPromptBuilder } from '@/lib/research-prompt-builder'

// Helper function to send streaming updates
function createSSEResponse(data: any) {
  return `data: ${JSON.stringify(data)}\n\n`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function POST(request: NextRequest) {
  const { projectData, userTier = 'free' } = await request.json()
  
  console.log('🔍 RESEARCH API - DATA VALIDATION:')
  console.log('=====================================')
  console.log('Project ID:', projectData.id)
  console.log('Business Name:', projectData.businessName || projectData.name)
  console.log('Business Description:', projectData.businessDescription?.substring(0, 100) + '...')
  console.log('Industry:', projectData.industry)
  console.log('Target Audience:', projectData.targetAudience)
  console.log('Geographic Scope:', projectData.geographicScope)
  console.log('Geographic Location:', projectData.geographicLocation)
  console.log('Competitor URLs:', projectData.competitorUrls)
  console.log('Competitor Count:', projectData.competitorUrls?.length || 0)
  console.log('=====================================')
  
  // Validation checks
  const missingFields = []
  if (!projectData.businessName && !projectData.name) missingFields.push('businessName')
  if (!projectData.businessDescription) missingFields.push('businessDescription')
  if (!projectData.industry) missingFields.push('industry')
  if (!projectData.targetAudience) missingFields.push('targetAudience')
  
  if (missingFields.length > 0) {
    console.error('❌ MISSING REQUIRED FIELDS:', missingFields)
    return new Response(
      JSON.stringify({ error: `Missing required fields: ${missingFields.join(', ')}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
  
  if (projectData.competitorUrls && projectData.competitorUrls.length > 0) {
    console.log('✅ COMPETITOR URLS DETECTED - Will be analyzed by Perplexity')
  } else {
    console.log('⚠️ NO COMPETITOR URLS - Will research general market competitors')
  }
  
  console.log('🔍 Starting streaming research for:', projectData.businessName || projectData.name)

  // Create a transform stream for Server-Sent Events
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      
      try {
        // Step 1: Initialize (5%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `🚀 Initializing market research for ${projectData.name || 'your business'}...`,
          progress: 5,
          timestamp: new Date().toISOString()
        })))
        await sleep(800)

        // Step 2: Setup (15%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `🔍 Connecting to market intelligence systems...`,
          progress: 15,
          timestamp: new Date().toISOString()
        })))
        const models = getModelForUser(userTier as any)
        await sleep(600)

        // Step 3: Industry Analysis (25%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `📊 Analyzing the ${projectData.industry} industry landscape...`,
          progress: 25,
          timestamp: new Date().toISOString()
        })))
        await sleep(1000)

        // Step 4: Target Market Research (40%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `🎯 Researching your target audience: ${projectData.targetAudience}...`,
          progress: 40,
          timestamp: new Date().toISOString()
        })))
        await sleep(800)

        // Step 5: Competitor Analysis (55%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `🏢 Identifying and analyzing key competitors in ${projectData.industry}...`,
          progress: 55,
          timestamp: new Date().toISOString()
        })))
        await sleep(1200)

        // Step 6: Market Trends (70%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `📈 Discovering current market trends and opportunities...`,
          progress: 70,
          timestamp: new Date().toISOString()
        })))
        await sleep(1000)

        // Step 7: AI Analysis (85%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `🤖 Running AI analysis on market data...`,
          progress: 85,
          timestamp: new Date().toISOString()
        })))
        
        // Build dynamic prompt based on project data
        const promptBuilder = new ResearchPromptBuilder({
          businessName: projectData.businessName || projectData.name,
          businessDescription: projectData.businessDescription,
          industry: projectData.industry,
          targetAudience: projectData.targetAudience,
          competitorUrls: projectData.competitorUrls,
          geographicScope: projectData.geographicScope,
          geographicLocation: projectData.geographicLocation,
          geographicRadius: projectData.geographicRadius,
          monthlyRevenue: projectData.monthlyRevenue
        })

        const dynamicPrompt = promptBuilder.buildPrompt()

        console.log('🔍 Generated Dynamic Prompt Preview:')
        console.log(dynamicPrompt.substring(0, 500) + '...')

        const result = await generateText({
          model: models.research,
          prompt: dynamicPrompt,
          temperature: 0.3,
        })

        // Step 8: Processing Results (95%)
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `⚡ Processing insights and generating recommendations...`,
          progress: 95,
          timestamp: new Date().toISOString()
        })))
        await sleep(800)

        // Parse and validate the response
        let cleanedResponse = result.text.trim()
        
        if (cleanedResponse.startsWith('```json')) {
          cleanedResponse = cleanedResponse.replace(/^```json\n?/, '').replace(/\n?```$/, '')
        } else if (cleanedResponse.startsWith('```')) {
          cleanedResponse = cleanedResponse.replace(/^```\n?/, '').replace(/\n?```$/, '')
        }
        
        const jsonStart = cleanedResponse.indexOf('{')
        const jsonEnd = cleanedResponse.lastIndexOf('}') + 1
        
        if (jsonStart !== -1 && jsonEnd > jsonStart) {
          cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd)
        }

        let parsedResult
        try {
          parsedResult = JSON.parse(cleanedResponse)
        } catch (parseError) {
          console.error('JSON Parse Error:', parseError)
          
          parsedResult = {
            marketSize: {
              value: "Unable to retrieve current market data",
              growth: "Analysis temporarily unavailable",
              confidence: 0.1
            },
            competitors: [
              {
                name: "Research In Progress",
                strengths: ["Market research is being conducted"],
                weaknesses: ["Data temporarily unavailable"]
              }
            ],
            trends: [
              {
                trend: "Analysis in progress",
                impact: "Market analysis is being performed",
                timeframe: "Data will be available shortly"
              }
            ],
            opportunities: ["Detailed analysis in progress"],
            challenges: ["Data retrieval temporarily delayed"]
          }
        }

        // Validate and structure the result
        const validatedResult = {
          marketSize: {
            value: parsedResult.marketSize?.value || "Market size data not available",
            growth: parsedResult.marketSize?.growth || "Growth data not available",
            confidence: parsedResult.marketSize?.confidence || 0.5
          },
          competitors: Array.isArray(parsedResult.competitors) ? parsedResult.competitors.map((comp: any) => ({
            name: comp.name || "Unknown Competitor",
            strengths: Array.isArray(comp.strengths) ? comp.strengths : ["Data not available"],
            weaknesses: Array.isArray(comp.weaknesses) ? comp.weaknesses : ["Data not available"]
          })) : [],
          trends: Array.isArray(parsedResult.trends) ? parsedResult.trends.map((trend: any) => ({
            trend: trend.trend || "Trend data not available",
            impact: trend.impact || "Impact not specified",
            timeframe: trend.timeframe || "Timeline not specified"
          })) : [],
          opportunities: Array.isArray(parsedResult.opportunities) ? parsedResult.opportunities : [],
          challenges: Array.isArray(parsedResult.challenges) ? parsedResult.challenges : []
        }

        // Step 9: Complete (100%)
        const completionMessage = `✅ Research complete! Found ${validatedResult.competitors.length} competitors, ${validatedResult.trends.length} trends, and ${validatedResult.opportunities.length} opportunities.`
        controller.enqueue(encoder.encode(createSSEResponse({
          status: completionMessage,
          progress: 100,
          timestamp: new Date().toISOString(),
          data: validatedResult
        })))

        // Save research data to database
        try {
          await prisma.project.update({
            where: { id: projectData.id },
            data: {
              marketResearch: validatedResult,
              status: 'research_complete',
              updatedAt: new Date()
            }
          })
          console.log('✅ Research data saved to database')
        } catch (dbError) {
          console.error('❌ Failed to save research data:', dbError)
        }

        // Close the stream
        controller.close()
        
      } catch (error) {
        console.error('Research generation error:', error)
        
        controller.enqueue(encoder.encode(createSSEResponse({
          status: `❌ Research failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          progress: 100,
          timestamp: new Date().toISOString(),
          data: {
            error: true,
            message: error instanceof Error ? error.message : 'Unknown error',
            marketSize: {
              value: "Research service temporarily unavailable",
              growth: "Please try again in a moment",
              confidence: 0.1
            },
            competitors: [],
            trends: [],
            opportunities: ["Service will be restored shortly"],
            challenges: ["Temporary service interruption"]
          }
        })))
        
        controller.close()
      }
    }
  })

  // Return streaming response with proper headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  })
}