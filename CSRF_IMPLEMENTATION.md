# CSRF Protection Implementation

This document describes the CSRF (Cross-Site Request Forgery) protection implementation in the WMS Frontend application.

## Overview

CSRF protection has been implemented to secure all state-changing operations (POST, PUT, DELETE, PATCH) while maintaining a seamless user experience. The implementation follows security best practices and integrates seamlessly with the existing authentication system.

## Security Model

### Protected Operations

- **All POST, PUT, DELETE, PATCH requests** require CSRF tokens
- **GET requests** are safe and don't require CSRF tokens
- **Login endpoint** (`POST /auth/login`) is excluded from CSRF protection

### Authentication Flow

1. **Login** → Get JWT token (no CSRF required)
2. **Get CSRF token** → Use JWT to fetch CSRF token
3. **Make protected requests** → Include both JWT and CSRF tokens

## Implementation Details

### 1. Cookie Storage

CSRF tokens are stored securely using the same cookie utility as authentication tokens:

```typescript
// Store CSRF token
tokenCookies.setCsrfToken(csrfToken);

// Get CSRF token
const csrfToken = tokenCookies.getCsrfToken();

// Remove CSRF token
tokenCookies.removeCsrfToken();
```

### 2. HttpClient Integration

The `HttpClient` class automatically handles CSRF protection:

```typescript
// Request interceptor automatically:
// - Skips CSRF for GET/HEAD/OPTIONS requests
// - Skips CSRF for login endpoint
// - Fetches CSRF token if not available
// - Adds CSRF token to headers for protected requests

// Response interceptor handles:
// - CSRF token expiration (403 errors)
// - Automatic token refresh
// - Error logging and cleanup
```

### 3. Authentication Repository

The `ApiAuthRepository` manages CSRF tokens during authentication:

```typescript
// After successful login:
await this.httpClient.refreshCsrfToken();

// During logout:
this.httpClient.clearCsrfToken();
```

## API Endpoints

### CSRF Token Endpoint

- **URL**: `GET /csrf/token`
- **Headers**: `Authorization: Bearer <jwt_token>`
- **Response**: `{ token: "csrf_token_string" }`
- **Security**: Requires valid JWT token

### Protected Endpoints

All endpoints except login and GET requests require:

- `Authorization: Bearer <jwt_token>`
- `X-CSRF-Token: <csrf_token>`

## Error Handling

### CSRF Token Errors

- **Status**: 403 Forbidden
- **Response**: `{ message: "CSRF token invalid or missing" }`
- **Action**: Automatically clear token and retry

### Authentication Errors

- **Status**: 401 Unauthorized
- **Action**: Clear all tokens and redirect to login

## Security Features

### 1. Automatic Token Management

- CSRF tokens are automatically fetched when needed
- Expired tokens are automatically refreshed
- Invalid tokens trigger automatic cleanup

### 2. Secure Storage

- CSRF tokens stored in secure cookies
- Same security settings as authentication tokens
- Automatic cleanup on logout

### 3. Request Validation

- All non-GET requests validated for CSRF tokens
- Login endpoint explicitly excluded
- Proper error handling and logging

### 4. Token Expiration

- CSRF tokens have server-defined expiration
- Automatic refresh on expiration
- Graceful degradation on token errors

## Usage Examples

### Making Protected Requests

```typescript
// The HttpClient automatically handles CSRF tokens
const httpClient = new HttpClient();

// POST request (automatically includes CSRF token)
await httpClient.post("/users", userData);

// PUT request (automatically includes CSRF token)
await httpClient.put("/users/123", updatedData);

// DELETE request (automatically includes CSRF token)
await httpClient.delete("/users/123");

// GET request (no CSRF token needed)
await httpClient.get("/users");
```

### Manual CSRF Token Management

```typescript
// Refresh CSRF token manually
const newToken = await httpClient.refreshCsrfToken();

// Clear CSRF token (useful for logout)
httpClient.clearCsrfToken();
```

## Testing

### Valid Scenarios

1. **Login without CSRF** → ✅ Success (excluded)
2. **GET request without CSRF** → ✅ Success
3. **POST request with valid CSRF** → ✅ Success
4. **Automatic CSRF refresh** → ✅ Success

### Invalid Scenarios

1. **POST request without CSRF** → ❌ 403 Forbidden
2. **POST request with invalid CSRF** → ❌ 403 Forbidden
3. **Request from different origin** → ❌ CORS blocked

## Migration Notes

### From Previous Version

- Existing authentication tokens are preserved
- CSRF tokens are automatically fetched after login
- No breaking changes to existing API calls
- Automatic cleanup of old tokens

### Browser Compatibility

- Requires cookies to be enabled
- Falls back to sessionStorage if cookies unavailable
- Works with all modern browsers

## Security Considerations

### 1. Token Storage

- CSRF tokens stored in secure cookies
- Same security settings as JWT tokens
- Automatic expiration and cleanup

### 2. Request Validation

- Server validates CSRF tokens on all protected endpoints
- Tokens must match server-side expectations
- Proper error responses for invalid tokens

### 3. Token Refresh

- Automatic refresh on expiration
- Manual refresh capability
- Graceful error handling

### 4. Logout Security

- Complete token cleanup on logout
- CSRF tokens invalidated
- Session termination

## Configuration

### Environment Variables

- `VITE_API_URL`: Base API URL for CSRF token endpoint
- CSRF endpoint: `${VITE_API_URL}/csrf/token`

### Cookie Settings

- `secure: true` (HTTPS only)
- `sameSite: "Strict"` (CSRF protection)
- `httpOnly: false` (client-side access needed)
- `maxAge: 24 hours` (configurable)

## Troubleshooting

### Common Issues

1. **CSRF Token Not Found**

   - Check if JWT token is valid
   - Verify CSRF endpoint is accessible
   - Check network connectivity

2. **403 Forbidden Errors**

   - CSRF token may be expired
   - Try refreshing the token
   - Check server-side CSRF configuration

3. **Token Refresh Failures**
   - JWT token may be expired
   - User may need to re-authenticate
   - Check server-side token validation

### Debug Information

- CSRF token requests are logged to console
- Error responses include detailed messages
- Network tab shows token requests and responses

## Best Practices

1. **Always use HttpClient** for API requests
2. **Don't manually manage CSRF tokens** unless necessary
3. **Handle 403 errors gracefully** in UI components
4. **Test CSRF protection** in different scenarios
5. **Monitor token refresh** for performance issues

## Future Enhancements

1. **Token Rotation**: Implement automatic CSRF token rotation
2. **Rate Limiting**: Add rate limiting for CSRF token requests
3. **Analytics**: Track CSRF token usage and errors
4. **Caching**: Implement intelligent token caching
5. **Monitoring**: Add comprehensive security monitoring
