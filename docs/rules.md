# Marketing Agent MVP — Engineering Rules for Cursor

## General Instruction

You are building a production-quality MVP for an AI marketing platform.
Every implementation decision should optimize for:
- clarity
- maintainability
- scalability
- developer experience
- product quality

Do not rush into messy code.
Do not over-engineer.
Choose the simplest architecture that still scales cleanly.

---

## File & Documentation Rules

- Create markdown documentation files inside `/docs`
- Keep documentation updated when major architecture decisions are made
- Use clear file names
- Do not generate unnecessary `.txt` files
- Do not dump random notes across the repository
- Keep code and docs organized

---

## Code Quality Rules

- Use TypeScript strict mode
- Never use `any` unless absolutely unavoidable
- Prefer explicit types and inferred types where clean
- Use Zod for validation at boundaries
- Write modular code
- Keep files focused
- Avoid giant components and giant service files
- Remove dead code
- Avoid premature abstraction
- Use descriptive naming

---

## Next.js Rules

- Use App Router
- Prefer Server Components by default
- Use Client Components only when necessary
- Keep data fetching on the server where possible
- Use Route Handlers for APIs
- Separate UI from server/business logic
- Handle loading, error, and empty states properly
- Use streaming where it improves UX
- Use server actions only when it genuinely improves ergonomics

---

## UI Rules

- Build premium but simple UI
- No emoji in product UI
- Use accessible components
- Use shadcn/ui where appropriate
- Use Tailwind cleanly
- Avoid class name chaos
- Extract reusable UI primitives thoughtfully
- Focus on spacing, typography, and state clarity

---

## AI / Agent Rules

- Keep prompts centralized
- Use structured schemas for AI outputs
- Never rely on unstructured model output when structure is required
- Keep orchestration deterministic where possible
- Log agent runs
- Validate AI responses before persisting or rendering
- Add fallbacks when AI output is incomplete
- Make prompt files readable and versionable

---

## Architecture Rules

- Separate:
  - presentation
  - application orchestration
  - domain logic
  - persistence
  - integrations

- Keep integrations behind adapters
- Avoid leaking provider-specific code across the app
- Keep domain logic testable
- Background jobs should not be tightly coupled to UI routes
- Make feature modules easy to extend

---

## Database Rules

- Prisma schema should stay clean and normalized
- Add timestamps where useful
- Use enums carefully
- Do not overcomplicate relations in MVP
- Add indexes for obvious query paths
- Keep migrations meaningful and safe

---

## API Rules

- Validate input
- Return consistent response shapes
- Use proper status codes
- Handle errors gracefully
- Do not expose internal stack traces to client
- Protect routes with authentication and authorization

---

## Performance Rules

- Optimize bundle size
- Avoid unnecessary client-side state
- Avoid unnecessary rerenders
- Lazy load heavy UI when appropriate
- Cache safe reads where appropriate
- Use background processing for long-running tasks
- Keep first meaningful interaction fast

---

## Security Rules

- Never expose secrets to client
- Sanitize user inputs
- Validate URLs before fetching/analyzing
- Add rate limiting on sensitive endpoints
- Protect generated business data
- Enforce permission checks server-side
- Be careful with scraping and external fetches

---

## Error Handling Rules

- Fix root cause, not only symptoms
- Add meaningful error messages
- Separate user-facing errors from internal logs
- Do not swallow exceptions silently
- Add retries only where safe
- Provide resilient fallback UI states

---

## Testing Rules

- Add unit tests for important business logic
- Add integration tests for core flows
- Test validation logic
- Test critical agent orchestration paths
- Test error paths for AI failures and provider failures

---

## Design Implementation Rules

- Follow design system docs
- Maintain consistency across pages
- Reuse layout patterns
- Avoid ad hoc styling
- Respect spacing scale and typographic hierarchy
- Motion should support clarity, not decoration

---

## Git / Delivery Rules

- Keep commits logically grouped
- Name things clearly
- Avoid introducing unused dependencies
- Do not leave TODO clutter everywhere
- Production code should feel intentional and clean

---

## Anti-Patterns to Avoid

Do not:
- create bloated god components
- mix database code in UI files
- mix prompt logic in random routes
- overuse Zustand for server state
- overcomplicate abstractions early
- generate fake analytics or fake certainty
- hide assumptions in reports
- build everything as chat only with no structured UI
- make the dashboard visually noisy
- use generic vague variable names like `data`, `item`, `temp`

---

## Preferred Output Style from Cursor

When implementing features:
1. explain folder/file plan briefly
2. implement cleanly
3. keep types strong
4. keep code understandable
5. include loading/error/empty states
6. ensure production readiness
7. avoid unnecessary complexity

---

## Master Instruction

Build this MVP like a real SaaS product that may later become a serious multi-agent marketing platform. Keep the codebase clean, modular, elegant, and easy for a team to extend.