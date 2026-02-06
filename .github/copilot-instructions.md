# AI Coding Agent Instructions for Civil Service Prep Backend

## Project Overview
This is a NestJS backend application for civil service exam preparation, featuring a modular architecture with feature-based modules. It uses Prisma ORM with PostgreSQL for data management and implements soft deletes, versioning, and comprehensive indexing for performance.

## Architecture & Data Flow
- **Core Modules**: Auth, Behaviours (competency framework), Tests (question banks), Interviews (mock video assessments), Statements (application analysis), Subscriptions (Stripe integration), Admin, Users
- **Data Model**: Users target specific grades (RoleGrade), take tests with questions linked to behaviours, submit answers for scoring, upload interview videos scored against behaviour criteria
- **Key Relationships**: Questions ↔ Behaviours (many-to-many), Tests ↔ Questions, Users ↔ TestAttempts ↔ Answers, Interviews ↔ Scorecards (per behaviour)
- **Soft Deletes**: All models include `deletedAt` field; queries should filter `deletedAt: null`
- **Versioning**: `version` field on all models for optimistic locking

## Critical Workflows
- **Development**: `npm run start:dev` (hot reload), `npm run build` (TypeScript compilation)
- **Database**: `npx prisma generate` (after schema changes), `npx prisma migrate dev` (apply migrations), `npx prisma studio` (GUI)
- **Testing**: `npm run test` (Jest unit tests), `npm run test:e2e` (end-to-end)
- **Linting**: `npm run lint` (ESLint with Prettier)
- **Debugging**: `npm run start:debug` (attach debugger), use VS Code debugger with NestJS configuration

## Project-Specific Patterns
- **Validation**: Global `ValidationPipe` with `whitelist: true, transform: true, forbidNonWhitelisted: true` - all DTOs use class-validator decorators
- **Database Access**: Extend `PrismaService` (injects PrismaClient) in services; use transactions for multi-table operations
- **Module Structure**: Feature modules in `src/[feature]/` with controller, service, optional repository/dto subfolders
- **Auth Guards**: `@UseGuards(JwtAuthGuard, RolesGuard)` on protected routes; `@Roles('ADMIN')` decorator
- **Error Handling**: Use NestJS exceptions; validate inputs strictly to prevent invalid data
- **API Prefix**: All routes prefixed with `/api`; CORS enabled with credentials

## Integration Points
- **Stripe**: Subscription management via `stripeSubscriptionId` in Subscription model
- **Video Upload**: Interview videos stored at `videoUrl` (external service integration needed)
- **External Scoring**: Answers include `behaviourContributions` JSON for complex rubric calculations

## Key Files & Directories
- `src/app.module.ts`: Root module importing all features
- `prisma/schema.prisma`: Complete data model with enums and relations
- `src/common/`: Shared guards (`JwtAuthGuard`, `RolesGuard`), decorators (`Roles`), interceptors
- `src/[module]/dto/`: Request/response DTOs with validation
- `src/tests/`: Repository pattern example (TestRepository, TestAttemptRepository)

## Common Pitfalls
- Always filter soft-deleted records in queries
- Use transactions for related data updates (e.g., answer scoring)
- Validate enum values match Prisma schema
- Include proper indexes for query performance (check schema indexes)
- Handle JSON fields carefully (behaviourContributions, rubricBreakdown)