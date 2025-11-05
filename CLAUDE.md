# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MediaBot is an AI-powered Social Media Marketing (SMM) automation platform for small businesses worldwide. Built with React/TypeScript on the Lovable platform, it integrates with n8n workflows for AI processing.

**Target Market**: Global small businesses (SMBs) who need affordable, automated social media content creation and management.

# Контекст проекта

Текущая дата: 4 августа 2025 года
Текущий год: 2025

## 🚨 CURRENT SPRINT FOCUS (Priority Order)

### 1. Main Workflow Implementation (HIGHEST PRIORITY)

- **Workflow Name**: "Main workflow"
- **Status**: Ready for implementation
- **Infrastructure**: ✅ n8n PostgreSQL authentication FIXED (7 Aug 2025)
- **Next Step**: Develop single production-ready "Main workflow"

### 2. Documentation Updates

- Keep all docs synchronized with actual implementation
- Focus on clear, actionable documentation

### 3. Frontend Minimal Updates (10h max)

- Only essential changes for testing
- No design decisions yet
- Focus on functionality over aesthetics

## Essential Commands

### Development

```bash
npm install          # Install dependencies
npm run dev         # Start dev server (Vite) at http://localhost:5173
```

### Build & Production

```bash
npm run build       # Production build
npm run build:dev   # Development build
npm run preview     # Preview production build locally
```

### Testing & Quality

```bash
npm run test        # Run tests with Vitest
npm run test:ui     # Run tests with UI interface
npm run test:run    # Run tests once (CI mode)
npm run lint        # Run ESLint
```

### Deployment Commands (Updated 2025-08-07)

```bash
make dev             # Start local development
make staging         # Deploy to staging with .env.staging
make full-deploy     # Full cycle: backup → env check → deploy → status
make rollback        # Emergency rollback to last backup
make status          # Check all services status
make check-env       # Verify environment variables
```

## 🚀 Deployment & CI/CD Status

### ✅ Phase 1 Completed (2025-08-07)

**DevOps Optimization Results:**

- **Cleaned deployment scripts**: Removed old `deploy.sh` with incorrect IP (158.160.138.83)
- **Primary deployment**: `deploy.sh` now correctly points to VPS 158.160.190.4
- **Staging environment**: `.env.staging` configured and protected
- **Security improvements**: All `.env*` files added to `.gitignore`
- **Makefile enhanced** with full deployment cycle commands

### Current Deployment Architecture

- **VPS**: Yandex Cloud at 158.160.190.4
- **Platform**: Coolify for container orchestration
- **Deployment Script**: `/deploy.sh` with `set -euo pipefail` safety
- **Staging Config**: `.env.staging` (protected from commits)
- **Backup System**: Automatic backups before deployment

### CI/CD Automation Plan

**Phase 1** ✅ - Script cleanup and Makefile optimization (COMPLETED)
**Phase 2** 🔄 - Local automation with git hooks (NEXT)
**Phase 3** ⏳ - GitHub Actions integration
**Phase 4** ⏳ - Security and rollback mechanisms

## High-Level Architecture

### Frontend Stack

- **React 18** with TypeScript for type safety
- **Vite** for fast development and optimized builds
- **Tailwind CSS** + **shadcn/ui** components for consistent UI
- **React Router** for SPA navigation
- **Zustand** for global state management
- **React Query** for server state and data fetching

### Backend Integration

#### Main Workflow Architecture (Pre-MVP for 15 businesses)

- **Self-hosted n8n instance** ready at http://158.160.190.4:5678
- **Main workflow**: Single production workflow handling all MediaBot operations
- **Infrastructure Status**: All services operational and ready

#### Security & Isolation

- Basic business data isolation (businesses can't see each other's data)
- All operations filtered by `business_id`
- Environment-based credential management
- Minimal security for Pre-MVP phase

#### Performance Considerations

- Small delays acceptable at this stage
- No optimization required yet (15 businesses)
- Queue/caching research needed for future scaling

### Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui base components
│   └── ...            # Feature-specific components
├── contexts/          # React contexts (Auth, Onboarding)
├── pages/             # Route components
│   └── dashboard/     # Dashboard sub-pages
├── services/          # API integrations
├── lib/              # Utilities and helpers
└── store/            # Zustand stores
```

### Key Workflows

1. **Authentication Flow**
   - Email OTP via backend API
   - Session stored in localStorage
   - Protected routes check auth status

2. **Onboarding Process**
   - 3-step questionnaire for new users
   - Saves to backend database
   - Required before accessing dashboard

3. **Main Workflow Integration**
   - All MediaBot functionality through single "Main workflow"
   - Architecture defined by working Main workflow implementation

### Environment Variables

Required in `.env.local`:

```
VITE_API_URL=http://localhost:8080
VITE_N8N_MAIN_WORKFLOW_URL=http://158.160.190.4:5678/webhook/main-workflow
```

**Note**: All `.env*` files (except `.env.example` and `.env.template`) are protected in `.gitignore` as of 2025-08-07

### Deployment

The project will be deployed via Yandex Cloud + Coolify (self-hosted):

- Deployment configuration is in development
- Standard Vite build process (`npm run build`)
- SPA routing handled by server configuration

### Current Status & Unknowns

**Sprint Status**:

- **n8n integration**: ✅ Infrastructure ready for fresh implementation
- **Frontend**: Minimal updates only (10h budget)
- **Documentation**: ✅ Cleaned up for new workflow development

**Next Steps**:

- Implement "Main workflow" in n8n
- Connect frontend to Main workflow webhook
- Document Main workflow functionality and usage

### Development Guidelines

1. **Main Workflow First**: Build single "Main workflow" first, then iterate
2. **Minimal Frontend**: Only essential UI changes until design approved
3. **Quick Iterations**: Focus on working solutions over perfection
4. **Documentation Sync**: Update docs immediately when architecture changes
5. **Deployment Safety**: Always use `make full-deploy` for production deployments (includes backup)
6. **Environment Security**: Never commit `.env*` files (except templates)

### Claude Code Commands

MediaBot project includes specialized slash-commands for efficient development:

#### Project Context & Setup

- `/mediabot-context` - Loads full project context and architecture
- `/debug-issue` - Automated debugging and problem resolution

#### Development Workflow

- `/react-component-create` - Creates React components with TypeScript + Tailwind
- `/n8n-workflow-create` - Creates n8n workflow configurations

#### Deployment & Operations

- `/mediabot-deploy` - Automated deployment with safety checks and rollback

These commands are located in `.claude/commands/` and follow awesome-claude-code best practices.

### Important Notes

- This is a Pre-MVP for 15 businesses - keep solutions simple
- **Unique identifier**: `business_id` (not user_id) for all database operations
- Human content creators use Yandex Tables for content input
- PostgreSQL serves as intermediate storage
- Final content delivery method to frontend is TBD

### Recent Fixes & Updates (August 2025)

#### n8n PostgreSQL Authentication Fix (7 Aug 2025) - ✅ COMPLETED

- **Problem**: `password authentication failed for user "postgres"`
- **Root Causes**:
  - User mismatch (n8n expected `postgres`, PostgreSQL had `mediabot_user`)
  - Password mismatch between components
  - Secure cookie blocking HTTP access (`N8N_SECURE_COOKIE=true`)
- **Solution**:
  - Synchronized all components to use `postgres` user
  - Standardized password: `mediabot_secure_password`
  - Set `N8N_SECURE_COOKIE=false` for HTTP access
  - Used system environment variables to bypass .env parsing issues
- **Status**: ✅ **ALL 5/5 SERVICES WORKING** - Ready for n8n workflow development
- **Documentation**: See `N8N-POSTGRES-FIX-COMPLETE.md` for full troubleshooting history
- **Access**: n8n available at http://158.160.190.4:5678 (mediabot_admin / mediabot_n8n_2025)

#### Deployment Infrastructure

- **VPS**: 158.160.190.4 (Yandex Cloud)
- **Services**: Frontend, API, PostgreSQL, Redis, n8n (all ready)
- **Commands**: `make staging`, `make backup`, `make rollback`
- **Security**: All .env files protected in .gitignore
