# User DTO and Entity Usage Improvements

## Problem Analysis

The user management system had similar issues to the customer management system with how DTOs and entities were being used:

### 1. **Manual Type Definitions Instead of Using DTOs**

- The `IUserRepository` interface manually defined parameter types instead of using existing DTOs
- The `UserManagementService` manually converted between DTOs and entities
- The `useUserManagement` hook manually converted DTOs back to entities

### 2. **Inconsistent Type Usage**

- Some places used DTOs (`CreateUserDTO`, `UpdateUserDTO`)
- Other places manually defined the same types inline
- The repository interface had manual type definitions instead of using DTOs

### 3. **Manual Entity Conversion**

- The service manually converted `UserResponseDTO[]` to `User[]` entities
- The hook manually converted DTOs back to User entities with date parsing
- No centralized mapping logic

## Solutions Implemented

### 1. **Created Domain-Specific DTOs**

Added `UserDomainListResponseDTO` to handle domain responses that need access to User entity methods:

```typescript
// Domain response DTO that uses User entities (for internal service layer)
export interface UserDomainListResponseDTO {
  users: User[];
  totalCounts: number;
}
```

### 2. **Enhanced DTO Mapper**

Added utility methods for consistent data transformation:

```typescript
export class UserDTOMapper {
  static toResponseDTO(user: User): UserResponseDTO {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileImageUrl: user.profileImageUrl,
      createdDate: user.createdDate?.toISOString(),
      updatedDate: user.updatedDate?.toISOString(),
    };
  }

  static toDomainListResponseDTO(
    users: User[],
    totalCounts: number
  ): UserDomainListResponseDTO {
    return {
      users,
      totalCounts,
    };
  }

  static fromCreateDTO(
    dto: CreateUserDTO
  ): Omit<User, "id" | "createdDate" | "updatedDate"> {
    return {
      name: dto.name,
      email: dto.email,
      phone: dto.phone,
      role: dto.role || "STAFF",
      profileImageUrl: undefined,
    };
  }

  static fromUpdateDTO(dto: UpdateUserDTO): Partial<User> {
    const updateData: Partial<User> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.email !== undefined) updateData.email = dto.email;
    if (dto.phone !== undefined) updateData.phone = dto.phone;
    if (dto.role !== undefined) updateData.role = dto.role;

    return updateData;
  }
}
```

### 3. **Updated Service Interface**

Replaced manual type definitions with proper DTOs:

```typescript
// Before
getUserList(params: UserListRequestDTO): Promise<UserListResponseDTO>;

// After
getUserList(params: UserListRequestDTO): Promise<UserDomainListResponseDTO>;
```

### 4. **Updated Service Implementation**

Used proper DTOs and mapper methods:

```typescript
// Before
return {
  users: result.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    profileImageUrl: user.profileImageUrl,
    createdDate: user.createdDate?.toISOString(),
    updatedDate: user.updatedDate?.toISOString(),
  })),
  totalCounts: result.totalCounts,
};

// After
return UserDTOMapper.toDomainListResponseDTO(result.users, result.totalCounts);
```

### 5. **Updated Repository Interface**

Replaced manual type definitions with DTOs:

```typescript
// Before
createUser(userData: {
  name: string;
  email: string;
  phone?: string;
  role?: "ADMIN" | "STAFF";
}): Promise<User>;

// After
createUser(userData: CreateUserDTO): Promise<User>;
```

### 6. **Updated Hook Implementation**

Removed manual entity conversion since we now return User entities directly:

```typescript
// Before
const userEntities = result.users.map(
  (userDto) =>
    new User({
      id: userDto.id,
      name: userDto.name,
      email: userDto.email,
      phone: userDto.phone,
      role: userDto.role,
      profileImageUrl: userDto.profileImageUrl,
      createdDate: userDto.createdDate
        ? new Date(userDto.createdDate)
        : undefined,
      updatedDate: userDto.updatedDate
        ? new Date(userDto.updatedDate)
        : undefined,
    })
);
setUsers(userEntities);

// After
setUsers(result.users);
```

## Benefits Achieved

### 1. **Type Safety**

- Consistent use of DTOs across all layers
- Compile-time type checking for all user operations
- Reduced risk of type mismatches

### 2. **Maintainability**

- Single source of truth for user-related types
- Easy to update types in one place
- Clear separation between domain entities and DTOs

### 3. **Code Reusability**

- DTOs can be reused across different components
- Mapper methods provide consistent data transformation
- Reduced code duplication

### 4. **Domain Logic Preservation**

- `UserDomainListResponseDTO` allows access to domain methods like `isAdmin()`, `isStaff()`, etc.
- `UserResponseDTO` is available for API responses that don't need domain methods

### 5. **Performance Improvement**

- Eliminated unnecessary entity conversion in the hook
- Reduced memory allocation from creating new User instances
- Simplified data flow

### 6. **Clean Architecture**

- Proper separation of concerns between layers
- Clear boundaries between domain, application, and infrastructure layers
- Consistent use of DTOs for data transfer

## Files Modified

1. **`src/core/application/dtos/UserDTO.ts`**

   - Added `UserDomainListResponseDTO`
   - Added `UserDTOMapper` class with utility methods

2. **`src/core/domain/services/IUserService.ts`**

   - Updated to use proper DTOs instead of manual types

3. **`src/core/application/services/UserManagementService.ts`**

   - Updated to use proper DTOs and mapper methods
   - Removed manual entity conversion

4. **`src/core/domain/repositories/IUserRepository.ts`**

   - Updated to use proper DTOs instead of manual types

5. **`src/core/presentation/hooks/useUserManagement.tsx`**
   - Updated to use proper DTOs
   - Removed manual entity conversion
   - Simplified data handling

## Best Practices Established

1. **Use DTOs for Data Transfer**: Always use DTOs for data transfer between layers
2. **Separate Domain and API DTOs**: Use domain DTOs for internal operations and API DTOs for external communication
3. **Use Mapper Methods**: Use mapper methods for consistent data transformation
4. **Avoid Manual Type Definitions**: Don't manually define types that already exist as DTOs
5. **Maintain Type Safety**: Ensure all layers use proper TypeScript types
6. **Minimize Entity Conversion**: Return domain entities directly when possible to preserve domain methods

## Future Improvements

1. **Add Validation DTOs**: Create validation-specific DTOs for input validation
2. **Add Response DTOs**: Create specific response DTOs for different API endpoints
3. **Add Error DTOs**: Create standardized error response DTOs
4. **Add Documentation**: Add JSDoc comments to all DTOs and mapper methods
5. **Add Tests**: Add unit tests for DTO mapper methods
6. **Apply to Other Entities**: Apply the same pattern to other entities in the system
