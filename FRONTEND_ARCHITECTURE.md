# Frontend Architecture Documentation

> Auto-generated overview based on the current repository.

## Tech Stack
- React 19
- TypeScript 5
- Vite 7
- Tailwind CSS v4
- React Router v7
- TanStack React Query v5
- Zod
- Framer Motion
- Lucide React
- Sonner

## Root Structure

```
vehicle-insurance-application-main/
├── src/
│   ├── components/
│   ├── constants/
│   ├── hooks/
│   ├── lib/
│   ├── mock/
│   ├── pages/
│   ├── router/
│   ├── schemas/
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Folder Responsibilities

### src/components
Reusable UI and error boundary components.

Files:
- ErrorBoundary.tsx — catches rendering/runtime errors.
- RouteErrorPage.tsx — displays route-level failures.

### src/constants
Application constants such as route definitions and React Query keys.

### src/hooks
Business logic encapsulated into custom hooks.
- useAuth
- useClaims
- usePolicies

These separate UI from data access.

### src/lib
Shared utilities:
- api.ts – API abstraction layer.
- queryClient.ts – React Query configuration.
- breadcrumbs.ts – breadcrumb generation.
- utils.ts – helper utilities.

### src/mock
Mock datasets for development.
Contains claims, policies, users, payments, notifications and audit logs.

### src/pages
Top-level page components.
Current pages:
- LandingPage
- NotFoundPage

### src/router
Central routing.
- AppRouter
- PrivateRoute
- AdminRoute

### src/schemas
Validation schemas using Zod.

## Application Flow

main.tsx
→ App.tsx
→ AppRouter
→ Route Guards
→ Pages
→ Components
→ Hooks
→ API/Mocks

## Data Layer

UI
↓
Custom Hooks
↓
React Query
↓
api.ts
↓
Backend / Mock Data

## Libraries

| Library | Purpose |
|---------|----------|
| React | UI |
| React Router | Routing |
| React Query | Server state |
| Tailwind | Styling |
| Zod | Validation |
| Framer Motion | Animations |
| Sonner | Toasts |
| Lucide | Icons |

## Architecture Principles

- Feature separation
- Reusable hooks
- Shared utility layer
- Route guards
- Schema-driven validation
- Query-based server state
- Component composition

## Developer Guidelines

1. Pages should remain thin.
2. Business logic belongs in hooks.
3. API calls go through lib/api.ts.
4. Validation belongs in schemas.
5. Constants remain centralized.
6. Components should be reusable.

## Future Improvements

- Feature-based folder organization
- API service modules
- Authentication context
- Testing setup
- Storybook
- CI/CD
- Error logging
- Performance monitoring

