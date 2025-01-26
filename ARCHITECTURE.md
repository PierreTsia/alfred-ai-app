# Project Architecture

This document outlines the directory structure and organization of the NC3 Stack project.

## Directory Structure

```bash
/
├── app/
│   ├── api/
│   ├── (routes)/
│   ├── layout.tsx
│   └── page.tsx
├── core/
│   ├── config/
│   ├── types/
│   └── utils/
├── features/
│   ├── tasks/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/    # Not needed - using Convex mutations/queries
│   ├── files/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/    # Not needed - using Convex mutations/queries
│   └── chat/
│       ├── components/
│       ├── hooks/
│       └── services/    # Not needed - using Convex mutations/queries
├── lib/
│   ├── api/
│   └── utils/
├── components/
│   ├── ui/        # shadcn components
│   └── shared/    # truly shared components
├── hooks/         # shared hooks
├── services/      # Not needed - feature-specific logic lives in Convex
├── public/        # static assets
└── messages/      # i18n files
```

## Directory Purposes

- `app/`: Next.js 14 App Router directory for all routes and layouts
- `core/`: Core application code, types, and utilities
- `features/`: Feature-based modules following domain-driven design
- `lib/`: Shared libraries and utilities
- `components/`: Shared UI components
- `hooks/`: Shared React hooks
- `services/`: Shared services
- `public/`: Static assets like images and fonts
- `messages/`: Internationalization files

## Guidelines

1. Feature-first organization: Each feature has its own components, hooks, and services
2. Shared code goes in appropriate root directories
3. Follow Next.js 14 conventions for routing and API routes
4. Keep UI components separate from feature components
5. Maintain clear boundaries between features

## Notes

- This structure follows domain-driven design principles
- Encourages code organization by feature rather than type
- Provides clear separation between shared and feature-specific code
- Maintains compatibility with Next.js 14 conventions
