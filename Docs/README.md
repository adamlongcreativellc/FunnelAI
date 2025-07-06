# FunnelAI - AI-Powered Funnel Builder

## Overview
FunnelAI is an AI-powered platform that automates the entire process of creating sales and marketing funnels from concept to deployment. The system leverages multiple AI agents to research markets, create personas, generate content, and build functional marketing assets.

## Architecture

### Backend (Node.js + TypeScript)
- **API Layer**: Express.js RESTful API
- **AI Agents**: OpenAI 4o (conversational) + O3 (analytical)
- **Research Engine**: Firecrawl + Perplexity APIs
- **Database**: PostgreSQL + Redis
- **Authentication**: JWT-based auth

### Frontend (React + TypeScript)
- **Framework**: React.js with TypeScript
- **Styling**: Tailwind CSS
- **State Management**: React Query + Context
- **Routing**: React Router

### Key Features
- Market research automation
- Customer persona generation
- Content creation (landing pages, emails, ads)
- Funnel visualization and optimization
- Project management dashboard

## Development Status
🚧 **MVP Development in Progress**

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- OpenAI API Key
- Firecrawl API Key
- Perplexity API Key

### Installation
```bash
# Clone and setup backend
cd backend
npm install
npm run dev

# Setup frontend
cd ../frontend
npm install
npm run dev
```

## API Documentation
See `/docs/api.md` for detailed API specifications.

## License
MIT License