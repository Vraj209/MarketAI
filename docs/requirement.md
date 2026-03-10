
---

# 2) `docs/02-requirements.md`

```md
# Marketing Agent MVP — Product Requirements Document

## Product Vision

Create an AI-powered marketing operating system for businesses. The platform should allow a business owner to describe their business and ask for marketing help in natural language. The system should analyze the business context and generate useful, execution-ready marketing outputs.

Example:
“I run a pizza shop in Toronto. These are my customers and current online presence. What campaign should I run this month?”

The platform should then return:
- strategy suggestions
- channel recommendations
- content ideas
- marketing assets
- reports
- projections
- follow-up action items

---

## Primary User

### Main target user
Small and medium business owners who do not have a full in-house marketing team.

Examples:
- pizza shop
- restaurant
- clinic
- gym
- salon
- service business
- agency
- ecommerce brand
- local retail store

### Secondary user
Marketing managers or agencies managing campaigns for multiple businesses.

---

## Problem Statement

Many businesses struggle with:
- choosing the right marketing campaign
- writing social and email content
- understanding ROI
- auditing their online presence
- responding to leads consistently
- doing research before taking action
- turning strategy into deliverables fast

The platform should reduce this friction by acting like an AI marketing strategist + content team.

---

## MVP Goals

The MVP must allow a business to:

1. onboard their business information
2. describe their marketing needs in natural language
3. receive strategic recommendations
4. generate marketing outputs quickly
5. save and revisit outputs
6. understand why a recommendation was made

---

## Key MVP Features

## 1. Business onboarding
User should be able to add:
- business name
- business category
- website URL
- location
- target audience
- customer lifecycle info
- social links
- business goals
- tone/brand voice
- competitors
- current challenges

### Acceptance criteria
- onboarding form is simple and guided
- data is saved to profile
- user can edit later
- form validation is clear and strict

---

## 2. Natural language marketing request
User can ask:
- what campaign should I run?
- create me an email campaign
- create Instagram posts for this promotion
- audit my website
- generate a newsletter
- make a lead response template
- create a marketing report
- estimate return on investment
- create a slide deck for investors or internal marketing review

### Acceptance criteria
- input supports long-form business request
- system identifies user intent
- system suggests best next actions
- output is structured and useful

---

## 3. Campaign recommendation engine
System should recommend campaigns based on:
- business type
- location
- customer lifecycle
- online presence
- current goals
- seasonality if user includes it
- audience behavior assumptions
- existing social/website maturity

### Example outputs
- local awareness campaign
- loyalty campaign
- reactivation campaign
- referral campaign
- seasonal promotion campaign
- content marketing campaign
- email retention sequence

### Acceptance criteria
- recommendation includes reasoning
- recommendation includes priority
- recommendation includes suggested channels
- recommendation includes expected business objective

---

## 4. Social media content generation
Generate platform-specific content for:
- Instagram
- LinkedIn
- X / Twitter

Support:
- post captions
- carousel copy
- content hooks
- CTA suggestions
- image prompt suggestions
- video brief suggestions

### Acceptance criteria
- content differs by platform
- output respects brand tone
- user can regenerate
- user can request variations

---

## 5. Email marketing generation
Generate:
- email campaign ideas
- subject lines
- preview text
- email body copy
- CTA suggestions
- follow-up sequence

### Acceptance criteria
- output should be ready to use with minor edits
- user can select objective:
  - welcome
  - promotion
  - retention
  - reactivation
  - newsletter
- generate multiple variations

---

## 6. Newsletter generation
Generate newsletter drafts using:
- business updates
- promotions
- announcements
- educational content

### Acceptance criteria
- includes subject line
- includes body sections
- includes CTA
- respects brand tone

---

## 7. Inquiry / lead response generation
Generate responses for:
- contact form inquiries
- service inquiries
- quotation requests
- customer follow-up replies

### Acceptance criteria
- response should be professional and context-aware
- user can choose tone:
  - formal
  - friendly
  - premium
  - concise

---

## 8. Marketing report generation
Generate simple reports such as:
- campaign summary
- projected ROI
- sales opportunity summary
- content performance summary
- recommendation summary

### Acceptance criteria
- report should contain clear sections
- should not pretend certainty where there is none
- calculations should be transparent
- assumptions should be visible

---

## 9. Website analysis
Analyze website and return:
- messaging clarity
- CTA clarity
- trust issues
- conversion improvement ideas
- SEO basics
- landing page suggestions

### Acceptance criteria
- analysis should be actionable
- findings should be grouped by severity or priority
- suggestions should be plain language

---

## 10. Marketing research
Generate lightweight research around:
- competitors
- local positioning
- customer acquisition ideas
- online presence review

### Acceptance criteria
- research should summarize clearly
- avoid fake precision
- clearly distinguish observed vs inferred insights

---

## 11. Slide deck outline generation
Generate outline for:
- campaign proposal
- marketing strategy deck
- monthly review deck

### Acceptance criteria
- output should include slide titles
- each slide should include short summary points
- should be presentation-friendly

---

## 12. Asset history
User can view previous:
- campaigns
- reports
- generated posts
- emails
- audits

### Acceptance criteria
- user can reopen previous generated assets
- user can duplicate or regenerate

---

## User Flow

## Flow 1 — New business onboarding
1. User signs in
2. User creates business profile
3. User fills onboarding form
4. User lands on dashboard
5. User sees suggested first actions

## Flow 2 — Ask marketing strategist
1. User enters natural language request
2. System classifies request
3. System fetches business context
4. System generates recommendation
5. System shows structured response
6. User can refine or generate assets

## Flow 3 — Generate content from recommendation
1. User selects a recommended campaign
2. User clicks generate assets
3. System creates:
   - posts
   - emails
   - newsletter
   - report summary
4. User saves/exports results

---

## MVP Screens

- sign in
- onboarding
- dashboard
- strategist chat / request page
- campaign results page
- social content generator
- email generator
- newsletter generator
- website audit page
- reports page
- history page
- settings / brand profile

---

## Data Entities

### Business
- id
- name
- category
- websiteUrl
- location
- audience
- goals
- lifecycle
- socials
- competitors
- brandVoice
- createdAt

### User
- id
- name
- email
- role

### Campaign
- id
- businessId
- title
- objective
- channels
- strategySummary
- status
- createdAt

### GeneratedAsset
- id
- businessId
- type
- title
- payload
- sourcePrompt
- createdAt

### WebsiteAudit
- id
- businessId
- websiteUrl
- findings
- recommendations
- createdAt

### AgentRun
- id
- businessId
- intent
- input
- output
- status
- logs
- createdAt

---

## Success Metrics

### Product metrics
- onboarding completion rate
- first successful generation rate
- number of assets generated per user
- repeat usage within 7 days
- number of saved campaigns

### Quality metrics
- user satisfaction with output
- regeneration rate
- edit rate
- acceptance of recommendations

---

## Constraints

- MVP should be usable without excessive setup
- AI outputs must be structured and easy to scan
- avoid pretending to have exact business truth without evidence
- do not overload the first version with too many autonomous workflows
- keep experience fast and confidence-building

---

## Out of Scope for MVP
- full social media publishing suite
- complex CRM
- advanced ad platform integrations
- advanced call center features
- full website builder with full CMS
- multi-language support
- advanced attribution modeling

These can be added later.

---

## Cursor Build Instruction

Build the MVP around one core promise:
A business owner can describe their business and marketing challenge in plain language, and the system returns a useful, action-oriented marketing plan plus ready-to-use assets.

The MVP should prioritize clarity, speed, useful outputs, and strong UX over feature overload.