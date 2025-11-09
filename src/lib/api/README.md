# Backend API Integration

This directory contains the complete backend API integration layer for the HICv frontend application.

## Architecture

The API integration follows a clean, service-oriented architecture:

```
src/lib/api/
├── config.ts              # API configuration and constants
├── types.ts               # TypeScript type definitions
├── client.ts              # Axios HTTP client with interceptors
├── token-manager.ts       # JWT token management
├── services/              # Service layer for different domains
│   ├── auth.service.ts    # Authentication services
│   ├── subscription.service.ts  # Subscription management
│   ├── payment.service.ts # Payment processing (Paymob)
│   ├── user.service.ts    # User management
│   └── index.ts           # Service exports
└── index.ts               # Main export file
```

## Features

### 1. **HTTP Client** (`client.ts`)
- Axios-based HTTP client with automatic token management
- Request interceptor: Automatically attaches JWT tokens to requests
- Response interceptor: Handles token refresh on 401 errors
- Automatic retry with refreshed token
- Comprehensive error handling

### 2. **Token Management** (`token-manager.ts`)
- Secure token storage in localStorage
- Automatic token expiry detection
- Token refresh threshold (5 minutes before expiry)
- JWT token decoding for user info extraction
- Role-based access control helpers

### 3. **Service Layer**
Each service provides a clean API for interacting with backend endpoints:

#### Authentication Service
```typescript
import { authService } from '@/lib/api';

// Register
await authService.register({ email, password });

// Login
await authService.login({ email, password });

// Verify 2FA
await authService.verifyOtp(username, code);

// Logout
await authService.logout();

// Check authentication
const isAuth = authService.isAuthenticated();
```

#### Subscription Service
```typescript
import { subscriptionService } from '@/lib/api';

// Get all plans
const plans = await subscriptionService.getAllPlans();

// Get active subscription
const subscription = await subscriptionService.getMyActiveSubscription();

// Cancel subscription
await subscriptionService.cancelSubscription(subscriptionId);

// Check feature access
const canUseCV = await subscriptionService.canUseFeature('cv');
```

#### Payment Service
```typescript
import { paymentService } from '@/lib/api';

// Initiate payment
const payment = await paymentService.initiatePayment(planId, isAnnual, promoCode);

// Redirect to Paymob
window.location.href = payment.paymentUrl;

// Verify payment
const transaction = await paymentService.verifyPayment(transactionId);
```

#### User Service
```typescript
import { userService } from '@/lib/api';

// Get current user
const user = await userService.getCurrentUser();

// Get all users (admin only)
const users = await userService.getAllUsers();
```

## Usage

### Basic Setup

1. **Install dependencies**:
```bash
npm install axios
```

2. **Configure environment variables**:
```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:8077/apis
NEXT_PUBLIC_PAYMOB_IFRAME_ID=your_iframe_id
NEXT_PUBLIC_PAYMOB_HMAC_SECRET=your_hmac_secret
NEXT_PUBLIC_PAYMOB_ENABLED=true
```

3. **Import and use services**:
```typescript
import { authService, subscriptionService, paymentService } from '@/lib/api';
```

### Authentication Flow

```typescript
// 1. Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});

// 2. Tokens are automatically stored
// 3. All subsequent API calls include the token automatically

// 4. Token refresh happens automatically when needed
// 5. On 401 error, token is refreshed and request is retried

// 6. Logout
await authService.logout();
```

### Payment Flow

```typescript
// 1. User selects a plan
const planId = 1;

// 2. Initiate payment
const payment = await paymentService.initiatePayment(planId, false);

// 3. Redirect to Paymob
window.location.href = payment.paymentUrl;

// 4. User completes payment on Paymob

// 5. Paymob redirects back to success/failure page

// 6. Verify payment
const transaction = await paymentService.handlePaymentSuccess(transactionId);
```

## Error Handling

All services throw `ApiException` with the following structure:

```typescript
try {
  await authService.login({ email, password });
} catch (error) {
  if (error instanceof ApiException) {
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Status code:', error.statusCode);
    console.error('Details:', error.details);
  }
}
```

## Token Refresh

Token refresh is handled automatically:

1. Before each request, the client checks if the token is about to expire (within 5 minutes)
2. If yes, it refreshes the token before making the request
3. If a request fails with 401, the client attempts to refresh the token and retry
4. If refresh fails, the user is redirected to login

## Security

- Tokens are stored in localStorage (consider httpOnly cookies for production)
- All API requests use HTTPS in production
- HMAC signature validation for Paymob callbacks
- Automatic token expiry and refresh
- Role-based access control

## Type Safety

All API requests and responses are fully typed:

```typescript
import { SubscriptionPlan, UserSubscription, PaymentInitiationResponse } from '@/lib/api';

const plans: SubscriptionPlan[] = await subscriptionService.getAllPlans();
const subscription: UserSubscription | null = await subscriptionService.getMyActiveSubscription();
const payment: PaymentInitiationResponse = await paymentService.initiatePayment(1, false);
```

## Best Practices

1. **Always use services**: Don't call `apiClient` directly unless necessary
2. **Handle errors**: Always wrap service calls in try-catch blocks
3. **Check authentication**: Use `authService.isAuthenticated()` before protected operations
4. **Use TypeScript types**: Import and use the provided types for type safety
5. **Environment variables**: Never hardcode API URLs or secrets

## Testing

```typescript
// Mock services in tests
jest.mock('@/lib/api', () => ({
  authService: {
    login: jest.fn(),
    logout: jest.fn(),
  },
  subscriptionService: {
    getAllPlans: jest.fn(),
  },
}));
```

## Migration from Old Code

If you're migrating from the old Appwrite-only architecture:

1. Replace direct Appwrite calls with service calls
2. Update authentication to use backend JWT tokens
3. Replace license checks with subscription checks
4. Update payment flow to use Paymob integration

## Support

For issues or questions:
1. Check the backend API documentation
2. Review the service method signatures in the code
3. Check the TypeScript types for request/response structures
4. Consult the backend team for API changes

