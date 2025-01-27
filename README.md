<div align="center">
  <h1>N.C3 <em style="font-size: 0.4em">(nice /naɪs/)</em> starter template</h1>
  <p>A modern full-stack template that's nice to work with 😉</p>

  <video width="100%" controls>
    <source src="https://raw.githubusercontent.com/PierreTsia/alfred-ai-app/main/public/nc3-demo.mp4" type="video/mp4">
    Your browser does not support the video tag.
  </video>
</div>

## TODOs

- [ ] Set up authentication flow with Clerk
- [ ] Implement real-time chat with Convex
- [ ] Add file upload and management system
- [ ] Create responsive dashboard layout
- [ ] Integrate Together AI for LLM features
- [ ] Set up analytics with Plausible
- [ ] Add dark mode support
- [ ] Implement search functionality
- [ ] Create user settings page
- [ ] Add API rate limiting and caching

## What's N.C3?

N.C3 is a carefully curated stack that combines powerful modern technologies:

- **N**ext.js 14 - React framework with App Router
- **C**lerk - Authentication & User Management
- **C**onvex - Backend & Real-time Database
- **C**ursor AI - AI-powered Development

## Tech Stack

### AI & Machine Learning

- [Together AI](https://docs.together.ai/) - LLM inference platform
- [Llama 3.1 70B](https://ai.meta.com/llama/) - Large Language Model from Meta

### Framework & Core

- [Next.js 14](https://nextjs.org/docs) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org/docs/) - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/docs) - Utility-first CSS framework

### Authentication & User Management

- [Clerk](https://clerk.com/docs) - Authentication and user management

### UI Components & Styling

- [shadcn/ui](https://ui.shadcn.com/docs) - Re-usable components built with Radix UI and Tailwind
- [Lucide Icons](https://lucide.dev/docs/lucide-react) - Beautiful open-source icons

### Data & API

- [Convex](https://docs.convex.dev/) - Backend platform and real-time database
- [Zod](https://zod.dev/) - TypeScript-first schema validation

### Search & Analytics

- [SERP API](https://serper.dev/) - Search engine results API
- [Helicone](https://docs.helicone.ai/) - LLM observability platform
- [Plausible](https://plausible.io/docs) - Privacy-friendly analytics

### Development Tools

- [Prettier](https://prettier.io/docs/en/) - Code formatter
- [ESLint](https://eslint.org/docs/latest/) - JavaScript linter

## Cloning & running

1. Fork or clone the repo
2. Create an account at [Together AI](https://togetherai.link) for the LLM
3. Create an account at [SERP API](https://serper.dev/) or with Azure ([Bing Search API](https://www.microsoft.com/en-us/bing/apis/bing-web-search-api))
4. Create an account at [Helicone](https://www.helicone.ai/) for observability
5. Create a `.env` (use the `.example.env` for reference) and replace the API keys
6. Run `npm install` and `npm run dev` to install dependencies and run locally

## Future Tasks

- [ ] Add file upload functionality with drag & drop support
- [ ] Implement OCR capabilities and searchable file content
- [ ] Add theme customization (dark/light mode + custom colors)
- [ ] Set up testing infrastructure
  - [ ] Unit tests with Jest/Vitest
  - [ ] E2E tests with Playwright/Cypress
  - [ ] Set up GitHub Actions for CI pipeline

## Project Architecture

This project follows a feature-first architecture with clear separation of concerns:

```bash
/
├── app/              # Next.js App Router routes and layouts
├── core/            # Core application code
│   ├── config/      # App-wide configuration (i18n, etc.)
│   ├── types/       # Shared TypeScript types
│   └── utils/       # Core business utilities
├── features/        # Feature modules
│   ├── chat/
│   ├── tasks/
│   └── files/
├── lib/             # Shared libraries
│   └── utils/       # UI utilities (shadcn)
├── components/      # Shared UI components
│   ├── ui/          # shadcn components
│   └── shared/      # app-wide components
├── hooks/          # Shared React hooks
├── public/         # Static assets
└── messages/       # i18n translation files
```

### Key Decisions
- Feature-first organization following domain-driven design
- Core business logic separated from UI utilities
- Convex handles all data operations (no services layer needed)
- UI utilities follow shadcn conventions in `lib/utils`
- Shared components split between shadcn and custom components

For detailed architecture guidelines, see [ARCHITECTURE.md](./ARCHITECTURE.md).
