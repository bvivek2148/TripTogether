# TripTogether - Development Guide

## Development Environment Setup

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher (comes with Node.js)
- **Git**: For version control
- **VS Code**: Recommended IDE with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense"
  ]
}
```

## Project Setup

### 1. Clone and Install
```bash
# Clone the repository
git clone <repository-url>
cd TripTogether

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

### 2. Environment Configuration
Create `.env` file with the following variables:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="development-secret-change-in-production"

# Google OAuth (Optional for development)
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Stripe Configuration (Test keys)
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Google Maps API
GOOGLE_MAPS_API_KEY="your_google_maps_api_key"

# Email Configuration (Optional for development)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@triptogether.com"

# Development Settings
NODE_ENV="development"
DEBUG="true"
```

### 3. Database Setup
```bash
# Run initial migration
npx prisma migrate dev --name init

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Development Workflow

### Daily Development Process
1. **Pull Latest Changes**
   ```bash
   git pull origin main
   npm install  # If package.json changed
   ```

2. **Database Updates**
   ```bash
   npx prisma migrate dev  # Apply new migrations
   npx prisma generate     # Regenerate client if schema changed
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Code Quality Checks**
   ```bash
   npm run lint           # Check for linting errors
   npx tsc --noEmit      # TypeScript type checking
   ```

### Branch Strategy
- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/**: Individual feature branches
- **hotfix/**: Critical bug fixes

### Commit Convention
```
type(scope): description

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Code style changes
- refactor: Code refactoring
- test: Adding tests
- chore: Maintenance tasks

Examples:
feat(auth): add Google OAuth integration
fix(booking): resolve payment processing error
docs(api): update API documentation
```

## Code Organization

### File Naming Conventions
- **Components**: PascalCase (`UserProfile.tsx`)
- **Pages**: kebab-case (`user-profile.tsx`)
- **Utilities**: camelCase (`formatCurrency.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Component Structure
```tsx
// Component file structure
import { useState, useEffect } from 'react'
import { ComponentProps } from './types'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props extends ComponentProps {
  // Component-specific props
}

export function ComponentName({ prop1, prop2, ...props }: Props) {
  // Hooks
  const [state, setState] = useState()
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // Render
  return (
    <div className={cn("base-classes", props.className)}>
      {/* Component JSX */}
    </div>
  )
}
```

### API Route Structure
```typescript
// API route structure
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

// Request validation schema
const requestSchema = z.object({
  // Schema definition
})

export async function GET(request: NextRequest) {
  try {
    // Implementation
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Database Development

### Schema Changes
1. **Modify Schema**
   ```prisma
   // prisma/schema.prisma
   model NewModel {
     id        String   @id @default(cuid())
     name      String
     createdAt DateTime @default(now())
   }
   ```

2. **Create Migration**
   ```bash
   npx prisma migrate dev --name add_new_model
   ```

3. **Generate Client**
   ```bash
   npx prisma generate
   ```

### Database Seeding
Create seed data for development:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Seed data creation
  await prisma.user.createMany({
    data: [
      // User data
    ]
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Run seeding:
```bash
npx prisma db seed
```

## Testing Strategy

### Unit Testing
```typescript
// Component testing with Jest and React Testing Library
import { render, screen } from '@testing-library/react'
import { ComponentName } from './ComponentName'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected Text')).toBeInTheDocument()
  })
})
```

### API Testing
```typescript
// API route testing
import { createMocks } from 'node-mocks-http'
import handler from './api/route'

describe('/api/endpoint', () => {
  it('handles GET request', async () => {
    const { req, res } = createMocks({
      method: 'GET',
    })
    
    await handler(req, res)
    expect(res._getStatusCode()).toBe(200)
  })
})
```

### E2E Testing
```typescript
// Playwright E2E testing
import { test, expect } from '@playwright/test'

test('user can create booking', async ({ page }) => {
  await page.goto('/dashboard')
  await page.click('[data-testid="book-cab"]')
  await expect(page).toHaveURL('/booking/new')
})
```

## Performance Optimization

### Frontend Optimization
- **Code Splitting**: Use dynamic imports for large components
- **Image Optimization**: Use Next.js Image component
- **Bundle Analysis**: Regular bundle size monitoring
- **Lazy Loading**: Implement lazy loading for non-critical components

### Backend Optimization
- **Database Queries**: Optimize Prisma queries with includes/selects
- **Caching**: Implement caching for frequently accessed data
- **API Response**: Minimize API response sizes
- **Error Handling**: Implement proper error boundaries

## Debugging

### Frontend Debugging
- **React DevTools**: Browser extension for React debugging
- **Console Logging**: Strategic console.log placement
- **Network Tab**: Monitor API calls and responses
- **Performance Tab**: Identify performance bottlenecks

### Backend Debugging
- **Prisma Studio**: Visual database browser
- **API Testing**: Use tools like Postman or Thunder Client
- **Server Logs**: Monitor server console for errors
- **Database Logs**: Check database query performance

### Common Issues and Solutions

1. **Database Connection Issues**
   ```bash
   # Reset database
   npx prisma migrate reset
   npx prisma migrate dev
   ```

2. **TypeScript Errors**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Check TypeScript
   npx tsc --noEmit
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

## Deployment Preparation

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] TypeScript compilation successful
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Performance testing completed
- [ ] Security review completed

### Production Build
```bash
# Build for production
npm run build

# Test production build locally
npm start
```

## Contributing Guidelines

### Code Review Process
1. Create feature branch
2. Implement changes with tests
3. Run quality checks
4. Submit pull request
5. Address review feedback
6. Merge after approval

### Quality Standards
- **Test Coverage**: Minimum 80% coverage
- **TypeScript**: Strict mode enabled
- **Linting**: ESLint rules enforced
- **Documentation**: Code comments for complex logic
- **Performance**: No performance regressions

---

This development guide ensures consistent development practices and high code quality across the TripTogether project.
