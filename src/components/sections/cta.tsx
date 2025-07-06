"use client"

import { Button } from "@/components/ui/button"
import { ShimmerButton } from "@/components/magicui/shimmer-button"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BorderBeam } from "@/components/magicui/border-beam"
import { GridPattern } from "@/components/magicui/grid-pattern"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

const benefits = [
  "No credit card required",
  "Free 14-day trial",
  "Cancel anytime",
  "24/7 support included"
]

export function CTA() {
  return (
    <section className="py-20 md:py-32 relative overflow-hidden">
      <GridPattern
        className="opacity-30"
        width={60}
        height={60}
        x={-1}
        y={-1}
        strokeDasharray={0}
      />
      
      <div className="container relative z-10">
        <BorderBeam className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-background via-background/95 to-background/90 backdrop-blur-sm rounded-3xl p-8 md:p-16 text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to{" "}
              <AnimatedGradientText>
                Transform Your Business
              </AnimatedGradientText>
              ?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of businesses that have already increased their 
              conversion rates and revenue with AI-powered funnels.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {benefits.map((benefit, index) => (
                <div key={index} className="flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <ShimmerButton size="xl" className="px-12 py-4" asChild>
                <Link href="/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </ShimmerButton>
              
              <Button variant="outline" size="xl" className="px-12 py-4" asChild>
                <Link href="/demo">
                  Book a Demo
                </Link>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Setup takes less than 5 minutes • No technical knowledge required
            </p>
          </div>
        </BorderBeam>
      </div>
    </section>
  )
}