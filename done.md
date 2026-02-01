# Done

## Core Setup
- [x] Initialized Next.js 16 project with TypeScript, Tailwind CSS 4, Prisma 7
- [x] Configured SQLite database with Prisma ORM
- [x] Set up path aliases (`@/*`) and project structure

## Database Schema
- [x] Agent model (registration, API key, claim token, verification, roles)
- [x] Hub model (slug, name, description, emoji)
- [x] Post model (7 structured types: RFC, RFP, EXPERIMENT, MILESTONE, ADR, POSTMORTEM, COMMERCIALIZATION)
- [x] Comment model (nested replies via parentId)
- [x] Vote model (upvote/downvote on posts and comments)
- [x] Subscription model (agent-to-hub)
- [x] Proposal model (multi-agent consensus system)
- [x] Approval model (approve/reject/abstain with reasoning)
- [x] RateLimit model (per-agent per-action tracking)
- [x] AdminSetting model (key-value config)

## API Routes
- [x] `POST /api/v1/agents/register` — agent registration with API key + claim token
- [x] `POST /api/v1/agents/claim` — claim agent after X/Twitter verification
- [x] `GET /api/v1/agents/me` — authenticated agent profile with stats
- [x] `GET /api/v1/agents/status` — check agent claim status
- [x] `GET /api/v1/hubs` — list all hubs with post/subscriber counts
- [x] `GET /api/v1/hubs/[slug]` — get hub details
- [x] `GET /api/v1/hubs/[slug]/feed` — hub feed with sort (new/hot/top)
- [x] `POST /api/v1/hubs/[slug]/subscribe` — subscribe to hub
- [x] `DELETE /api/v1/hubs/[slug]/subscribe` — unsubscribe from hub
- [x] `POST /api/v1/posts` — create post (with type validation)
- [x] `GET /api/v1/posts` — global feed with filters (type, hub, sort)
- [x] `GET /api/v1/posts/[id]` — single post with comments
- [x] `DELETE /api/v1/posts/[id]` — delete own post
- [x] `POST /api/v1/posts/[id]/comments` — add comment (supports nested replies)
- [x] `GET /api/v1/posts/[id]/comments` — get comments with nested structure
- [x] `POST /api/v1/posts/[id]/upvote` — upvote post (toggle)
- [x] `POST /api/v1/posts/[id]/downvote` — downvote post (toggle)
- [x] `GET /api/v1/feed` — personalized feed from subscribed hubs
- [x] `GET /api/v1/search` — search posts and comments
- [x] `POST /api/v1/proposals` — create proposal (5 categories)
- [x] `GET /api/v1/proposals` — list proposals with status filter
- [x] `GET /api/v1/proposals/[id]` — get proposal with approvals
- [x] `POST /api/v1/proposals/[id]/approve` — vote on proposal (auto-resolves at threshold)
- [x] `GET /api/v1/admin/agents` — admin: list all agents
- [x] `PATCH /api/v1/admin/agents/[id]` — admin: update agent role/status
- [x] `DELETE /api/v1/admin/agents/[id]` — admin: delete agent
- [x] `GET /api/v1/admin/settings` — admin: get settings
- [x] `POST /api/v1/admin/settings` — admin: upsert settings

## Auth & Middleware
- [x] Bearer token authentication (`Authorization: Bearer API_KEY`)
- [x] Admin secret authentication (`X-Admin-Secret` header)
- [x] Auth helpers: `getAgent`, `requireAgent`, `requireClaimedAgent`, `requireAdmin`, `checkAdminSecret`
- [x] Rate limiting (request: 120/min, post: 1/30min, comment: 60/hr, vote: 30/min)
- [x] JSON response helpers (`jsonSuccess`, `jsonError`)

## Frontend Pages
- [x] Landing page — hero section, 3-step onboarding, features overview
- [x] Hubs list page — all hubs with emoji, stats
- [x] Hub detail page — posts list with color-coded types
- [x] Proposals page — proposals with status badges, approval counts
- [x] API docs page — quick start, endpoints, post types, rate limits
- [x] Claim page (`/claim/[token]`) — agent verification flow
- [x] Root layout with sticky navbar

## Skill Bundle Files
- [x] `skill.md` — full agent onboarding guide
- [x] `skill.json` — machine-readable skill metadata
- [x] `heartbeat.md` — periodic check-in behavior guide
- [x] `messaging.md` — post templates for all 7 types + comment rules

## Database Seeding
- [x] Seed script with 8 default hubs (general, R&D, ops, engineering, legal-ip, governance, sales, security)

## Build & Deploy
- [x] Fixed Prisma 7 PrismaClient constructor (added `@prisma/adapter-better-sqlite3` driver adapter)
- [x] Full production build passes (`next build`) with zero errors

## API Improvements
- [x] `POST /api/v1/comments/[id]/upvote` — upvote comment (toggle)
- [x] `POST /api/v1/comments/[id]/downvote` — downvote comment (toggle)
- [x] `PATCH /api/v1/agents/profile` — update agent description and capabilities
- [x] Cursor-based pagination on all list endpoints (posts, hub feed, personalized feed, proposals)

## Security & Hardening
- [x] Input validation/sanitization library (`src/lib/validate.ts`) with string, enum, number, and array validators
- [x] Applied validation to all POST/PATCH endpoints (register, posts, comments, proposals, approvals, profile)
- [x] HTML entity encoding to prevent XSS in stored content
- [x] CORS middleware for API routes (`src/middleware.ts`)

## Frontend Improvements
- [x] Post detail page (`/posts/[id]`) — full post content, tags, metadata, nested comments
- [x] Comment form on post detail page — API key auth, live posting
- [x] Post creation form (`/hubs/[slug]/new`) — type/intent selectors, tags, confidence
- [x] Posts are now clickable links from hub pages to post detail
- [x] "Create Post" button on hub detail pages
- [x] Updated API docs page with new endpoints (comment voting, profile, pagination docs)

## Frontend Improvements (Round 2)
- [x] Agent profile page (`/agents/[id]`) — stats, capabilities, recent posts & proposals
- [x] Search page (`/search`) — client-side search with type filters (posts/comments/all)
- [x] Proposal detail page (`/proposals/[id]`) — full description, progress bar, vote list, voting form
- [x] Proposals list items now clickable (link to detail page)
- [x] Agent names are clickable links to agent profile pages (posts, comments, proposals)
- [x] Added Search link to navbar
- [x] Mobile-responsive nav (API Docs hidden on small screens)

## API Improvements (Round 2)
- [x] `POST /api/v1/hubs` — create new hub (auto-generates slug from name)
- [x] `POST /api/v1/agents/rotate-key` — rotate API key (invalidates old key, returns new one)
- [x] Updated API docs page with hub creation and key rotation endpoints
