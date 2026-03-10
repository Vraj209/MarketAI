# Marketing Agent MVP — Design System & Product Design Direction

## Design Goal

Design a premium, modern, calm, high-trust AI product for business owners.

The experience should feel like a blend of:
- Wealthsimple clarity
- Superagent intelligence
- Linear precision
- Vercel cleanliness
- Stripe-level product confidence

The UI should feel:
- premium
- minimal
- structured
- intelligent
- efficient
- calm
- trustworthy

Not playful.
Not noisy.
Not over-decorated.

---

## Core Design Principles

### 1. Clarity first
Users should always know:
- where they are
- what they can do next
- what the AI is doing
- what result they received
- why a recommendation was made

### 2. Confidence through structure
AI responses must not feel like random chat output.
They should feel like decision-ready deliverables.

### 3. Minimal but rich
Use whitespace, hierarchy, and motion carefully.
Do not rely on heavy decoration.

### 4. Action-oriented UX
Every result page should support:
- save
- regenerate
- refine
- export
- copy
- turn into next step

### 5. Business-grade trust
The interface should look credible for agencies, SMB owners, and operators.

---

## Visual Direction

## Aesthetic keywords
- clean
- premium
- structured
- understated
- high signal
- light depth
- soft surfaces
- editorial layout
- product-led clarity

## Avoid
- flashy gradients everywhere
- loud colors
- overly futuristic AI visuals
- cluttered dashboards
- excessive glassmorphism
- cartoonish icons
- heavy shadows
- too many borders

---

## Color System

Use a restrained, elegant palette.

### Base palette direction
- Background: warm light neutral or cool soft white
- Surface: pure white or slightly tinted neutral
- Primary text: deep charcoal / dark slate
- Secondary text: muted slate
- Accent: refined blue
- Success: soft emerald
- Warning: subtle amber
- Error: muted red

### Suggested colors
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Primary Text: `#0F172A`
- Secondary Text: `#475569`
- Border: `#E2E8F0`
- Primary Accent: `#2563EB`
- Primary Accent Soft: `#DBEAFE`
- Success: `#059669`
- Warning: `#D97706`
- Error: `#DC2626`

### Usage
- use accent color selectively
- primary actions should be visually obvious
- neutral UI should dominate over colorful UI
- charts and metrics should remain readable first

---

## Typography

Typography should feel polished and product-grade.

### Direction
- large confident headings
- concise body text
- strong hierarchy
- excellent line-height
- generous spacing

### Font pairing suggestion
- Primary UI font: Inter
- Alternative: Geist or SF-style system stack

### Scale suggestion
- Display: 40–56
- H1: 32–40
- H2: 24–30
- H3: 20–24
- Body: 14–16
- Small/meta: 12–13

### Typography rules
- headings should be short and clear
- supporting text should not be too dense
- AI outputs should use clean section hierarchy
- long paragraphs should be broken into digestible blocks

---

## Layout Principles

### App structure
- left sidebar for primary navigation
- top utility area for workspace context and actions
- main content with strong max-width control
- generous padding
- consistent card rhythm

### Spacing
- use breathing room generously
- avoid cramped forms
- maintain consistent vertical rhythm

### Grid
- use 12-column or modular responsive grid
- cards should align cleanly
- avoid visual noise from uneven spacing

---

## Key Screens Design Direction

## 1. Onboarding
Should feel:
- guided
- non-intimidating
- high value

Use:
- progressive disclosure
- step-based input
- contextual examples
- helpful placeholders

Sections:
- business basics
- audience
- goals
- lifecycle
- online presence
- brand voice

---

## 2. Dashboard
Should feel like:
- mission control for marketing

Include:
- business snapshot
- quick ask input
- recent outputs
- recommended next actions
- key business context cards

Avoid:
- analytics overload on day one

---

## 3. AI strategist page
This is the core product experience.

Should include:
- large prompt input
- structured result canvas
- business context sidebar or panel
- ability to regenerate/refine
- action buttons to create downstream assets

AI output should render in sections like:
- summary
- recommended campaign
- why this works
- channels
- suggested assets
- next steps

---

## 4. Content generation pages
Each generator should feel focused.

For social post generation:
- platform tabs
- variant cards
- copy blocks
- CTA block
- visual brief block

For email generation:
- subject line
- preview text
- email body
- CTA
- variants

For report generation:
- summary cards
- assumptions block
- recommendation block
- projection block

---

## 5. Website audit page
Should feel analytical but easy to understand.

Suggested layout:
- website summary header
- score/status overview
- findings by category
- priority recommendations
- quick wins
- deeper opportunities

---

## Components

### Core components
- sidebar
- page header
- stat card
- prompt input panel
- AI result section
- recommendation card
- campaign card
- asset card
- audit finding row
- report metric card
- action toolbar
- empty state
- loading state
- regeneration controls

### UI characteristics
- rounded corners, but not overly soft
- subtle shadows
- thin borders
- clear hover states
- consistent focus states
- polished loading skeletons

---

## Motion & Interaction

Motion should feel:
- calm
- intelligent
- premium
- helpful

### Use motion for
- page transitions
- panel reveals
- result loading
- hover feedback
- card focus transitions
- accordion expansion
- tab switching

### Avoid
- excessive bounce
- exaggerated spring everywhere
- distracting looping animation
- decorative movement without purpose

### Micro-interaction examples
- button press compression
- card hover elevation
- subtle shimmer/skeleton during generation
- progressive section reveal as result streams in
- save/copy confirmation with subtle transition

---

## UX Writing Direction

Tone should be:
- smart
- direct
- supportive
- business-friendly
- non-hype

Avoid:
- robotic AI phrasing
- overly casual startup jargon
- exaggerated certainty
- unnecessary filler

Good output example:
- “Recommended campaign: Local loyalty offer for repeat customers”
- “Why this fits your business”
- “Expected upside”
- “Assumptions used in this estimate”

---

## Accessibility Requirements
- color contrast must meet accessibility standards
- all controls must be keyboard accessible
- visible focus states required
- proper semantic landmarks
- forms must have labels and validation messages
- loading states must not hide context completely

---

## Responsive Strategy
- desktop-first experience, but fully responsive
- mobile should support:
  - onboarding
  - dashboard summary
  - strategist prompt
  - viewing generated outputs
- complex editing surfaces can be simplified on mobile

---

## Design References
Take inspiration from the product quality and interaction discipline of:
- Wealthsimple
- Superagent
- Linear
- Vercel
- Stripe
- Notion AI (for structured generation interfaces)

Do not copy directly.
Interpret the design language into a unique product system.

---

## Cursor Build Instruction

Implement a premium, minimal, high-trust interface with strong information hierarchy, restrained color usage, excellent spacing, calm motion, and structured AI output rendering. The product should feel reliable, modern, and decision-oriented for business owners.