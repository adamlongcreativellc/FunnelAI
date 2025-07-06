"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MessageSquare, Search, Target, Rocket } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: MessageSquare,
    title: "Tell Us About Your Business",
    description: "Share your business goals, target audience, and what you're selling. Our AI will understand your unique needs."
  },
  {
    step: "02", 
    icon: Search,
    title: "AI Conducts Market Research",
    description: "Our AI agents research your market, analyze competitors, and identify the best strategies for your industry."
  },
  {
    step: "03",
    icon: Target,
    title: "Generate Personas & Content",
    description: "Create detailed customer personas and generate high-converting copy tailored to your specific audience."
  },
  {
    step: "04",
    icon: Rocket,
    title: "Launch & Optimize",
    description: "Deploy your funnel with one click and let our AI continuously optimize for better performance."
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 bg-muted/30">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Simple Process
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            How{" "}
            <AnimatedGradientText>
              FunnelAI
            </AnimatedGradientText>{" "}
            Works
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From idea to high-converting funnel in just 4 simple steps. 
            Our AI handles the complexity so you can focus on your business.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div key={index} className="relative">
                <BorderBeam delay={index * 0.3}>
                  <Card className="h-full border-0 bg-background">
                    <CardHeader className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="text-sm font-mono text-muted-foreground mb-2">
                        STEP {step.step}
                      </div>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                      <CardDescription className="text-base leading-relaxed">
                        {step.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </BorderBeam>
                
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
        
        <div className="text-center mt-16">
          <p className="text-lg text-muted-foreground mb-8">
            Ready to see it in action?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Badge variant="outline" className="px-4 py-2">
              ⚡ Average setup time: 15 minutes
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              🚀 Deploy in seconds
            </Badge>
            <Badge variant="outline" className="px-4 py-2">
              📈 Optimize automatically
            </Badge>
          </div>
        </div>
      </div>
    </section>
  )
}