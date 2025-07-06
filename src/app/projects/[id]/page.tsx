"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { Loader2, ArrowLeft, Edit, Eye, Share, Download, BarChart3, Users, Target, TrendingUp, Globe, Zap } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import jsPDF from 'jspdf'
import { updateProjectStatus, ProjectStatus } from '@/lib/project-status'
import type { Project, MarketResearch, CustomerPersona, MarketingStrategy, FunnelContent, ContentCalendar, FunnelStage } from '@/types'

export default function ProjectViewPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [research, setResearch] = useState<any>(null)
  const [researchLoading, setResearchLoading] = useState(false)
  const [researchProgress, setResearchProgress] = useState(0)
  const [researchStatus, setResearchStatus] = useState('')
  const [researchStartTime, setResearchStartTime] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchProject = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const response = await fetch(`/api/projects/${params.id}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProject(data.data)
        
        // Load existing research data if available
        if (data.data.marketResearch) {
          try {
            setResearch(data.data.marketResearch)
            console.log('✅ Loaded existing research data')
          } catch (parseError) {
            console.error('❌ Failed to parse research data:', parseError)
          }
        }
      } else {
        throw new Error(data.error || 'Failed to fetch project')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }, [params.id])

  // Streaming research function
  const generateResearch = async () => {
    setResearchLoading(true)
    setResearchProgress(0)
    setResearchStatus('Initializing...')
    setResearch(null)
    setResearchStartTime(Date.now())
    
    // Update project status to researching
    if (project) {
      try {
        await updateProjectStatus(project.id, ProjectStatus.RESEARCHING)
      } catch (error) {
        console.error('Failed to update status:', error)
      }
    }
    
    // Create abort controller for canceling
    abortControllerRef.current = new AbortController()
    
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          projectData: project,
          userTier: 'free' // Will be dynamic later
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const reader = response.body?.getReader()
      if (!reader) {
        throw new Error('No response stream available')
      }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('✅ Stream completed')
          break
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true })
        
        // Process complete messages (ending with \n\n)
        const messages = buffer.split('\n\n')
        buffer = messages.pop() || '' // Keep incomplete message in buffer

        for (const message of messages) {
          if (message.startsWith('data: ')) {
            try {
              const data = JSON.parse(message.slice(6)) // Remove 'data: ' prefix
              console.log('📦 Received update:', data)
              
              setResearchProgress(data.progress)
              setResearchStatus(data.status)
              
              // If we have final data, set it
              if (data.data && data.progress === 100) {
                setResearch(data.data)
                console.log('✅ Final research data:', data.data)
                
                // Update project status to research complete
                if (project) {
                  try {
                    await updateProjectStatus(project.id, ProjectStatus.RESEARCH_COMPLETE)
                  } catch (error) {
                    console.error('Failed to update completion status:', error)
                  }
                }
              }
            } catch (parseError) {
              console.error('❌ Failed to parse update:', parseError, message)
            }
          }
        }
      }

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('🛑 Research was cancelled')
        setResearchStatus('Research cancelled')
      } else {
        console.error('❌ Research generation failed:', error)
        setResearchStatus(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
        
        // Set fallback data on error
        setResearch({
          marketSize: {
            value: "Research temporarily unavailable",
            growth: "Please try again",
            confidence: 0.1
          },
          competitors: [],
          trends: [],
          opportunities: ["Please try again later"],
          challenges: ["Service temporarily unavailable"]
        })
      }
    } finally {
      setResearchLoading(false)
      abortControllerRef.current = null
    }
  }

  // Cancel research function
  const cancelResearch = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
  }

  // Time elapsed helper
  const getElapsedTime = () => {
    if (!researchStartTime) return '0s'
    const elapsed = Math.floor((Date.now() - researchStartTime) / 1000)
    return elapsed < 60 ? `${elapsed}s` : `${Math.floor(elapsed / 60)}m ${elapsed % 60}s`
  }

  // Progress Component
  const ResearchProgress = () => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-blue-900">AI Market Research in Progress</h4>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-blue-600 font-medium">{researchProgress}%</span>
          <span className="text-xs text-blue-500">{getElapsedTime()}</span>
          <Button
            onClick={cancelResearch}
            variant="outline"
            size="sm"
            className="text-xs px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-blue-100 rounded-full h-3 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${researchProgress}%` }}
          />
        </div>
      </div>
      
      {/* Status Message */}
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {researchProgress === 100 ? (
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          )}
        </div>
        <p className="text-blue-800 font-medium">{researchStatus}</p>
      </div>
      
      {/* Progress Steps Visualization */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        {[
          { step: 'Initialize', progress: 15 },
          { step: 'Industry Analysis', progress: 40 },
          { step: 'Competitors', progress: 70 },
          { step: 'Insights', progress: 100 }
        ].map((item, index) => (
          <div key={index} className="text-center">
            <div className={`w-full h-2 rounded-full mb-1 ${
              researchProgress >= item.progress 
                ? 'bg-blue-500' 
                : 'bg-blue-100'
            }`} />
            <span className={`text-xs ${
              researchProgress >= item.progress 
                ? 'text-blue-700 font-medium' 
                : 'text-blue-400'
            }`}>
              {item.step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )

  // Export to PDF function
  const exportToPDF = () => {
    if (!research || !project) return

    const doc = new jsPDF()
    
    // Title
    doc.setFontSize(20)
    doc.text(`Market Research Report`, 20, 30)
    
    doc.setFontSize(16)
    doc.text(`${project.name}`, 20, 45)
    
    doc.setFontSize(12)
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)
    
    // Market Size
    doc.setFontSize(14)
    doc.text('Market Size & Growth', 20, 75)
    doc.setFontSize(10)
    const marketText = `${research.marketSize.value}\nGrowth: ${research.marketSize.growth}`
    doc.text(marketText, 20, 85)
    
    // Competitors
    doc.setFontSize(14)
    doc.text('Key Competitors', 20, 110)
    doc.setFontSize(10)
    let yPos = 120
    research.competitors.slice(0, 3).forEach((comp: any, index: number) => {
      doc.text(`${index + 1}. ${comp.name}`, 20, yPos)
      doc.text(`Strengths: ${comp.strengths.join(', ')}`, 25, yPos + 8)
      doc.text(`Weaknesses: ${comp.weaknesses.join(', ')}`, 25, yPos + 16)
      yPos += 30
    })
    
    // Opportunities
    doc.setFontSize(14)
    doc.text('Opportunities', 20, yPos + 10)
    doc.setFontSize(10)
    yPos += 20
    research.opportunities.slice(0, 5).forEach((opp: string, index: number) => {
      doc.text(`• ${opp}`, 20, yPos)
      yPos += 8
    })
    
    // Save the PDF
    doc.save(`${project.name}-research-report.pdf`)
  }

  useEffect(() => {
    if (status === 'authenticated' && params.id) {
      fetchProject()
    }
  }, [status, params.id, fetchProject])

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (status === 'unauthenticated') {
    router.push('/login')
    return null
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Zap className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Error Loading Project</h3>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={fetchProject}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">Project Not Found</h3>
            <p className="text-muted-foreground mb-6">The project you&apos;re looking for doesn&apos;t exist.</p>
            <Button asChild>
              <Link href="/dashboard">Back to Dashboard</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'generating': return 'bg-blue-500 animate-pulse'
      case 'researching': return 'bg-yellow-500'
      case 'draft': return 'bg-gray-500'
      case 'archived': return 'bg-gray-300'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Ready to Launch'
      case 'generating': return 'AI Working...'
      case 'researching': return 'Researching Market'
      case 'draft': return 'Draft'
      case 'archived': return 'Archived'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                  <Badge variant="secondary">
                    {getStatusText(project.status)}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {project.industry}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={exportToPDF}
                disabled={!research}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button asChild>
                <Link href={`/projects/${project.id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Project Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BorderBeam>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Conversion Rate
                </CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {project.actualConversionRate || project.estimatedConversionRate || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {project.actualConversionRate ? 'Actual' : 'Estimated'} conversion rate
                </p>
              </CardContent>
            </Card>
          </BorderBeam>

          <BorderBeam delay={0.1}>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Visitors
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{project.totalVisitors || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {project.totalConversions || 0} conversions
                </p>
              </CardContent>
            </Card>
          </BorderBeam>

          <BorderBeam delay={0.2}>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${project.revenueGenerated || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Total revenue generated
                </p>
              </CardContent>
            </Card>
          </BorderBeam>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="research">Research</TabsTrigger>
            <TabsTrigger value="personas">Personas</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="pages">Pages</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BorderBeam>
                <Card className="border-0">
                  <CardHeader>
                    <CardTitle>Project Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <strong>Business:</strong> {project.name || 'Not specified'}
                    </div>
                    <div>
                      <strong>Description:</strong> {project.description || "Not specified"}
                    </div>
                    <div>
                      <strong>Industry:</strong> {project.industry}
                    </div>
                    <div>
                      <strong>Target Audience:</strong> {project.targetAudience}
                    </div>
                    <div>
                      <strong>Business Goals:</strong>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {/* @ts-ignore */}
                        {project.businessGoals?.map((goal: string, index: number) => (
                          <Badge key={index} variant="outline">{goal}</Badge>
                        ))}
                      </div>
                    </div>

                    {/* Research Scope */}
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-3">Research Scope</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-sm font-medium text-gray-600">Geographic Scope:</span>
                            <span className="ml-2 text-sm text-gray-800 capitalize">
                              {project.geographicScope || 'Auto-detect'}
                            </span>
                          </div>
                          {project.geographicLocation && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Location:</span>
                              <span className="ml-2 text-sm text-gray-800">
                                {project.geographicLocation}
                                {project.geographicRadius && ` (${project.geographicRadius} miles)`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Competitors section */}
                    {project.competitorUrls && project.competitorUrls.length > 0 && (
                      <div className="mt-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          Competitors to Analyze ({project.competitorUrls.length})
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4">
                          {project.competitorUrls.map((url: string, index: number) => (
                            <div key={index} className="flex items-center space-x-2 mb-2">
                              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                              <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                {url}
                              </a>
                            </div>
                          ))}
                          <p className="text-xs text-blue-600 mt-2">
                            ✓ These competitors will be specifically analyzed by Perplexity AI
                          </p>
                        </div>
                      </div>
                    )}

                    <div>
                      <strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                    {project.publishedAt && (
                      <div>
                        <strong>Published:</strong> {new Date(project.publishedAt).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </BorderBeam>

              <BorderBeam delay={0.1}>
                <Card className="border-0">
                  <CardHeader>
                    <CardTitle>Funnel Performance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {project.status === 'completed' ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Landing Page Views</span>
                          <span className="font-semibold">{project.totalVisitors || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Conversions</span>
                          <span className="font-semibold">{project.totalConversions || 0}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Conversion Rate</span>
                          <span className="font-semibold">{project.actualConversionRate || 0}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Revenue</span>
                          <span className="font-semibold">${project.revenueGenerated || 0}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {project.status === 'researching' && 'AI is researching your market...'}
                          {project.status === 'generating' && 'AI is generating your funnel...'}
                          {project.status === 'draft' && 'Funnel is in draft mode. Publish to start collecting data.'}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </BorderBeam>
            </div>
          </TabsContent>

          <TabsContent value="research">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Market Research</CardTitle>
                  <CardDescription>
                    AI-powered market analysis and competitor research
                  </CardDescription>
                </CardHeader>
                
                {/* Guidance message for when no research exists */}
                {!research && !researchLoading && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mx-6 mb-6">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="text-yellow-800 font-medium">Start by generating market research to unlock the next steps in your funnel creation process.</span>
                    </div>
                  </div>
                )}
                
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Market Research</h3>
                    {!researchLoading && (
                      <Button
                        onClick={generateResearch}
                        className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      >
                        {research ? 'Refresh Research' : 'Generate Research'}
                      </Button>
                    )}
                  </div>

                  {/* Show progress component while loading */}
                  {researchLoading && <ResearchProgress />}

                  {/* Show results when complete */}
                  {research && !researchLoading && (
                    <div className="space-y-6">
                      {/* Success Banner */}
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-green-800 font-medium">
                            Research completed successfully! Analysis based on current market data.
                          </span>
                        </div>
                      </div>

                      {/* Market Size */}
                      {research.marketSize && (
                        <div className="bg-blue-50 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                            📊 Market Size & Growth
                            <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {Math.round(research.marketSize.confidence * 100)}% confidence
                            </span>
                          </h4>
                          <p className="text-blue-800 mb-2">{research.marketSize.value}</p>
                          <p className="text-sm text-blue-600">📈 Growth: {research.marketSize.growth}</p>
                        </div>
                      )}

                      {/* Competitors */}
                      {research.competitors && research.competitors.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                            🏢 Key Competitors
                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              {research.competitors.length} found
                            </span>
                          </h4>
                          <div className="grid gap-4">
                            {research.competitors.slice(0, 3).map((competitor: any, index: number) => (
                              <div key={index} className="border border-gray-200 rounded-lg p-4">
                                <h5 className="font-medium text-gray-900 mb-2">{competitor.name}</h5>
                                <div className="grid md:grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-sm text-green-700 font-medium mb-1">✅ Strengths:</p>
                                    <ul className="text-sm text-green-600 space-y-1">
                                      {competitor.strengths?.slice(0, 3).map((strength: string, i: number) => (
                                        <li key={i}>• {strength}</li>
                                      ))}
                                    </ul>
                                  </div>
                                  <div>
                                    <p className="text-sm text-red-700 font-medium mb-1">⚠️ Weaknesses:</p>
                                    <ul className="text-sm text-red-600 space-y-1">
                                      {competitor.weaknesses?.slice(0, 3).map((weakness: string, i: number) => (
                                        <li key={i}>• {weakness}</li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Trends */}
                      {research.trends && research.trends.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-3">📈 Market Trends</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {research.trends.slice(0, 4).map((trend: any, index: number) => (
                              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <h5 className="font-medium text-purple-900 mb-2">{trend.trend}</h5>
                                <p className="text-sm text-purple-700 mb-2">{trend.impact}</p>
                                <p className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded inline-block">
                                  📅 {trend.timeframe}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Opportunities & Challenges */}
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Opportunities */}
                        {research.opportunities && research.opportunities.length > 0 && (
                          <div>
                            <h4 className="font-medium text-green-700 mb-3 flex items-center">
                              🎯 Opportunities
                              <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                                {research.opportunities.length} identified
                              </span>
                            </h4>
                            <ul className="space-y-2">
                              {research.opportunities.slice(0, 5).map((opportunity: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-green-500 mt-1">✅</span>
                                  <span className="text-gray-700 text-sm">{opportunity}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Challenges */}
                        {research.challenges && research.challenges.length > 0 && (
                          <div>
                            <h4 className="font-medium text-orange-700 mb-3 flex items-center">
                              ⚠️ Challenges
                              <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                                {research.challenges.length} identified
                              </span>
                            </h4>
                            <ul className="space-y-2">
                              {research.challenges.slice(0, 5).map((challenge: string, index: number) => (
                                <li key={index} className="flex items-start space-x-2">
                                  <span className="text-orange-500 mt-1">⚠️</span>
                                  <span className="text-gray-700 text-sm">{challenge}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      {/* Next Step CTA */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mt-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                            </div>
                            <div>
                              <h3 className="font-semibold text-blue-900">Ready for the next step?</h3>
                              <p className="text-blue-700">Define your customer personas based on this comprehensive research</p>
                            </div>
                          </div>
                          <Button 
                            onClick={() => router.push(`/projects/${project.id}/personas`)}
                            className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2"
                          >
                            <span>Create Personas</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Empty state when no research and not loading */}
                  {!research && !researchLoading && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Ready for AI Market Research</h4>
                      <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Generate comprehensive market analysis, competitor insights, and growth opportunities for your funnel strategy.
                      </p>
                      <Button
                        onClick={generateResearch}
                        className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
                      >
                        🚀 Start Research Analysis
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BorderBeam>
          </TabsContent>

          <TabsContent value="personas">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Target Personas</CardTitle>
                  <CardDescription>
                    AI-generated customer personas based on market research
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.personas && project.personas.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {project.personas?.map((persona: CustomerPersona, index: number) => (
                        <div key={index} className="p-6 border rounded-lg space-y-4">
                          <div>
                            <h4 className="font-semibold text-lg">{persona.name}</h4>
                            <p className="text-sm text-muted-foreground">{persona.title}</p>
                          </div>
                          
                          <div>
                            <h5 className="font-medium mb-2">Demographics</h5>
                            <div className="text-sm space-y-1">
                              <p>Age: {persona.demographics?.age}</p>
                              <p>Location: {persona.demographics?.location}</p>
                              <p>Income: {persona.demographics?.income}</p>
                              <p>Education: {persona.demographics?.education}</p>
                            </div>
                          </div>
                          
                          {persona.painPoints?.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Pain Points</h5>
                              <ul className="text-sm list-disc list-inside space-y-1">
                                {persona.psychographics.painPoints.map((pain: string, i: number) => (
                                  <li key={i}>{pain}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {persona.motivations?.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Motivations</h5>
                              <ul className="text-sm list-disc list-inside space-y-1">
                                {persona.psychographics.motivations.map((motivation: string, i: number) => (
                                  <li key={i}>{motivation}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          
                          {persona.preferredChannels?.length > 0 && (
                            <div>
                              <h5 className="font-medium mb-2">Preferred Channels</h5>
                              <div className="flex flex-wrap gap-2">
                                {persona.preferredChannels.map((channel: string, i: number) => (
                                  <Badge key={i} variant="outline">{channel}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {project.status === 'generating' 
                          ? 'AI is creating target personas...' 
                          : 'Target personas not available yet'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BorderBeam>
          </TabsContent>

          <TabsContent value="content">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Content Variations</CardTitle>
                  <CardDescription>
                    AI-generated content for different funnel stages
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.contentVariations ? (
                    <div className="space-y-6">
                      {Object.entries(project.contentVariations || {}).map(([stage, content]: [string, any]) => (
                        <div key={stage} className="space-y-4">
                          <h4 className="font-semibold capitalize">{stage.replace(/([A-Z])/g, ' $1').trim()}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Array.isArray(content) ? content.map((variation: any, index: number) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h5 className="font-medium mb-2">Variation {index + 1}</h5>
                                <div className="space-y-2 text-sm">
                                  {variation.headline && (
                                    <div>
                                      <strong>Headline:</strong> {variation.headline}
                                    </div>
                                  )}
                                  {variation.subheadline && (
                                    <div>
                                      <strong>Subheadline:</strong> {variation.subheadline}
                                    </div>
                                  )}
                                  {variation.body && (
                                    <div>
                                      <strong>Body:</strong> {variation.body}
                                    </div>
                                  )}
                                  {variation.cta && (
                                    <div>
                                      <strong>Call-to-Action:</strong> {variation.cta}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )) : (
                              <div className="p-4 border rounded-lg">
                                <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(content, null, 2)}</pre>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Eye className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {project.status === 'generating' 
                          ? 'AI is generating content variations...' 
                          : 'Content variations not available yet'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BorderBeam>
          </TabsContent>

          <TabsContent value="strategy">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Funnel Strategy</CardTitle>
                  <CardDescription>
                    AI-recommended funnel strategy and optimization plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.funnelStrategy ? (
                    <div className="space-y-6">
                      {project.funnelStrategy.stages?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-4">Funnel Stages</h4>
                          <div className="space-y-4">
                            {project.strategy?.funnelStrategy.map((stage: FunnelStage, index: number) => (
                              <div key={index} className="p-4 border rounded-lg">
                                <h5 className="font-medium">{stage.name}</h5>
                                <p className="text-sm text-muted-foreground mt-1">{stage.description}</p>
                                {stage.objectives?.length > 0 && (
                                  <div className="mt-3">
                                    <span className="text-sm font-medium">Objectives:</span>
                                    <ul className="text-sm ml-4 mt-1">
                                      {stage.metrics.map((obj: string, i: number) => (
                                        <li key={i}>• {obj}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {project.funnelStrategy.recommendations?.length > 0 && (
                        <div>
                          <h4 className="font-semibold mb-2">Strategic Recommendations</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {project.strategy?.recommendations.nextSteps.map((rec: string, index: number) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {project.status === 'generating' 
                          ? 'AI is creating funnel strategy...' 
                          : 'Funnel strategy not available yet'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BorderBeam>
          </TabsContent>

          <TabsContent value="pages">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle>Funnel Pages</CardTitle>
                  <CardDescription>
                    Live funnel pages with AI-generated content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {project.status === 'completed' ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Landing Page</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Main entry point for your funnel
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                        
                        <div className="p-4 border rounded-lg">
                          <h4 className="font-semibold mb-2">Thank You Page</h4>
                          <p className="text-sm text-muted-foreground mb-4">
                            Post-conversion confirmation page
                          </p>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </Button>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t">
                        <h4 className="font-semibold mb-2">Funnel URL</h4>
                        <div className="flex items-center gap-2">
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            https://yourfunnel.com/{project.id}
                          </code>
                          <Button size="sm" variant="outline">
                            <Share className="w-4 h-4 mr-2" />
                            Copy Link
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Globe className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">
                        {project.status === 'generating' 
                          ? 'AI is generating funnel pages...' 
                          : 'Funnel pages not available yet'
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </BorderBeam>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}