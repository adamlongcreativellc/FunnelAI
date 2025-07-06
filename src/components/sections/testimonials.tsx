"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AnimatedGradientText } from "@/components/magicui/animated-gradient-text"
import { BorderBeam } from "@/components/magicui/border-beam"
import { Badge } from "@/components/ui/badge"
import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Sarah Chen",
    role: "E-commerce Founder",
    company: "StyleHub",
    content: "FunnelAI transformed our conversion rates from 2% to 12% in just one month. The AI-generated personas were incredibly accurate and the automated optimization is game-changing.",
    rating: 5,
    revenue: "$50k increase in monthly revenue"
  },
  {
    name: "Mike Rodriguez", 
    role: "Marketing Director",
    company: "TechStart Inc",
    content: "What used to take our team weeks to research and build now happens in hours. The quality of the AI-generated content rivals our best copywriters.",
    rating: 5,
    revenue: "300% ROI improvement"
  },
  {
    name: "Emily Watson",
    role: "Course Creator",
    company: "Learn Digital",
    content: "The A/B testing feature alone has increased our course sales by 85%. FunnelAI understands our audience better than we do sometimes!",
    rating: 5,
    revenue: "$25k first funnel"
  },
  {
    name: "David Park",
    role: "Agency Owner",
    company: "Growth Labs",
    content: "We've scaled our agency from 5 to 50 clients using FunnelAI. The time savings and results quality have completely transformed our business model.",
    rating: 5,
    revenue: "10x client capacity"
  },
  {
    name: "Lisa Thompson",
    role: "SaaS Founder",
    company: "ProductFlow",
    content: "The market research insights were phenomenal. FunnelAI identified opportunities we completely missed and helped us pivot our messaging for 40% better conversions.",
    rating: 5,
    revenue: "$100k ARR boost"
  },
  {
    name: "James Wilson",
    role: "Consultant",
    company: "Business Growth Co",
    content: "My clients see results within days, not months. FunnelAI has become my secret weapon for delivering exceptional outcomes consistently.",
    rating: 5,
    revenue: "95% client satisfaction"
  }
]

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 md:py-32">
      <div className="container">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Customer Success
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Trusted by{" "}
            <AnimatedGradientText>
              10,000+ Businesses
            </AnimatedGradientText>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how businesses like yours are achieving extraordinary results 
            with AI-powered funnel building.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <BorderBeam key={index} delay={index * 0.1}>
              <Card className="h-full border-0 bg-background/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  
                  <Quote className="w-8 h-8 text-muted-foreground mb-4" />
                  
                  <p className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} at {testimonial.company}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {testimonial.revenue}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </BorderBeam>
          ))}
        </div>
        
        <div className="text-center mt-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="text-3xl font-bold text-primary mb-2">10,000+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">$50M+</div>
              <div className="text-sm text-muted-foreground">Revenue Generated</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">15%</div>
              <div className="text-sm text-muted-foreground">Avg. Conversion Rate</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-2">4.9/5</div>
              <div className="text-sm text-muted-foreground">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}