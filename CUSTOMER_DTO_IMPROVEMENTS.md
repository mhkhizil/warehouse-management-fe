# Customer DTO and Entity Usage Improvements

## Problem Analysis

The customer management system had several issues with how DTOs and entities were being used:

### 1. **Manual Type Definitions Instead of Using DTOs**

- The `useCustomerManagement` hook manually defined return types instead of using existing DTOs
- The service interface manually defined parameter types instead of using DTOs
- The repository manually defined parameter types instead of using DTOs

### 2. **Inconsistent Type Usage**

- Some places used DTOs (`CreateCustomerDTO`, `UpdateCustomerDTO`)
- Other places manually defined the same types inline
- The pagination response type was repeated everywhere instead of using a centralized DTO

### 3. **Missing DTO Usage**

- The `CustomerFilterDTO` existed but wasn't being used consistently
- The `CustomerSearchDTO` existed but wasn't being used
- The `CustomerResponseDTO` existed but wasn't being used for API responses

## Solutions Implemented

### 1. **Created Domain-Specific DTOs**

Added `CustomerDomainListResponseDTO` to handle domain responses that need access to Customer entity methods:

```typescript
// Domain response DTO that uses Customer entities (for internal service layer)
export interface CustomerDomainListResponseDTO {
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}
```

### 2. **Enhanced DTO Mapper**

Added utility method to create domain list responses:

```typescript
static toDomainListResponseDTO(
  customers: Customer[],
  total: number,
  page: number,
  limit: number,
  totalPages: number,
  hasNextPage: boolean,
  hasPrevPage: boolean
): CustomerDomainListResponseDTO {
  return {
    customers,
    total,
    page,
    limit,
    totalPages,
    hasNextPage,
    hasPrevPage,
  };
}
```

### 3. **Updated Service Interface**

Replaced manual type definitions with proper DTOs:

```typescript
// Before
getCustomers(params?: {
  skip?: number;
  take?: number;
  name?: string;
  // ... more manual types
}): Promise<{
  customers: Customer[];
  total: number;
  // ... more manual types
}>;

// After
getCustomers(params?: CustomerFilterDTO): Promise<CustomerDomainListResponseDTO>;
```

### 4. **Updated Service Implementation**

Used proper DTOs and mapper methods:

```typescript
// Before
return {
  customers: overdueCustomers,
  total: overdueCustomers.length,
  // ... manual object creation
};

// After
return CustomerDTOMapper.toDomainListResponseDTO(
  overdueCustomers,
  overdueCustomers.length,
  result.page,
  result.limit,
  Math.ceil(overdueCustomers.length / result.limit),
  false,
  result.hasPrevPage
);
```

### 5. **Updated Repository Interface**

Replaced manual type definitions with DTOs:

```typescript
// Before
getCustomers(params?: {
  skip?: number;
  take?: number;
  // ... manual types
}): Promise<{
  customers: Customer[];
  // ... manual types
}>;

// After
getCustomers(params?: CustomerFilterDTO): Promise<CustomerDomainListResponseDTO>;
```

### 6. **Updated Repository Implementation**

Used DTO mapper for consistent response creation:

```typescript
// Before
return {
  customers: responseData.customers.map(
    (customer: any) => new Customer(customer)
  ),
  total: responseData.customers.length,
  // ... manual object creation
};

// After
return CustomerDTOMapper.toDomainListResponseDTO(
  responseData.customers.map(
    (customer: Record<string, unknown>) => new Customer(customer)
  ),
  responseData.customers.length,
  1,
  responseData.customers.length,
  1,
  false,
  false
);
```

### 7. **Updated Hook Interface**

Replaced manual type definitions with DTOs:

```typescript
// Before
getCustomers: (params?: CustomerFilterDTO) =>
  Promise<{
    customers: Customer[];
    total: number;
    // ... manual types
  }>;

// After
getCustomers: (params?: CustomerFilterDTO) =>
  Promise<CustomerDomainListResponseDTO>;
```

## Benefits Achieved

### 1. **Type Safety**

- Consistent use of DTOs across all layers
- Compile-time type checking for all customer operations
- Reduced risk of type mismatches

### 2. **Maintainability**

- Single source of truth for customer-related types
- Easy to update types in one place
- Clear separation between domain entities and DTOs

### 3. **Code Reusability**

- DTOs can be reused across different components
- Mapper methods provide consistent data transformation
- Reduced code duplication

### 4. **Domain Logic Preservation**

- `CustomerDomainListResponseDTO` allows access to domain methods like `hasOutstandingDebt()`, `getOverdueDebts()`, etc.
- `CustomerResponseDTO` is available for API responses that don't need domain methods

### 5. **Clean Architecture**

- Proper separation of concerns between layers
- Clear boundaries between domain, application, and infrastructure layers
- Consistent use of DTOs for data transfer

## Files Modified

1. **`src/core/application/dtos/CustomerDTO.ts`**

   - Added `CustomerDomainListResponseDTO`
   - Added `toDomainListResponseDTO` mapper method

2. **`src/core/domain/services/ICustomerService.ts`**

   - Updated to use proper DTOs instead of manual types

3. **`src/core/application/services/CustomerManagementService.ts`**

   - Updated to use proper DTOs and mapper methods

4. **`src/core/domain/repositories/ICustomerRepository.ts`**

   - Updated to use proper DTOs instead of manual types

5. **`src/core/infrastructure/repositories/ApiCustomerRepository.ts`**

   - Updated to use proper DTOs and mapper methods
   - Added proper TypeScript types for API responses

6. **`src/core/presentation/hooks/useCustomerManagement.tsx`**
   - Updated to use proper DTOs instead of manual types

## Best Practices Established

1. **Use DTOs for Data Transfer**: Always use DTOs for data transfer between layers
2. **Separate Domain and API DTOs**: Use domain DTOs for internal operations and API DTOs for external communication
3. **Use Mapper Methods**: Use mapper methods for consistent data transformation
4. **Avoid Manual Type Definitions**: Don't manually define types that already exist as DTOs
5. **Maintain Type Safety**: Ensure all layers use proper TypeScript types

## Future Improvements

1. **Add Validation DTOs**: Create validation-specific DTOs for input validation
2. **Add Response DTOs**: Create specific response DTOs for different API endpoints
3. **Add Error DTOs**: Create standardized error response DTOs
4. **Add Documentation**: Add JSDoc comments to all DTOs and mapper methods
5. **Add Tests**: Add unit tests for DTO mapper methods
