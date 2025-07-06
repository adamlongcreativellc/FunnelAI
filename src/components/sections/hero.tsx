"use client"

import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BorderBeam } from "@/components/magicui/border-beam"
import { DotPattern } from "@/components/magicui/dot-pattern"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Sparkles, TrendingUp } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <DotPattern
        className="opacity-50"
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
      />
      
      <div className="container relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-8 px-4 py-2">
            <Sparkles className="w-4 h-4 mr-2" />
            AI-Powered Funnel Generation
          </Badge>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Build High-Converting{" "}
            <AnimatedGradientText>
              AI Funnels
            </AnimatedGradientText>{" "}
            in Minutes
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
            Transform your business ideas into profitable marketing funnels with our 
            AI-powered platform. Research, create, and optimize automatically.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <ShimmerButton size="xl" className="px-8 py-4 bg-gradient-to-r from-blue-600 via-blue-500 to-purple-600 hover:from-blue-700 hover:via-blue-600 hover:to-purple-700 text-white shadow-xl" asChild>
              <Link href="/signup" className="flex items-center">
                Start Building Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </ShimmerButton>
            
            <Button variant="outline" size="xl" className="px-8 py-4" asChild>
              <Link href="#demo" className="flex items-center">
                Watch Demo
                <TrendingUp className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10x</div>
              <div className="text-sm text-muted-foreground">Faster Funnel Creation</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">85%</div>
              <div className="text-sm text-muted-foreground">Higher Conversion Rates</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$2M+</div>
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
            </div>
          </div>
        </div>
        
        <div className="mt-20 relative max-w-5xl mx-auto">
          <BorderBeam className="p-4">
            <div className="rounded-lg overflow-hidden">
              <div className="bg-gradient-to-br from-background via-background/50 to-background h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-lg mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    Interactive Demo Coming Soon
                  </p>
                </div>
              </div>
            </div>
          </BorderBeam>
        </div>
      </div>
    </section>
  )
}