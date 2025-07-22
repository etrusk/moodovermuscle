# MoodOverMuscle - Fitness for Mums Website

A modern, accessible fitness website built with Next.js and deployed on Vercel.

<!-- Verifying GitHub-Vercel integration -->

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/redundant-koalas-projects-c165d4a1/moodovermuscle)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/jovial-banana-9934/moodovermuscle-website)

## About MoodOverMuscle

MoodOverMuscle is a fitness website for mothers on the Sunshine Coast, Queensland. The platform focuses on postnatal fitness, mental wellbeing, and building a supportive community for mums. Created by Emily, a certified Safe Return to Exercise trainer and mother herself.

### Key Features
- **Free first session** - No payment or commitment required
- **Multi-step booking form** - Streamlined user experience
- **Responsive design** - Mobile-first approach
- **Accessibility focused** - WCAG compliant design
- **Community gallery** - Showcasing the M.O.M.unity in action

## Technology Stack

- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3.4.17
- **UI Components**: shadcn/ui built on Radix UI
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: pnpm

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Homepage
│   ├── globals.css        # Global styles
│   └── classes/           # Additional pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── booking-form.tsx  # Multi-step booking form
│   └── theme-provider.tsx
├── lib/                  # Utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
│   └── images/          # Image assets
└── .kiro/               # Kiro IDE configuration
    └── steering/        # LLM guidance files
```

## Development Guidelines

### Code Style
- Use TypeScript with strict mode
- Follow Tailwind CSS utility-first approach
- Implement responsive design (mobile-first)
- Use semantic HTML and ARIA labels for accessibility

### Component Patterns
- Functional components with hooks
- Use `"use client"` directive for interactive components
- Props interfaces for type safety
- Consistent naming: kebab-case files, PascalCase components

### Styling Conventions
- Primary colors: Rose/Pink gradients (`from-rose-500 to-pink-500`)
- Text colors: Stone variants (`text-stone-600`, `text-stone-900`)
- Success/Free elements: Green gradients (`from-green-500 to-emerald-500`)
- Rounded corners: `rounded-2xl`, `rounded-3xl`, `rounded-full`
- Shadows: Layered system (`shadow-lg`, `shadow-xl`, `shadow-2xl`)

## Key Components

### BookingForm
Multi-step form component with:
- Step 1: Personal information
- Step 2: Service selection
- Step 3: Scheduling and final details
- Progress indicator and validation
- Mobile-optimized UX

### Homepage Sections
- **Hero**: Emotional hook with FREE session emphasis
- **About**: Emily's story and credentials
- **How It Works**: 4-step process explanation
- **Gallery**: Community photos and social proof
- **Contact**: Location and contact information

## Deployment

### Vercel Integration
- **Auto-deployment**: Automatic deployments from GitHub main branch
- **Preview deployments**: Each PR gets a preview URL for testing
- **Production deployment**: Merges to main trigger production deployment
- **Environment variables**: Managed through Vercel dashboard
- **Static export ready**: Optimized for static hosting
- **Domain**: Production site at moodovermuscle.com.au

### Development Workflow
1. Create feature branches for new development
2. Push changes to GitHub to trigger preview deployments
3. Create pull requests for code review
4. Merge to main branch for production deployment

## Content & Brand Guidelines

### Voice & Tone
- Conversational and supportive ("Hi mama", "lovely")
- Emphasizes community ("M.O.M.unity", "stronger together")
- No-pressure approach ("no bouncing back", "just come as you are")
- Mental health focus ("Mood Over Muscle")

### Target Audience
- New mothers seeking postnatal fitness recovery
- Mums looking for supportive fitness community
- Women wanting to balance physical and mental wellbeing
- Busy mothers needing flexible fitness options

## Contributing

When making changes:
1. Follow the established code patterns
2. Test on mobile devices
3. Ensure accessibility compliance
4. Update documentation as needed
5. Test the booking form flow thoroughly

## Support

For technical issues or questions about the codebase, refer to:
- `.kiro/steering/` files for development guidance
- Next.js documentation for framework questions
- Tailwind CSS docs for styling
- shadcn/ui docs for component usage
