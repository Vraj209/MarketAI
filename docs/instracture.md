# Marketing Agent MVP — Infrastructure & Codebase Architecture

## Objective

Build a production-quality MVP for an AI-powered marketing agent platform where businesses can ask for marketing help in natural language and receive actionable outputs such as:

- email campaigns
- newsletters
- social media posts
- image/video campaign ideas
- inquiry response drafts
- marketing reports
- sales projections
- ROI summaries
- website analysis
- landing page / website generation suggestions
- marketing research
- automated call workflows

The system must be modular, scalable, maintainable, and easy to extend with additional agents and tools later.

---

## Core Engineering Principles

### 1. Architecture principles
- Follow clean architecture where practical
- Follow SOLID principles
- Use modular domain-driven structure
- Prefer composition over inheritance
- Keep business logic out of UI components
- Keep AI orchestration separate from UI and data persistence
- Avoid tight coupling between agents, tools, and channels
- Design for future multi-agent expansion

### 2. Coding principles
- Code must be simple, readable, and production-ready
- Avoid unnecessary abstractions
- Prefer explicit naming over clever naming
- No large files with mixed concerns
- All functions and components should have a single clear responsibility
- Use strict typing everywhere
- Avoid `any`
- Reusable code should be extracted only when it improves clarity

### 3. Scalability principles
- Design for multi-tenant business accounts later, even if MVP is single-tenant internally
- Agent execution should be tool-driven and extensible
- AI workflows should support retries, observability, and usage tracking
- Background jobs should be isolated from request/response lifecycle
- Long-running tasks should use async job execution

---

## Suggested Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query for server state if needed
- Zustand only if lightweight client state is needed

### Backend
Option A:
- Next.js fullstack using Route Handlers + Server Actions for MVP

Option B:
- Next.js frontend + separate NestJS backend if product grows quickly

For MVP, prefer:
- Next.js App Router as primary application shell
- Route handlers for APIs
- Background job layer separated cleanly

### Database
- PostgreSQL
- Prisma ORM

### Auth
- Clerk or Auth.js
- Role support should allow:
  - admin
  - business owner
  - team member

### AI / Agent Layer
- OpenAI API
- Tool-based agent orchestration
- Structured outputs with schemas
- Prompt templates stored centrally
- Support agent execution logs

### Jobs / Queue
- Inngest or Trigger.dev preferred for MVP
- Alternative: BullMQ with Redis

### Storage
- S3 / Cloudflare R2 for generated assets
- Store generated images, decks, exports, reports

### Analytics / Logging
- PostHog for product analytics
- Sentry for error tracking
- Structured server logs

### Email
- Resend for sending emails
- React Email or MJML for email rendering if email sending is included

---

## High-Level System Modules

## 1. App layer
Responsible for:
- routes
- pages
- layouts
- server actions
- UI composition

Should not contain:
- core business logic
- AI orchestration logic
- database-specific logic outside service boundary

---

## 2. Domain modules

Suggested domain modules:

- `business`
- `workspace`
- `brand`
- `campaign`
- `content`
- `research`
- `reporting`
- `website-analysis`
- `lead-response`
- `agent`
- `automation`
- `asset`
- `billing` (future-ready)
- `user`

Each domain module should contain:
- types
- schemas
- services
- repository interface
- validators
- mappers
- use-cases

---

## 3. AI orchestration layer

This is the most important layer.

Create a dedicated agent system that can:
- classify user intent
- choose the correct marketing workflow
- gather business context
- fetch relevant brand and campaign data
- invoke the proper tools
- return structured output
- generate follow-up suggestions

This layer should be separated into:

### a. Intent classifier
Detect whether the user wants:
- strategy recommendation
- social content creation
- email campaign creation
- newsletter creation
- research
- report generation
- website audit
- landing page generation
- inquiry response
- automated call workflow
- campaign analysis

### b. Context assembler
Collect relevant data:
- business type
- location
- audience
- lifecycle stage
- goals
- brand voice
- existing social posts
- existing website
- available assets
- competitors

### c. Tool executor
Tools should be abstracted behind interfaces such as:
- website analyzer
- competitor research
- social post generator
- email generator
- ROI calculator
- report generator
- deck generator
- image prompt generator
- video brief generator
- inquiry responder

### d. Output formatter
Return outputs in structured formats, for example:
- campaign plan
- social post set
- email series
- report summary
- landing page brief
- website audit
- business recommendations

---

## 4. Persistence layer

Use repository pattern only where useful, not ceremonially.

Example repositories:
- BusinessRepository
- CampaignRepository
- GeneratedAssetRepository
- AgentRunRepository
- BrandProfileRepository
- ResearchSnapshotRepository

Persist:
- businesses
- users
- workspaces
- business profiles
- brand preferences
- campaigns
- generated assets
- prompts used
- agent execution logs
- reports
- website analysis snapshots

---

## 5. Integration layer

All external services should be isolated in `lib/integrations` or domain-specific providers.

Examples:
- OpenAI provider
- Resend provider
- Website scraping provider
- Search/research provider
- Image generation provider
- Deck export provider
- Social publishing provider (future)
- Telephony provider (future)

Wrap all providers in service adapters so they can be swapped later.

---

## Suggested Folder Structure

```txt
src/
  app/
    (marketing)/
    dashboard/
    onboarding/
    api/
  components/
    ui/
    shared/
    dashboard/
    forms/
    marketing/
  features/
    business/
      components/
      hooks/
      server/
      schemas/
      types/
    campaigns/
    content/
    reports/
    research/
    website-audit/
    inquiries/
    agent/
  lib/
    ai/
      prompts/
      agents/
      tools/
      schemas/
      formatters/
      orchestration/
    db/
    auth/
    integrations/
    utils/
    validations/
  server/
    services/
    repositories/
    jobs/
    workflows/
  prisma/
  types/
  styles/# Marketing Agent MVP — Infrastructure & Codebase Architecture

## Objective

Build a production-quality MVP for an AI-powered marketing agent platform where businesses can ask for marketing help in natural language and receive actionable outputs such as:

- email campaigns
- newsletters
- social media posts
- image/video campaign ideas
- inquiry response drafts
- marketing reports
- sales projections
- ROI summaries
- website analysis
- landing page / website generation suggestions
- marketing research
- automated call workflows

The system must be modular, scalable, maintainable, and easy to extend with additional agents and tools later.

---

## Core Engineering Principles

### 1. Architecture principles
- Follow clean architecture where practical
- Follow SOLID principles
- Use modular domain-driven structure
- Prefer composition over inheritance
- Keep business logic out of UI components
- Keep AI orchestration separate from UI and data persistence
- Avoid tight coupling between agents, tools, and channels
- Design for future multi-agent expansion

### 2. Coding principles
- Code must be simple, readable, and production-ready
- Avoid unnecessary abstractions
- Prefer explicit naming over clever naming
- No large files with mixed concerns
- All functions and components should have a single clear responsibility
- Use strict typing everywhere
- Avoid `any`
- Reusable code should be extracted only when it improves clarity

### 3. Scalability principles
- Design for multi-tenant business accounts later, even if MVP is single-tenant internally
- Agent execution should be tool-driven and extensible
- AI workflows should support retries, observability, and usage tracking
- Background jobs should be isolated from request/response lifecycle
- Long-running tasks should use async job execution

---

## Suggested Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Hook Form
- Zod
- TanStack Query for server state if needed
- Zustand only if lightweight client state is needed

### Backend
Option A:
- Next.js fullstack using Route Handlers + Server Actions for MVP

Option B:
- Next.js frontend + separate NestJS backend if product grows quickly

For MVP, prefer:
- Next.js App Router as primary application shell
- Route handlers for APIs
- Background job layer separated cleanly

### Database
- PostgreSQL
- Prisma ORM

### Auth
- Clerk or Auth.js
- Role support should allow:
  - admin
  - business owner
  - team member

### AI / Agent Layer
- OpenAI API
- Tool-based agent orchestration
- Structured outputs with schemas
- Prompt templates stored centrally
- Support agent execution logs

### Jobs / Queue
- Inngest or Trigger.dev preferred for MVP
- Alternative: BullMQ with Redis

### Storage
- S3 / Cloudflare R2 for generated assets
- Store generated images, decks, exports, reports

### Analytics / Logging
- PostHog for product analytics
- Sentry for error tracking
- Structured server logs

### Email
- Resend for sending emails
- React Email or MJML for email rendering if email sending is included

---

## High-Level System Modules

## 1. App layer
Responsible for:
- routes
- pages
- layouts
- server actions
- UI composition

Should not contain:
- core business logic
- AI orchestration logic
- database-specific logic outside service boundary

---

## 2. Domain modules

Suggested domain modules:

- `business`
- `workspace`
- `brand`
- `campaign`
- `content`
- `research`
- `reporting`
- `website-analysis`
- `lead-response`
- `agent`
- `automation`
- `asset`
- `billing` (future-ready)
- `user`

Each domain module should contain:
- types
- schemas
- services
- repository interface
- validators
- mappers
- use-cases

---

## 3. AI orchestration layer

This is the most important layer.

Create a dedicated agent system that can:
- classify user intent
- choose the correct marketing workflow
- gather business context
- fetch relevant brand and campaign data
- invoke the proper tools
- return structured output
- generate follow-up suggestions

This layer should be separated into:

### a. Intent classifier
Detect whether the user wants:
- strategy recommendation
- social content creation
- email campaign creation
- newsletter creation
- research
- report generation
- website audit
- landing page generation
- inquiry response
- automated call workflow
- campaign analysis

### b. Context assembler
Collect relevant data:
- business type
- location
- audience
- lifecycle stage
- goals
- brand voice
- existing social posts
- existing website
- available assets
- competitors

### c. Tool executor
Tools should be abstracted behind interfaces such as:
- website analyzer
- competitor research
- social post generator
- email generator
- ROI calculator
- report generator
- deck generator
- image prompt generator
- video brief generator
- inquiry responder

### d. Output formatter
Return outputs in structured formats, for example:
- campaign plan
- social post set
- email series
- report summary
- landing page brief
- website audit
- business recommendations

---

## 4. Persistence layer

Use repository pattern only where useful, not ceremonially.

Example repositories:
- BusinessRepository
- CampaignRepository
- GeneratedAssetRepository
- AgentRunRepository
- BrandProfileRepository
- ResearchSnapshotRepository

Persist:
- businesses
- users
- workspaces
- business profiles
- brand preferences
- campaigns
- generated assets
- prompts used
- agent execution logs
- reports
- website analysis snapshots

---

## 5. Integration layer

All external services should be isolated in `lib/integrations` or domain-specific providers.

Examples:
- OpenAI provider
- Resend provider
- Website scraping provider
- Search/research provider
- Image generation provider
- Deck export provider
- Social publishing provider (future)
- Telephony provider (future)

Wrap all providers in service adapters so they can be swapped later.

---

## Suggested Folder Structure

```txt
src/
  app/
    (marketing)/
    dashboard/
    onboarding/
    api/
  components/
    ui/
    shared/
    dashboard/
    forms/
    marketing/
  features/
    business/
      components/
      hooks/
      server/
      schemas/
      types/
    campaigns/
    content/
    reports/
    research/
    website-audit/
    inquiries/
    agent/
  lib/
    ai/
      prompts/
      agents/
      tools/
      schemas/
      formatters/
      orchestration/
    db/
    auth/
    integrations/
    utils/
    validations/
  server/
    services/
    repositories/
    jobs/
    workflows/
  prisma/
  types/
  styles/