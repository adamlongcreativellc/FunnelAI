# Database Setup with Neon PostgreSQL

## Step 1: Create a Neon Account

1. Go to [neon.tech](https://neon.tech) and sign up for a free account
2. Create a new project called "FunnelAI"
3. Choose the region closest to you
4. Copy the connection string provided

## Step 2: Update Environment Variables

1. Open `.env.local` in the project root
2. Replace the `DATABASE_URL` with your Neon connection string:
   ```
   DATABASE_URL="postgresql://username:password@host.neon.tech/database?sslmode=require"
   ```

## Step 3: Run Database Migration

Once you have your Neon database URL configured:

```bash
# Push the schema to your database
npx prisma db push

# (Optional) Seed the database with sample data
npm run db:seed
```

## Step 4: View Your Database

```bash
# Open Prisma Studio to view your data
npx prisma studio
```

## What's Included in the Schema

- **Users**: Authentication, subscriptions, preferences
- **Projects**: Core funnel projects with AI-generated content
- **Market Research**: AI-powered market analysis data
- **Personas**: Customer personas with demographics/psychographics
- **Funnel Pages**: Landing pages, checkout flows, etc.
- **A/B Tests**: Complete A/B testing framework
- **Analytics Events**: Real-time event tracking
- **AI Jobs**: Queue system for AI generation tasks

## Benefits of This Setup

- **Free Tier**: Neon offers generous free tier (3GB storage, 1 million queries/month)
- **Serverless**: Automatically scales to zero when not in use
- **Branching**: Create database branches for testing (like Git for databases)
- **Connection Pooling**: Built-in connection pooling for better performance
- **Type Safety**: Full TypeScript integration with Prisma

## Next Steps

1. Set up your Neon database
2. Configure the environment variables
3. Run the migration
4. Start building amazing AI-powered funnels! 🚀