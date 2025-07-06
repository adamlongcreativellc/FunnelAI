"use client"

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BorderBeam } from '@/components/magicui/border-beam'
import { Badge } from '@/components/ui/badge'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AIChatProps {
  projectId?: string
  className?: string
}

export function AIChat({ projectId, className }: AIChatProps) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/ai/chat',
    body: { projectId },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: "Hi! I'm your FunnelAI Assistant. I can help you optimize your marketing funnels, create compelling copy, analyze your target audience, and much more. What would you like to work on today?"
      }
    ]
  })

  return (
    <BorderBeam className={cn("h-full max-w-2xl", className)}>
      <Card className="h-full border-0 flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            FunnelAI Assistant
            <Badge variant="secondary" className="ml-auto">
              AI-Powered
            </Badge>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted'
                  )}
                >
                  <div className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </div>
                </div>
                
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask me anything about funnel optimization..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
          
          {/* Quick suggestions */}
          <div className="mt-2 flex flex-wrap gap-2">
            {[
              "How can I improve my conversion rate?",
              "Write headlines for my landing page",
              "Analyze my target audience",
              "Suggest A/B tests to run"
            ].map((suggestion, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                className="text-xs"
                onClick={() => handleInputChange({ target: { value: suggestion } } as any)}
                disabled={isLoading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </BorderBeam>
  )
}

// Smaller inline chat component
export function MiniAIChat({ className }: { className?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn("fixed bottom-4 right-4 h-12 w-12 rounded-full shadow-lg", className)}
        size="icon"
      >
        <Sparkles className="w-5 h-5" />
      </Button>
    )
  }
  
  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 z-50">
      <AIChat className="h-full" />
      <Button
        onClick={() => setIsOpen(false)}
        variant="ghost"
        size="sm"
        className="absolute -top-2 -right-2"
      >
        ×
      </Button>
    </div>
  )
}