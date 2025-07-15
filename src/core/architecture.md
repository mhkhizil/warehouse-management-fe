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

## Created UI Components:

1. **`alert-dialog.tsx`** - For confirmation dialogs
2. **`toast.tsx`** - For toast notifications
3. **`toaster.tsx`** - Toast provider component
4. **`use-toast.ts`** - Toast hook for managing notifications
5. **`separator.tsx`** - For visual separators
6. **`select.tsx`** - For dropdown selections
7. **`label.tsx`** - For form labels

## Fixed Code Issues:

1. **AuthService.ts** - Fixed the linter error by properly creating a User object instead of a plain object

## Required Dependencies:

To complete the setup, you'll need to install these dependencies:

```bash
npm install @radix-ui/react-alert-dialog @radix-ui/react-toast @radix-ui/react-separator @radix-ui/react-select @radix-ui/react-label class-variance-authority
```

These are the underlying Radix UI primitives that the components use.

## Final Step:

You'll also need to add the `<Toaster />` component to your root App component to enable toast notifications throughout your app:

```tsx
import { Toaster } from "@/components/ui/toaster";

function App() {
  return (
    <div>
      {/* Your existing app content */}
      <Toaster />
    </div>
  );
}
```

Would you like me to help you install these dependencies or make any other adjustments to the user management system?
