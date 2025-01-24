# Educational AI Assistant Project

## Project Vision
An AI-powered personal assistant designed for students aged 10-18 to support their educational journey.

### Core Features
- **Daily Learning Reflection**: Help students verbalize their daily achievements
- **Goal Setting**: Assist in setting objectives for the next day
- **Comprehension Support**: Ensure lessons are understood and provide additional help
- **Progress Tracking**: Maintain logs of studied topics and personal assessments
- **Contextual Awareness**: Follow up on previous discussions and activities
- **Proactive Engagement**: Initiate conversations about the student's learning journey
- **Resource Management**: 
  - Support for lesson material uploads (PDF, images)
  - Context-aware discussions about uploaded content
  - Visual learning support through shared materials

### AI Personality
- Friendly and concise communication style
- Embodies a knowledgeable, fun, and inspiring young teacher
- Acts as a source of inspiration for young minds

## Technical Architecture

### Core Technologies
- **LLM Integration**: Together AI services for inference
  - Base model: Llama 3.1 70B from Meta
- **Foundation**: Based on [LlamaTutor](https://github.com/Nutlope/llamatutor)

### Frontend Stack
- **Framework**: Next.js with App Router
- **Language**: TypeScript
- **Styling**: 
  - Tailwind CSS for utility-first styling
  - shadcn/ui for core components
    - Accessible components
    - Dark mode support
    - Customizable design system
- **UI Library**: React components
- **Internationalization**: 
  - next-intl for message translations
  - Type-safe messages using TypeScript
  - Simple JSON-based translations
  - Message structure:
    ```
    messages/
    ├── en.json     # English translations
    ├── fr.json     # French translations
    └── ...         # Other languages
    ```
  - No locale-based routing needed
  - Required environment variables:
    ```
    NEXT_PUBLIC_DEFAULT_LOCALE=en
    ```

### Authentication & User Management
- **Platform**: Clerk.js
  - Custom authentication flows
  - User profiles and session handling
  - Role-based access control (students/teachers)
  - Secure route protection
  - School/class organization management
  - Required environment variables:
    ```
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
    CLERK_SECRET_KEY
    ```

### Additional Services
- **Search**: Serper API
- **File Storage**: Uploadthing
  - Purpose-built for Next.js applications
  - Simple developer experience
  - Handles multiple file types (PDFs, images)
  - Generous free tier for POC/MVP
  - Required environment variables:
    ```
    UPLOADTHING_SECRET
    UPLOADTHING_APP_ID
    ```
- **Monitoring**: 
  - Helicone for LLM observability
  - Plausible for privacy-friendly analytics

### Database
- **Platform**: Vercel Postgres
  - Simple setup and zero-config deployment with Next.js
  - Built on Neon's serverless PostgreSQL
  - Sufficient for POC/MVP needs
  - Free tier available for development
  - Easy local development with Prisma
  - Required environment variables:
    ```
    POSTGRES_URL
    POSTGRES_PRISMA_URL
    POSTGRES_URL_NON_POOLING
    ```

### Development Tools
- ESLint (linting)
- Prettier (formatting)
- PostCSS (CSS processing)
- Modern JS/TS build tooling
- Environment variables management

### Environment Setup
Required environment variables:
```env
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY

# Database
POSTGRES_URL
POSTGRES_PRISMA_URL
POSTGRES_URL_NON_POOLING

# File Storage
UPLOADTHING_SECRET
UPLOADTHING_APP_ID

# AI Services
TOGETHER_API_KEY
SERPER_API_KEY

# Monitoring
HELICONE_API_KEY
PLAUSIBLE_API_KEY
```

## User Journey

### Authentication Flow
- User logs in via Clerk.js authentication
- Assistant greets user personally, referencing their profile and recent history
- Time-aware interactions based on user's local time

### First-Time Experience
- **Morning Login**: Focus on day planning and goal setting
  - Upcoming lessons preparation
  - Learning objectives for the day
- **Afternoon Login**: Day reflection and progress review
  - Activities completed
  - Learning achievements
  - Challenges encountered

### Daily Interactions
- **Context-Aware Conversations**
  - References scheduled subjects from user's timetable
  - Follows up on previous learning goals
  - Adapts to user's academic calendar
  - Discusses uploaded learning materials
    - "I see you've uploaded your Biology notes. Would you like to review the key concepts?"
    - "That math problem image looks challenging. Let's break it down together."
    - "I notice this PDF is about Shakespeare. What aspects of the play would you like to explore?"

### Learning Reflection
- **Guided Discussion Points**
  - Subject-specific reflection
  - Key concepts learned
  - Areas of interest or difficulty
  - Future learning preferences
  - Action items for next session

This personalized approach ensures meaningful educational support while maintaining engagement through contextual awareness.

## Documentation References

### Core Technologies
- [Together AI Documentation](https://docs.together.ai/docs/introduction)
- [LlamaTutor Repository](https://github.com/Nutlope/llamatutor)

### Frontend & UI
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [React Documentation](https://react.dev/learn)

### Authentication & User Management
- [Clerk.js Documentation](https://clerk.com/docs)

### Database & Infrastructure
- [Vercel Postgres Documentation](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma Documentation](https://www.prisma.io/docs)

### Additional Services
- [Serper API Documentation](https://serper.dev/docs)
- [Uploadthing Documentation](https://docs.uploadthing.com)
- [Helicone Documentation](https://docs.helicone.ai/)
- [Plausible Analytics Documentation](https://plausible.io/docs)

### Development Tools
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [PostCSS Documentation](https://postcss.org/docs/)

This reference list includes all major technologies and tools used in the project for easy access during development.

### Error Handling & Monitoring
- Error boundary implementation
- API error handling strategy
- Monitoring and logging approach

### Performance Considerations
- Image optimization with Next.js Image
- API route caching strategies
- Database query optimization

### Security Measures
- Authentication with Clerk.js
- API route protection
- File upload validation
- Rate limiting implementation

### Deployment
- Platform: Vercel
- Database: Vercel Postgres
- Environment Variables: Configured in Vercel dashboard
- Build Command: `pnpm build`
- Output Directory: `.next`



