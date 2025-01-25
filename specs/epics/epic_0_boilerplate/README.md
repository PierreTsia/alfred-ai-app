# Epic 0: Project Boilerplate Setup

## Overview

Initial project setup based on LlamaTutor boilerplate, including development environment customization, core dependencies, and project structure adaptation.

## Goals

- Clone and clean up LlamaTutor boilerplate
- Customize for our educational assistant needs
- Configure essential development tools
- Establish project structure
- Set up CI/CD pipeline

## Technical Requirements

- Node.js 18+
- pnpm as package manager (converting from npm)
- Next.js 14 with App Router
- TypeScript 5
- Tailwind CSS
- shadcn/ui
- ESLint + Prettier

## Tasks

1. [ ] Initial Setup

   - ✅ Clone LlamaTutor repository
   - ⏩ Remove unnecessary components and features (postponed - keeping base structure)
   - ✅ Convert from npm to pnpm
   - ✅ Set up PostCSS configuration
   - ✅ Install and configure next-intl
   - ✅ Update dependencies to latest versions

2. [ ] Development Tools Setup

   - ✅ Configure ESLint
   - ✅ Set up Prettier
   - ✅ Configure VS Code settings
   - Set up environment variables management
   - Add environment validation utilities

3. [ ] UI Foundation

   - ✅ Review existing Tailwind configuration
   - ✅ Install and configure shadcn/ui components
   - ✅ Ensure dark mode support (comes with shadcn setup)
   - Implement base accessibility features
   - Set up responsive design foundations

4. [ ] Project Structure

   - Audit existing directory structure
   - ✅ Create internationalization message structure
   - ❌ ~~Set up Supabase through Vercel integration~~
   - ❌ ~~Configure Uploadthing for file storage~~
   - ✅ Create base components directory
   - ✅ Set up API routes structure
   - Add placeholder pages
   - ✅ Set up Convex database and schema
   - [ ] Set up Clerk for authentication

5. [ ] Environment Setup

   - Create comprehensive .env.example with all variables:

     ```
     # Authentication
     NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
     CLERK_SECRET_KEY

     # Database
     NEXT_PUBLIC_CONVEX_URL
     CONVEX_DEPLOYMENT
     CONVEX_ADMIN_KEY

     # File Storage
     UPLOADTHING_SECRET
     UPLOADTHING_APP_ID

     # AI Services
     TOGETHER_API_KEY
     SERPER_API_KEY

     # Monitoring
     HELICONE_API_KEY
     PLAUSIBLE_API_KEY

     # Internationalization
     NEXT_PUBLIC_DEFAULT_LOCALE
     ```

   - Document required environment variables
   - Set up environment validation
   - Create development and production environment guides

## Dependencies

- LlamaTutor boilerplate
- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- ESLint
- Prettier
- next-intl

## Expected Outcome

- Clean, customized version of LlamaTutor
- Fully configured development environment
- Project structure ready for educational features
- Working build pipeline
- Development tools and linting in place
- Internationalization support with language switching

## Testing Criteria

- Clean build with no errors
- ESLint passes without warnings
- Prettier formatting works
- Development server runs successfully
- No remnants of unnecessary LlamaTutor features
- Language switching works correctly
- Locale detection and fallback work as expected

## Resources

- [LlamaTutor Repository](https://github.com/Nutlope/llamatutor)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Setup](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Installation](https://tailwindcss.com/docs/installation)
- [shadcn/ui Setup](https://ui.shadcn.com/docs/installation)
- [ESLint Configuration](https://eslint.org/docs/latest/use/getting-started)
- [Prettier Setup](https://prettier.io/docs/en/install.html)
- [next-intl Documentation](https://next-intl.dev/)

DATABASE_URL postgresql://neondb_owner:**\*\***@ep-late-mode-a9njynl7-pooler.gwc.azure.neon.tech/neondb?sslmode=require
DATABASE_URL_UNPOOLED postgresql://neondb_owner:**\*\***@ep-late-mode-a9njynl7.gwc.azure.neon.tech/neondb?sslmode=require
