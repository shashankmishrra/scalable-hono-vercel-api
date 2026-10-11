# SCALABLE EDGE API DESIGN WITH HONO AND VERCEL - Engineering Doc

## 1. Purpose

This document defines a **general-purpose architecture for building scalable Edge APIs with Hono and Vercel**.

The architecture is designed to be:

- Edge-friendly
- scalable
- modular
- easy to test
- easy for developers and coding agents to understand
- framework-light
- domain-oriented
- suitable for production APIs
- compatible with Next.js applications
- independent of any specific product or business domain

The goal is to establish a consistent API architecture that can be reused across multiple applications.

---

# 2. Architecture

The API follows a layered architecture:

```text
                    ┌──────────────────┐
                    │      Client      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Vercel      │
                    │ Edge / Functions │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │       Hono       │
                    │   HTTP Boundary  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Router      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │    Controller    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │     Service      │
                    │  Business Logic  │
                    └────────┬─────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
              ┌──────────┐      ┌──────────────┐
              │  Model   │      │Infrastructure│
              └────┬─────┘      └──────────────┘
                   │
                   ▼
              ┌──────────┐
              │ Drizzle  │
              └────┬─────┘
                   │
                   ▼
              ┌──────────┐
              │PostgreSQL│
              └──────────┘
```

The core request flow is:

```text
Request
  ↓
Middleware
  ↓
Router
  ↓
Validation
  ↓
Controller
  ↓
Service
  ↓
Model
  ↓
Database
```

---

# 3. Design Principles

## 3.1 Hono Is the HTTP Boundary

Hono owns HTTP concerns.

It is responsible for:

- routing
- middleware
- request validation integration
- authentication context
- HTTP responses
- HTTP-specific error handling

Hono should **not contain business logic**.

---

## 3.2 Business Logic Is Framework Independent

The service layer must not depend on Hono.

This allows the same business logic to be used from:

```text
HTTP API
Background Jobs
CLI
Server Components
Cron Jobs
Tests
Other Application Entrypoints
```

The service should not receive or depend on:

```ts
Hono.Context
```

unless there is an explicit HTTP-specific requirement.

---

# 4. Layer Responsibilities

## Router

The router defines the API surface.

```text
GET    /users
GET    /users/:id
POST   /users
PATCH  /users/:id
DELETE /users/:id
```

Responsibilities:

- route definitions
- middleware composition
- request validation
- controller binding

The router should remain declarative.

It should not contain business logic.

---

## Schema

Schemas define the structure of external input using Zod.

```text
Request
   ↓
Zod Schema
   ↓
Validated Input
```

Schemas can validate:

- request bodies
- query parameters
- route parameters
- headers
- other external input

Schema validation answers:

> "Is this input structurally valid?"

It should not answer:

> "Is this operation allowed by the business?"

That belongs to the service layer.

---

## Controller

The controller is the HTTP adapter.

Its responsibility is to translate:

```text
HTTP Request
      ↓
Application Call
      ↓
HTTP Response
```

A controller should:

1. Read validated input.
2. Read relevant request context.
3. Call the service.
4. Return an HTTP response.

Controllers should remain thin.

They should not:

- query the database
- contain business rules
- access Redis directly
- perform storage operations directly
- implement complex workflows

---

# 5. Service Layer

The service layer contains application and business logic.

Typical responsibilities include:

- business rules
- workflows
- authorization decisions
- orchestration
- transactions
- cache decisions
- coordinating models
- coordinating infrastructure services

Example:

```text
createProject()
    │
    ├── validate business rules
    ├── check permissions
    ├── create record
    ├── invalidate cache
    └── return result
```

The service should be usable without HTTP.

```ts
await projectService.createProject(input);
```

not:

```ts
await projectService.createProject(context);
```

---

# 6. Model Layer

The model owns persistence operations.

Responsibilities:

- database queries
- inserts
- updates
- deletes
- database-specific projections
- database transactions where appropriate

The model communicates with:

```text
Drizzle
PostgreSQL
```

The model should not communicate with:

```text
Hono
Controllers
HTTP
Redis
Business Services
```

The model answers:

> "How do I persist or retrieve this data?"

The service answers:

> "What should the application do?"

---

# 7. Dependency Direction

Dependencies must flow in one direction:

```text
Router
   ↓
Controller
   ↓
Service
   ↓
Model
   ↓
Drizzle
   ↓
Database
```

Infrastructure is accessed from the appropriate application layer:

```text
Service
 ├── Model
 ├── Cache
 ├── Storage
 ├── Queue
 └── External Services
```

Avoid:

```text
Controller → Model
Controller → Drizzle
Router → Model
Router → Database
Model → Service
Model → Hono
Model → Redis
Service → Hono Context
```

This prevents architectural coupling and keeps each layer independently testable.

---

# 8. Recommended Project Structure

```text
src/
├── api/
│   ├── app.ts
│   ├── routes.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── rate-limit.ts
│   │   ├── request-id.ts
│   │   └── error-handler.ts
│   │
│   └── resources/
│       ├── users/
│       │   ├── user.schema.ts
│       │   ├── user.model.ts
│       │   ├── user.service.ts
│       │   ├── user.controller.ts
│       │   └── user.router.ts
│       │
│       ├── projects/
│       │   ├── project.schema.ts
│       │   ├── project.model.ts
│       │   ├── project.service.ts
│       │   ├── project.controller.ts
│       │   └── project.router.ts
│       │
│       └── ...
│
├── db/
│   ├── index.ts
│   ├── schema/
│   │   ├── index.ts
│   │   └── ...
│   └── migrations/
│
├── infrastructure/
│   ├── cache/
│   │   ├── cache.ts
│   │   └── redis-cache.ts
│   │
│   ├── storage/
│   │   └── ...
│   │
│   ├── queue/
│   │   └── ...
│   │
│   └── ...
│
└── lib/
    ├── errors/
    │   ├── app-error.ts
    │   ├── conflict-error.ts
    │   ├── forbidden-error.ts
    │   ├── not-found-error.ts
    │   ├── unauthorized-error.ts
    │   └── validation-error.ts
    │
    ├── logger/
    │   └── logger.ts
    │
    └── constants/
```

---

# 9. Resource-Oriented Organization

API functionality should be organized by **domain/resource**, not by technical type.

Prefer:

```text
resources/
├── users/
├── projects/
├── organizations/
├── invoices/
└── subscriptions/
```

over:

```text
controllers/
models/
services/
schemas/
routers/
```

The resource-oriented structure keeps related code together.

For example:

```text
users/
├── user.schema.ts
├── user.model.ts
├── user.service.ts
├── user.controller.ts
└── user.router.ts
```

A developer or coding agent can understand the complete `users` API without navigating across multiple unrelated directories.

---

# 10. Hono + Vercel

Hono serves as the HTTP framework running within the Vercel execution environment.

For Next.js applications, Hono can be mounted through a catch-all Route Handler:

```text
app/
└── api/
    └── [[...route]]/
        └── route.ts
```

The architecture becomes:

```text
Next.js
   │
   └── Route Handler
           │
           ▼
         Hono
           │
           ▼
        API Router
```

The Next.js adapter should remain thin.

Its purpose is to connect the framework runtime to Hono, not to implement application logic.

When using the current Hono Vercel integration, use:

```ts
@hono/vercel
```

rather than the deprecated legacy import:

```ts
hono/vercel
```

---

# 11. Middleware Architecture

Middleware handles cross-cutting HTTP concerns.

Recommended middleware:

```text
middleware/
├── auth.ts
├── rate-limit.ts
├── request-id.ts
└── error-handler.ts
```

## Authentication

Responsible for:

- authenticating requests
- attaching identity/context
- rejecting unauthenticated requests

Authentication should not contain resource-specific business logic.

---

## Rate Limiting

Rate limiting should happen before expensive application work.

```text
Request
  ↓
Rate Limit
  ↓
Authentication
  ↓
Validation
  ↓
Controller
```

Production rate limiting should use a distributed/shared backing store where multiple instances need to share limits.

Do not rely on process-local memory for production distributed rate limiting.

---

## Request ID

Every request should have a request ID.

```text
Request
  ↓
Request ID
  ↓
Application
  ↓
Logs
```

This makes tracing and debugging much easier.

---

# 12. Error Architecture

Errors should be centralized.

Use a small shared error hierarchy:

```text
AppError
├── NotFoundError
├── ConflictError
├── UnauthorizedError
├── ForbiddenError
└── ValidationError
```

Do not create resource-specific errors by default.

Avoid unnecessary classes such as:

```text
UserNotFoundError
ProjectNotFoundError
InvoiceNotFoundError
```

when they all represent the same application-level condition.

Use:

```text
NotFoundError
```

instead.

Create domain-specific errors only when the distinction has actual business meaning.

For example:

```text
ProjectArchivedError
SubscriptionExpiredError
PaymentRequiredError
```

---

# 13. Global Error Handler

Controllers should not repeat error handling.

Avoid:

```ts
try {
  const result = await service.execute();
  return c.json(result);
} catch (error) {
  ...
}
```

in every controller.

Instead:

```text
                    ┌── AppError
                    │
                    ├── ZodError
Request → Controller ─┤
                    └── Unknown Error
                           │
                           ▼
                    Global Error Handler
                           │
                           ▼
                     HTTP Response
```

The global handler should:

- identify known application errors
- handle validation errors
- log unexpected errors
- return consistent HTTP responses
- avoid exposing internal implementation details

---

# 14. Validation

Validation happens at the boundary.

```text
External Input
      ↓
     Zod
      ↓
Validated Input
      ↓
    Service
```

Example:

```ts
const createUserSchema = z.object({
  name: z.string().min(1),
  email: z.email(),
});
```

The schema validates structure.

The service validates business rules.

For example:

```text
Zod:
"Is this email syntactically valid?"

Service:
"Is this email already registered?"
```

---

# 15. Caching

Caching belongs outside the model.

Correct:

```text
Service
 ├── Cache
 └── Model
```

Incorrect:

```text
Model
 └── Redis
```

A typical read operation:

```text
Service
   │
   ▼
Cache
   │
   ├── HIT ───────► Return
   │
   └── MISS
        │
        ▼
      Model
        │
        ▼
      Database
        │
        ▼
      Cache
        │
        ▼
      Return
```

A mutation should invalidate or update relevant cache entries.

```text
Mutation
   ↓
Model
   ↓
Cache Invalidation
```

The model remains unaware of the cache implementation.

---

# 16. Infrastructure Layer

Infrastructure contains implementations that interact with external systems.

Examples:

```text
infrastructure/
├── cache/
├── storage/
├── queue/
├── email/
├── payments/
└── analytics/
```

The goal is to prevent external-service details from leaking throughout the application.

For example:

```text
Service
   ↓
Storage Interface
   ↓
S3 Storage Implementation
```

rather than:

```text
Service
   ↓
AWS SDK
```

everywhere.

Infrastructure should be replaceable where practical.

---

# 17. Database Architecture

The database layer should have a single access path:

```text
Service
   ↓
Model
   ↓
Drizzle
   ↓
PostgreSQL
```

Drizzle is responsible for database interaction.

Avoid mixing multiple ORMs or database access strategies.

Do not allow:

```text
Controller → SQL
Service → SQL
Model → SQL
Random Utility → SQL
```

Database access should remain predictable and discoverable.

---

# 18. API Response Design

API responses should be predictable.

Successful responses should use appropriate HTTP status codes.

Examples:

```text
200 OK
201 Created
204 No Content
```

Errors should consistently communicate:

```text
HTTP Status
Error Code
Human-readable Message
Optional Details
Request ID
```

For example:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Project not found"
  },
  "requestId": "req_123"
}
```

Do not expose stack traces, database errors, or internal implementation details.

---

# 19. Testing Strategy

Testing should prioritize useful coverage rather than maximum test count.

Use:

- **Vitest** for unit and integration testing
- **Playwright** for end-to-end testing

Recommended emphasis:

```text
Integration Tests
       ↓
   Most Important

Unit Tests
       ↓
Business Logic

E2E Tests
       ↓
Critical User Journeys
```

A useful heuristic is:

```text
60% Integration
30% Unit
10% E2E
```

This is a guideline, not a strict requirement.

---

## Integration Tests

API integration tests should exercise the actual request flow:

```text
HTTP
 ↓
Router
 ↓
Validation
 ↓
Controller
 ↓
Service
 ↓
Model
 ↓
Database
```

Example:

```text
tests/
└── integration/
    └── api/
        └── users/
            └── user.api.test.ts
```

Integration tests should be the primary test layer for API resources.

---

## Unit Tests

Unit tests are appropriate for:

- complex business rules
- transformations
- calculations
- authorization logic
- non-trivial service behavior

Do not write unit tests simply to prove that a controller calls a service once.

---

## E2E Tests

Use Playwright for important product journeys.

Examples:

```text
Sign up
Login
Create resource
Complete checkout
Critical workflow
```

Do not create an E2E test for every API endpoint.

---

# 20. Scaffolding with Plop

Plop is the recommended scaffolding mechanism for creating new API resources.

Example:

```bash
bun plop resource users
```

Generated structure:

```text
users/
├── user.schema.ts
├── user.model.ts
├── user.service.ts
├── user.controller.ts
└── user.router.ts
```

And:

```text
tests/
└── integration/
    └── api/
        └── users/
            └── user.api.test.ts
```

Templates:

```text
templates/
└── resource/
    ├── resource.schema.ts.hbs
    ├── resource.model.ts.hbs
    ├── resource.service.ts.hbs
    ├── resource.controller.ts.hbs
    ├── resource.router.ts.hbs
    └── resource.api.test.ts.hbs
```

Plop is not intended to generate business logic.

Its purpose is to establish consistent structure.

---

# 21. Coding Agent Compatibility

The architecture is intentionally optimized for both human developers and coding agents.

Agents should not invent new patterns when an established pattern already exists.

For a new resource:

```text
1. Run Plop
2. Review generated files
3. Define Zod schemas
4. Implement model
5. Implement service
6. Implement controller
7. Register router
8. Add integration tests
```

Agents should preserve dependency direction.

```text
Router
  ↓
Controller
  ↓
Service
  ↓
Model
```

Agents should not introduce:

- new architectural layers without justification
- duplicate database access patterns
- resource-specific abstractions unnecessarily
- business logic inside controllers
- database access inside routers
- HTTP dependencies inside services
- infrastructure dependencies inside models

---

# 22. Code Quality Standards

Code should optimize for readability and maintainability.

## Naming

Use descriptive names:

```ts
userId
existingUser
updatedUser
databaseConnection
isArchived
hasPermission
shouldRefresh
canDelete
```

Boolean variables should communicate intent.

Prefer:

```ts
isActive
hasPermission
canEdit
shouldRefresh
```

over:

```ts
active
permission
edit
refresh
```

---

## Functions

Functions should generally have a single responsibility.

Prefer:

```text
small
focused
predictable
```

Avoid large functions that mix:

```text
validation
business logic
database queries
HTTP response construction
logging
cache management
```

A function requiring many parameters should usually accept a configuration/input object.

---

## Control Flow

Prefer guard clauses:

```ts
if (!user) {
  throw new NotFoundError("User not found");
}

if (!user.isActive) {
  throw new ForbiddenError("User is inactive");
}

return updateUser(user);
```

over deeply nested conditionals.

Avoid magic values.

Use named constants where values have business meaning.

---

# 23. Formatting

Use automated formatting.

Recommended:

```text
Prettier
```

Formatting should enforce:

- consistent indentation
- consistent spacing
- clean imports
- readable line lengths
- predictable object formatting
- consistent method chaining

Formatting should be automatic rather than dependent on individual developer preference.

---

# 24. Documentation and Comments

Comments should explain **why**, not **what**.

Bad:

```ts
// Get the user
const user = await getUser(userId);
```

Good:

```ts
// Load the existing user before mutation so ownership can be verified.
const user = await getUser(userId);
```

Avoid:

- dead comments
- commented-out code
- debugging comments
- obvious comments

Public APIs and complex exported functionality should have concise documentation where useful.

---

# 25. Scalability Model

The architecture scales by keeping responsibilities isolated.

```text
                    API
                     │
             ┌───────┴───────┐
             ▼               ▼
         Resource A      Resource B
             │               │
             ▼               ▼
          Service          Service
             │               │
       ┌─────┴─────┐   ┌─────┴─────┐
       ▼           ▼   ▼           ▼
     Model       Cache Model      Queue
       │               │
       └───────┬───────┘
               ▼
           PostgreSQL
```

As the system grows:

- resources remain isolated
- services remain independently testable
- infrastructure remains replaceable
- middleware remains centralized
- database access remains predictable
- API routing remains simple

The architecture should scale in **complexity without scaling architectural confusion**.

---

# 26. Architectural Rules

The following rules are considered foundational.

### Rule 1

**Hono is the HTTP boundary.**

### Rule 2

**Controllers handle HTTP; services handle business logic.**

### Rule 3

**Models handle persistence; they do not contain business workflows.**

### Rule 4

**Drizzle is the database access layer.**

### Rule 5

**Zod validates external input.**

### Rule 6

**Business validation belongs in services.**

### Rule 7

**Services must not depend on Hono.**

### Rule 8

**Controllers must not access the database directly.**

### Rule 9

**Models must not depend on services or HTTP.**

### Rule 10

**Cross-cutting HTTP concerns belong in middleware.**

### Rule 11

**Caching belongs at the application/service layer, not inside models.**

### Rule 12

**External infrastructure belongs behind the infrastructure layer.**

### Rule 13

**Use shared application errors by default.**

### Rule 14

**Use integration tests as the primary API test layer.**

### Rule 15

**Use Plop to scaffold new resources consistently.**

### Rule 16

**Keep the architecture resource-oriented.**

### Rule 17

**Prefer simple abstractions over premature abstraction.**

### Rule 18

**Do not introduce a new architectural pattern when an existing pattern already solves the problem.**

---

# 27. Reference Architecture

The final architecture can be summarized as:

```text
                         ┌───────────────────────┐
                         │        Vercel         │
                         │     Edge Runtime      │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │         Hono          │
                         │     HTTP Boundary     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       Middleware      │
                         │ Auth / Rate Limit /   │
                         │ Request ID / Errors   │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │        Router         │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      Validation       │
                         │         Zod           │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │      Controller       │
                         │      HTTP Adapter     │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌───────────────────────┐
                         │       Service         │
                         │    Business Logic     │
                         └───────┬───────┬───────┘
                                 │       │
                         ┌───────▼───┐ ┌─▼──────────────┐
                         │   Model   │ │ Infrastructure │
                         └───────┬───┘ │ Cache / S3 /   │
                                 │     │ Queue / Email  │
                                 ▼     └────────────────┘
                           ┌───────────┐
                           │  Drizzle  │
                           └─────┬─────┘
                                 │
                                 ▼
                           ┌───────────┐
                           │ PostgreSQL│
                           └───────────┘
```

## Final Principle

> **Keep the HTTP layer thin, the business layer independent, the data layer predictable, and the infrastructure replaceable.**

That is the foundation of a scalable Edge API built with **Hono and Vercel**.