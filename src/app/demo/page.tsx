"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ShimmerButton } from '@/components/magicui/shimmer-button'
import { BorderBeam } from '@/components/magicui/border-beam'
import { AnimatedGradientText } from '@/components/magicui/animated-gradient-text'
import { AIChat } from '@/components/ai/ai-chat'
import { Badge } from '@/components/ui/badge'
import { useAIGeneration, useContentGeneration } from '@/hooks/use-ai-generation'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Users, 
  FileText, 
  TrendingUp, 
  Zap, 
  Target,
  Sparkles,
  Rocket,
  MessageSquare
} from 'lucide-react'

export default function DemoPage() {
  const [demoForm, setDemoForm] = useState({
    businessName: 'TechFlow SaaS',
    businessDescription: 'A project management tool for remote teams',
    industry: 'Software & Technology',
    targetAudience: 'Remote teams and freelancers who need better project organization',
    businessGoals: ['Increase trial signups', 'Reduce churn rate', 'Improve onboarding'],
    offer: {
      name: 'TechFlow Pro',
      description: '14-day free trial with full access to premium features',
      features: ['Unlimited projects', 'Team collaboration', 'Advanced analytics'],
      benefits: ['Save 10+ hours per week', 'Increase team productivity', 'Better project visibility']
    }
  })

  const { generateWithProgress, isGenerating, progress } = useAIGeneration()
  const { generateContent, isGenerating: isGeneratingContent } = useContentGeneration()

  const handleDemoGeneration = async () => {
    try {
      await generateWithProgress({
        projectId: 'demo-project',
        ...demoForm
      })
    } catch (error) {
      console.error('Demo generation failed:', error)
    }
  }

  const handleContentDemo = () => {
    generateContent({
      type: 'headlines',
      persona: {
        name: 'Tech-Savvy Manager',
        demographics: { age: '30-45', income: '$60k-$100k' },
        painPoints: ['Too many tools', 'Poor team coordination']
      },
      offer: demoForm.offer
    })
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Navigation */}
      <div className="border-b bg-background/95 backdrop-blur">
        <div className="container py-4">
          {/* Navigation Bar */}
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
              <Link href="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Dashboard
              </Link>
              <Badge variant="outline" className="text-xs">
                Demo Mode
              </Badge>
            </nav>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <ShimmerButton asChild>
                <Link href="/signup">Get Started</Link>
              </ShimmerButton>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">
              Experience{" "}
              <AnimatedGradientText>
                AI-Powered
              </AnimatedGradientText>{" "}
              Funnel Building
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how our multi-agent AI system researches your market, creates personas, 
              and generates high-converting funnel content in real-time.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Form */}
          <div className="space-y-6">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Try AI Funnel Generation
                  </CardTitle>
                  <CardDescription>
                    Enter your business details and watch our AI agents work their magic
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Business Name</label>
                    <Input
                      value={demoForm.businessName}
                      onChange={(e) => setDemoForm(prev => ({ ...prev, businessName: e.target.value }))}
                      placeholder="Your business name"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Business Description</label>
                    <Textarea
                      value={demoForm.businessDescription}
                      onChange={(e) => setDemoForm(prev => ({ ...prev, businessDescription: e.target.value }))}
                      placeholder="Describe what your business does"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Target Audience</label>
                    <Textarea
                      value={demoForm.targetAudience}
                      onChange={(e) => setDemoForm(prev => ({ ...prev, targetAudience: e.target.value }))}
                      placeholder="Who are your ideal customers?"
                      rows={2}
                    />
                  </div>

                  {/* Generation Progress */}
                  {isGenerating && progress && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{progress.message}</span>
                        <span>{Math.round(progress.progress)}%</span>
                      </div>
                      <Progress value={progress.progress} />
                      {progress.estimatedTimeRemaining && (
                        <p className="text-xs text-muted-foreground">
                          Estimated time remaining: {progress.estimatedTimeRemaining}s
                        </p>
                      )}
                    </div>
                  )}

                  <ShimmerButton 
                    onClick={handleDemoGeneration}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        AI Agents Working...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Generate AI Funnel
                      </>
                    )}
                  </ShimmerButton>
                </CardContent>
              </Card>
            </BorderBeam>

            {/* AI Capabilities */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Brain, title: 'Market Research', desc: 'AI analyzes your industry' },
                { icon: Users, title: 'Persona Creation', desc: 'Detailed customer profiles' },
                { icon: FileText, title: 'Content Generation', desc: 'High-converting copy' },
                { icon: TrendingUp, title: 'Optimization', desc: 'Performance improvements' }
              ].map((item, index) => (
                <BorderBeam key={index} delay={index * 0.1}>
                  <Card className="border-0 text-center p-4">
                    <item.icon className="w-8 h-8 mx-auto mb-2 text-primary" />
                    <h3 className="font-semibold text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </Card>
                </BorderBeam>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 gap-3">
              <Button 
                variant="outline" 
                onClick={handleContentDemo}
                disabled={isGeneratingContent}
                className="justify-start"
              >
                <Target className="w-4 h-4 mr-2" />
                Generate Headlines for Landing Page
              </Button>
              
              <Button 
                variant="outline" 
                disabled={true}
                className="justify-start opacity-60"
              >
                <Zap className="w-4 h-4 mr-2" />
                A/B Testing Recommendations (Coming Soon)
              </Button>
            </div>
          </div>

          {/* AI Chat Demo */}
          <div className="space-y-6">
            <div className="text-center">
              <Badge variant="secondary" className="mb-4">
                <MessageSquare className="w-4 h-4 mr-1" />
                Live AI Assistant
              </Badge>
              <h2 className="text-2xl font-bold mb-2">
                Chat with{" "}
                <AnimatedGradientText>
                  FunnelAI
                </AnimatedGradientText>
              </h2>
              <p className="text-muted-foreground">
                Get instant marketing advice and funnel optimization tips
              </p>
            </div>
            
            <div className="h-[600px]">
              <AIChat className="h-full" />
            </div>
          </div>
        </div>

        {/* Demo Results Section */}
        {progress?.stage === 'complete' && (
          <div className="mt-12">
            <BorderBeam>
              <Card className="border-0">
                <CardHeader>
                  <CardTitle className="text-2xl text-center">
                    🎉 Your AI-Generated Funnel is Ready!
                  </CardTitle>
                  <CardDescription className="text-center">
                    Here's what our AI agents discovered and created for your business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Market Research</h3>
                      <p className="text-sm text-muted-foreground">
                        Analyzed 500+ data points about your industry and competitors
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Customer Personas</h3>
                      <p className="text-sm text-muted-foreground">
                        Created 3 detailed personas with demographics and pain points
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg mx-auto mb-3 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold mb-2">Funnel Content</h3>
                      <p className="text-sm text-muted-foreground">
                        Generated 5 landing page variations with A/B testing strategy
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-8 text-center space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Button size="lg" variant="outline">
                        View Full Funnel Report
                      </Button>
                      <ShimmerButton size="lg" asChild>
                        <Link href="/signup">
                          Start Building Your Funnel
                        </Link>
                      </ShimmerButton>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Ready to create real funnels? Sign up to unlock full AI capabilities
                    </p>
                  </div>
                </CardContent>
              </Card>
            </BorderBeam>
          </div>
        )}
      </div>
    </div>
  )
}