"use client"

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Search, Filter, MoreHorizontal, TrendingUp, Users, Zap, Edit, Eye } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [projects, setProjects] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`/api/projects?${params.toString()}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProjects(data.data.projects || [])
      } else {
        throw new Error(data.error || 'Failed to fetch projects')
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
      setError(error instanceof Error ? error.message : 'An error occurred')
      setProjects([])
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter])

  // Fetch projects on component mount and when filters change
  useEffect(() => {
    if (status === 'authenticated') {
      fetchProjects()
    }
  }, [status, searchQuery, statusFilter, fetchProjects])

  // Poll for updates on active projects
  useEffect(() => {
    if (status !== 'authenticated') return

    const activeProjects = projects.filter(p => 
      p.status === 'researching' || p.status === 'generating'
    )

    if (activeProjects.length === 0) return

    const interval = setInterval(() => {
      fetchProjects()
    }, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [status, projects, fetchProjects])

  // Redirect to login if not authenticated
  if (status === 'loading') {
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

  const handleCreateProject = () => {
    // For now, redirect to a project creation form
    // In a real app, this would open a modal or navigate to a creation page
    router.push('/projects/new')
  }

  const handleEditProject = (projectId: string) => {
    router.push(`/projects/${projectId}/edit`)
  }

  const handleViewProject = (projectId: string) => {
    router.push(`/projects/${projectId}`)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    // The useEffect will handle the actual search when searchQuery changes
  }

  const handleFilter = (status: string) => {
    setStatusFilter(status === 'all' ? '' : status)
  }

  // Filter projects based on search query and status  
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.industry?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = !statusFilter || project.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'generating': return 'bg-blue-500 animate-pulse'
      case 'researching': return 'bg-yellow-500 animate-pulse'
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

  const toggleCardExpansion = (projectId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(projectId)) {
        newSet.delete(projectId)
      } else {
        newSet.add(projectId)
      }
      return newSet
    })
  }

  const truncateText = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength)
  }


  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container py-6">
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-primary to-secondary" />
              <AnimatedGradientText className="text-xl font-bold">
                FunnelAI
              </AnimatedGradientText>
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link href="/demo" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
              <Badge variant="outline" className="text-xs">
                Dashboard
              </Badge>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">
                Welcome to{" "}
                <AnimatedGradientText>
                  FunnelAI
                </AnimatedGradientText>
              </h1>
              <p className="text-muted-foreground mt-2">
                Build high-converting funnels with AI assistance
              </p>
            </div>
            <ShimmerButton 
              onClick={handleCreateProject}
              disabled={isCreating}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-xl"
              size="lg"
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Create New Funnel
            </ShimmerButton>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <BorderBeam>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Funnels
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projects?.length || 0}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>
          </BorderBeam>

          <BorderBeam delay={0.2}>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg Conversion Rate
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {projects.length > 0 
                    ? `${(projects.reduce((sum, p) => sum + (p.actualConversionRate || 0), 0) / projects.length).toFixed(1)}%`
                    : '0%'
                  }
                </div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter(p => (p.actualConversionRate || 0) > 0).length} active funnels
                </p>
              </CardContent>
            </Card>
          </BorderBeam>

          <BorderBeam delay={0.4}>
            <Card className="border-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(() => {
                    const total = projects.reduce((sum, project) => {
                      return sum + (project.revenueGenerated || 0);
                    }, 0);
                    return total === 0 ? '0' : total.toLocaleString();
                  })()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {projects.filter(p => (p.revenueGenerated || 0) > 0).length} generating revenue
                </p>
              </CardContent>
            </Card>
          </BorderBeam>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search your funnels..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter || 'all'} onValueChange={handleFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="researching">Researching</SelectItem>
              <SelectItem value="generating">Generating</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <BorderBeam key={i}>
                <Card className="border-0">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="flex gap-2">
                        <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse"></div>
                        <div className="h-9 bg-gray-200 rounded flex-1 animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </BorderBeam>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-red-100 rounded-lg mx-auto mb-4 flex items-center justify-center">
                <Zap className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Error Loading Projects</h3>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={fetchProjects}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold mb-2">No funnels yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first AI-powered funnel to get started
              </p>
              <ShimmerButton onClick={handleCreateProject} disabled={isCreating}>
                {isCreating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Your First Funnel
              </ShimmerButton>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <BorderBeam key={project.id} delay={index * 0.1}>
                <Card className="border-0 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                        <div className="mt-1">
                          {(() => {
                            const description = project.description || 'No description provided'
                            const isExpanded = expandedCards.has(project.id)
                            const shouldTruncate = description.length > 120
                            const displayText = isExpanded ? description : truncateText(description)
                            
                            return (
                              <div className="relative">
                                <div className={`text-sm text-muted-foreground ${shouldTruncate && !isExpanded ? 'relative overflow-hidden' : ''}`}>
                                  {displayText}
                                  {shouldTruncate && !isExpanded && <span>...</span>}
                                  {shouldTruncate && !isExpanded && (
                                    <div className="absolute bottom-0 right-0 w-8 h-full bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none" />
                                  )}
                                </div>
                                {shouldTruncate && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      toggleCardExpansion(project.id)
                                    }}
                                    className="text-xs text-primary hover:text-primary/80 transition-colors mt-1 font-medium inline-flex items-center gap-1"
                                  >
                                    {isExpanded ? 'Show less' : 'Read more'}
                                    <svg className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                  </button>
                                )}
                              </div>
                            )
                          })()}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toast.info('More options coming soon!')}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getStatusColor(project.status)}`}></div>
                        <Badge variant="secondary">
                          {getStatusText(project.status)}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <div><strong>Industry:</strong> {project.industry || 'Not specified'}</div>
                        <div><strong>Created:</strong> {new Date(project.createdAt).toLocaleDateString()}</div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleEditProject(project.id)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => handleViewProject(project.id)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </BorderBeam>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}