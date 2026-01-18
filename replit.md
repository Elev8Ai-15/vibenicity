# Vibenicity - AI Code Generation Platform

## Overview

This is an AI-powered code generation platform called "Vibenicity". It's a full-stack web application that translates natural language prompts (including slang and informal language) into production-ready code using multiple AI providers.

The core concept is a "linguistics engine" that understands Gen Z slang, AAVE, tech jargon, gaming terms, and other informal language patterns, translating them into clear technical requirements before sending to AI code generation models.

**Key Features:**
- Chat-based interface for code generation requests
- Linguistics translation engine (535+ terms across 11 categories)
- Multi-provider AI support (OpenAI, Claude, Gemini)
- Real-time build progress via Server-Sent Events
- VS Code-style IDE interface with file tree and terminal
- Voice chat capabilities with audio streaming
- Live code preview with iframe sandbox
- Multi-stage build pipeline (Plan → Generate → Verify)
- Design system with 10 SaaS-quality component templates
- Error recovery with exponential backoff retry logic
- Version control with file history and revert functionality
- User authentication with Replit Auth and rate limiting
- Free planning mode for users to refine prompts without using AI tokens

## User Preferences

Preferred communication style: Simple, everyday language.
Design: Lovable-style UI with cyan/magenta/purple color scheme

## System Architecture

### Frontend Architecture
- **Framework**: React 19 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: Zustand with persistence middleware
- **Data Fetching**: TanStack React Query
- **UI Components**: shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS v4 with custom theme variables (Vibenicity colors: cyan #00E5FF, magenta #E879F9, pink #FF6B9D)
- **Animations**: Framer Motion
- **Build Tool**: Vite

The frontend is organized as a single-page workspace with:
- Left panel: Chat interface for AI interactions (Agent/Plan mode toggle)
- Right panel: Code viewer with file tree explorer
- Bottom panel: Terminal output simulation

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Session Storage**: connect-pg-simple for Express sessions
- **API Pattern**: REST endpoints with SSE for real-time updates

The server follows a modular structure:
- `server/routes.ts`: API route definitions
- `server/storage.ts`: Database access layer (repository pattern)
- `server/lib/ai-clients.ts`: AI provider abstraction
- `server/lib/build-pipeline.ts`: Multi-stage code generation pipeline

### Database Schema
PostgreSQL with Drizzle ORM. Key tables:
- `users`: Basic authentication
- `build_sessions`: Tracks AI code generation requests with status (includes userId for ownership)
- `generated_files`: Stores generated code files per session
- `file_versions`: Version history for generated files (enables undo/redo)
- `build_logs`: Terminal-style log entries per session
- `conversations` / `messages`: Chat history for voice/text conversations
- `rate_limits`: Persistent rate limiting per user

### AI Integration Pattern
The application supports three AI providers through Replit AI Integrations:
- OpenAI (GPT models)
- Anthropic Claude
- Google Gemini (via OpenAI-compatible interface)

All providers are accessed through environment variables prefixed with `AI_INTEGRATIONS_*`.

### Linguistics Engine
Located in `client/src/lib/linguistics.ts`, this translates informal language to formal technical terms. Categories include: GEN_Z, AAVE, TECH, STARTUP, DESIGN, SOUTHERN, UK, HIPHOP, GAMING, HISPANIC, EMOTIONAL.

### Build System
- Development: `npm run dev` runs the Express server with Vite middleware
- Production: `npm run build` bundles client (Vite) and server (esbuild) to `dist/`
- Database: `npm run db:push` applies schema changes via Drizzle Kit

## External Dependencies

### AI Services (via Replit AI Integrations)
- OpenAI API (`AI_INTEGRATIONS_OPENAI_API_KEY`, `AI_INTEGRATIONS_OPENAI_BASE_URL`)
- Anthropic Claude (`AI_INTEGRATIONS_ANTHROPIC_API_KEY`, `AI_INTEGRATIONS_ANTHROPIC_BASE_URL`)
- Google Gemini (`AI_INTEGRATIONS_GEMINI_API_KEY`, `AI_INTEGRATIONS_GEMINI_BASE_URL`)

### Database
- PostgreSQL (`DATABASE_URL` environment variable required)
- Used for session storage, build history, and generated code persistence

### Audio Processing
- Requires `ffmpeg` for WebM to WAV conversion (available by default on Replit)
- Uses Web Audio API worklets for streaming playback

### Key NPM Dependencies
- `drizzle-orm` + `drizzle-kit`: Database ORM and migrations
- `openai`: OpenAI and Gemini API client
- `@anthropic-ai/sdk`: Claude API client
- `express` + `express-session`: HTTP server and sessions
- `zustand`: Client-side state management
- `@tanstack/react-query`: Server state synchronization
- Radix UI primitives: Accessible component foundations

## Recent Changes
- Renamed from "Vibe Coder" to "Vibenicity"
- Updated UI to Lovable-style design with cyan/magenta/purple color scheme
- Optimized build pipeline from 3 to 2 AI calls (33% faster)
- Added free planning mode for prompt refinement
- Added file version history with auto-versioning on generation
