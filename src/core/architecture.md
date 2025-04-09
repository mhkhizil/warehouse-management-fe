# Clean Code Architecture (Onion Architecture)

## Overview

This project follows the Onion Architecture pattern, which is a form of layered architecture that emphasizes separation of concerns and dependency inversion. The layers include:

1. **Domain Layer** (Core)

   - Entities: Business objects/models
   - Interfaces: Contracts that define external dependencies

2. **Application Layer**

   - DTOs: Data Transfer Objects
   - Services: Business logic implementation
   - Interfaces: Service contracts

3. **Infrastructure Layer**

   - API: HTTP client implementation (Axios)
   - Repositories: Data access implementations
   - Storage: Local storage implementation

4. **Presentation Layer**
   - Components: UI components
   - Hooks: Custom React hooks
   - Pages: Full page components

## Dependencies Flow

The dependencies flow from the outside in:

- Presentation → Application → Domain
- Infrastructure → Application → Domain

The Domain layer has no dependencies on other layers.

## Key Benefits

- **Testability**: Each layer can be tested in isolation
- **Maintainability**: Changes in one layer won't affect other layers
- **Scalability**: New features or integrations can be added without affecting core logic
- **Separation of Concerns**: Each layer has a specific responsibility
