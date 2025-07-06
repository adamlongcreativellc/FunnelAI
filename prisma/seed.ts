import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create sample user
  const user = await prisma.user.upsert({
    where: { email: 'demo@funnelai.com' },
    update: {},
    create: {
      email: 'demo@funnelai.com',
      firstName: 'Demo',
      lastName: 'User',
      companyName: 'FunnelAI Demo',
      industry: 'Technology',
      subscriptionTier: 'pro',
      onboardingCompleted: true,
    },
  })

  console.log('✅ Created demo user:', user.email)

  // Create sample projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'demo-ecommerce' },
      update: {},
      create: {
        id: 'demo-ecommerce',
        userId: user.id,
        name: 'E-commerce Fashion Store',
        description: 'High-end fashion retailer targeting millennials',
        industry: 'Fashion & Retail',
        targetAudience: 'Fashion-conscious millennials aged 25-35 with disposable income',
        businessGoals: ['Increase online sales', 'Build brand awareness', 'Grow email list'],
        status: 'completed',
        estimatedConversionRate: 0.125,
        actualConversionRate: 0.147,
        totalVisitors: 15420,
        totalConversions: 2267,
        revenueGenerated: 45340.50,
        marketResearch: {
          marketSize: 2400000000,
          growthRate: 0.085,
          competitors: [
            { name: 'ASOS', strengths: ['Wide selection', 'Fast shipping'], weaknesses: ['High return rates'] },
            { name: 'Zara', strengths: ['Trendy designs', 'Physical stores'], weaknesses: ['Limited online presence'] }
          ],
          opportunities: ['Sustainable fashion trend', 'Social media marketing'],
          threats: ['Economic downturn', 'Supply chain issues'],
          confidenceScore: 0.89
        },
        personas: [
          {
            name: 'Trendy Sarah',
            demographics: { age: '25-32', income: '$45k-65k', location: 'Urban areas', education: 'College' },
            psychographics: { values: ['Style', 'Quality'], interests: ['Fashion', 'Social media'], lifestyle: 'Active professional' },
            painPoints: ['Finding unique pieces', 'Fast fashion guilt'],
            goals: ['Express personal style', 'Look professional'],
            preferredChannels: ['Instagram', 'Email', 'Pinterest'],
            isPrimary: true
          }
        ]
      },
    }),

    prisma.project.upsert({
      where: { id: 'demo-saas' },
      update: {},
      create: {
        id: 'demo-saas',
        userId: user.id,
        name: 'SaaS Productivity Tool',
        description: 'Project management software for remote teams',
        industry: 'Software & Technology',
        targetAudience: 'Remote teams, freelancers, and small businesses',
        businessGoals: ['Acquire paid subscribers', 'Reduce churn rate', 'Increase feature adoption'],
        status: 'generating',
        estimatedConversionRate: 0.08,
        totalVisitors: 8430,
        totalConversions: 674,
        revenueGenerated: 32150.00
      },
    })
  ])

  console.log('✅ Created demo projects:', projects.map(p => p.name))

  // Create sample personas
  await prisma.persona.create({
    data: {
      projectId: projects[0].id,
      name: 'Professional Emma',
      demographics: {
        age: '28-35',
        income: '$55k-75k',
        location: 'Metropolitan areas',
        education: 'Bachelor\'s degree',
        occupation: 'Marketing professional'
      },
      psychographics: {
        values: ['Efficiency', 'Work-life balance', 'Professional growth'],
        interests: ['Career development', 'Networking', 'Travel'],
        lifestyle: 'Busy professional with active social life'
      },
      painPoints: ['Limited time for fashion shopping', 'Maintaining professional wardrobe', 'Budget constraints'],
      goals: ['Look professional and confident', 'Save time on shopping', 'Build versatile wardrobe'],
      preferredChannels: ['Email newsletters', 'LinkedIn', 'Professional blogs'],
      isPrimary: false
    }
  })

  // Create sample A/B test
  await prisma.aBTest.create({
    data: {
      projectId: projects[0].id,
      name: 'Homepage CTA Button Test',
      description: 'Testing different call-to-action button colors and text',
      testType: 'cta',
      variants: [
        { id: 'control', name: 'Original Blue', content: { color: 'blue', text: 'Shop Now' }, trafficPercentage: 50 },
        { id: 'variant', name: 'Green with Urgency', content: { color: 'green', text: 'Shop Limited Time Sale' }, trafficPercentage: 50 }
      ],
      trafficSplit: [50, 50],
      status: 'completed',
      winnerVariantId: 'variant',
      confidenceLevel: 0.95,
      startedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
      endedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)     // 2 days ago
    }
  })

  // Create sample analytics events
  const analyticsEvents = []
  for (let i = 0; i < 100; i++) {
    analyticsEvents.push({
      projectId: projects[0].id,
      sessionId: `session-${Math.random().toString(36).substring(7)}`,
      eventType: ['page_view', 'click', 'conversion'][Math.floor(Math.random() * 3)],
      eventData: { page: 'homepage', element: 'cta-button' },
      pageUrl: 'https://demo-store.com',
      timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Random time in last 7 days
    })
  }

  await prisma.analyticsEvent.createMany({
    data: analyticsEvents
  })

  console.log('✅ Created analytics events:', analyticsEvents.length)

  console.log('🎉 Database seeded successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })