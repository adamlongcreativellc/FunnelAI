"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BorderBeam } from "@/components/magicui/border-beam"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { 
  Brain, 
  Target, 
  BarChart3, 
  Zap, 
  Users, 
  Rocket,
  Search,
  MessageSquare,
  TestTube
} from "lucide-react"

const features = [
  {
    icon: Brain,
    title: "AI Market Research",
    description: "Automatically analyze your market, competitors, and target audience using advanced AI algorithms."
  },
  {
    icon: Users,
    title: "Persona Generation",
    description: "Create detailed customer personas with demographics, psychographics, and behavioral insights."
  },
  {
    icon: Target,
    title: "Content Creation",
    description: "Generate high-converting copy, headlines, and CTAs tailored to your specific audience."
  },
  {
    icon: BarChart3,
    title: "A/B Testing",
    description: "Built-in testing framework to optimize your funnels for maximum conversion rates."
  },
  {
    icon: Zap,
    title: "Real-time Optimization",
    description: "Continuously improve your funnels with AI-powered recommendations and insights."
  },
  {
    icon: Rocket,
    title: "One-Click Publishing",
    description: "Deploy your funnels instantly with optimized hosting and lightning-fast performance."
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Automatic SEO optimization to drive organic traffic to your funnels."
  },
  {
    icon: MessageSquare,
    title: "AI Chat Assistant",
    description: "Get instant help and guidance from our AI assistant throughout the building process."
  },
  {
    icon: TestTube,
    title: "Analytics Dashboard",
    description: "Comprehensive analytics and insights to track performance and ROI."
  }
]

export function Features() {
  return (
    <section id="features" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <AnimatedGradientText>
              Build Better Funnels
            </AnimatedGradientText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides all the tools and insights you need 
            to create high-converting marketing funnels that drive real results.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <BorderBeam
                key={index}
                className="h-full"
                delay={index * 0.2}
              >
                <Card className="h-full border-0 bg-background/50 backdrop-blur-sm">
                  <CardHeader>
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-lg flex items-center justify-center mb-4 shadow-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </BorderBeam>
            )
          })}
        </div>
      </div>
    </section>
  )
}