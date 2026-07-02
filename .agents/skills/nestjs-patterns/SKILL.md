---
name: nestjs-patterns
description: Guidelines and patterns for NestJS backend modules, services, controllers, and GraphQL code-first schema decorators.
---

# NestJS Design Patterns

- **Controller/Resolver Separation**: Controllers handle REST; Resolvers handle GraphQL.
- **Service Isolation**: Services contain all business logic.
- **Strict DTO validation**: Use `class-validator` and `class-transformer` on all incoming payloads.
