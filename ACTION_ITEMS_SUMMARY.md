# Action Items Summary - Remaining Tasks

Quick reference guide for remaining action items after critical fixes.

**Last Updated:** 2025-01-24  
**Completion Status:** 16/20 items completed (80%)

---

## 📋 Testing & Documentation

### ⚠️ 18. Complete API Documentation - IN PROGRESS

**Target:** All endpoints documented  
**Status:** ⚠️ Partial - Documentation site exists but needs completion

**Remaining Work:**

1. **Admin Endpoints Documentation**

   - Create `frontend/app/docs/admin/` directory
   - Document admin login, user management, validation endpoints
   - Add authentication requirements
   - Include error response examples

2. **Complete Error Response Examples**

   - Add standardized error examples to all endpoint pages
   - Document all possible error codes (400, 401, 403, 404, 429, 500)
   - Include error response format documentation

3. **Add OpenAPI/Swagger**

   - Install `@nestjs/swagger`
   - Configure Swagger in `backend/src/main.ts`
   - Auto-generate API documentation
   - Link to interactive API explorer

4. **Webhook Documentation** (if applicable)
   - Document webhook endpoints
   - Include payload examples
   - Document security/verification

**Files to Create/Modify:**

- `frontend/app/docs/admin/*.tsx` - Admin documentation pages
- `backend/src/main.ts` - Add Swagger configuration
- `backend/package.json` - Add @nestjs/swagger dependency
- All existing doc pages - Add complete error examples

**Estimated Effort:** 2-3 days

---

## 🔒 Security Improvements

### ⚠️ 23. RBAC Implementation - PENDING

**Files:** User model, guards  
**Status:** ⚠️ Pending - Needs role field in User model and RBAC guards

**Detailed Implementation Plan:**

**Step 1: Database Schema**

```prisma
// backend/prisma/schema.prisma
enum UserRole {
  USER         // Regular contributors (default)
  MODERATOR    // Community moderators (can moderate content)
  ADMIN        // System administrators (full access)
  SUPER_ADMIN  // System owners (can manage admins)
}

model User {
  // ... existing fields
  role UserRole @default(USER)
}
```

**Step 2: Create RBAC Guard**

- Create `backend/src/auth/rbac.guard.ts`
- Create `backend/src/auth/rbac.decorator.ts` with `@Roles()` decorator
- Implement role checking logic

**Step 3: Apply to Controllers**

- Add `@Roles()` decorator to protected endpoints
- Example: `@Roles('MODERATOR', 'ADMIN', 'SUPER_ADMIN')` for moderation endpoints
- Example: `@Roles('USER', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN')` for basic features (all authenticated users)
- Example: `@Roles('ADMIN', 'SUPER_ADMIN')` for admin-only features

**Step 4: Migration**

- Create Prisma migration
- Set default role for existing users
- Update seed data

**Files to Create/Modify:**

- `backend/prisma/schema.prisma` - Add UserRole enum and role field
- `backend/src/auth/rbac.guard.ts` - Create RBAC guard
- `backend/src/auth/rbac.decorator.ts` - Create @Roles decorator
- All controllers - Add role-based access control
- `backend/prisma/migrations/` - Create migration

**Estimated Effort:** 1-2 days

---

### ⚠️ 24. API Key Rate Limiting - PENDING

**Files:** API key service, guards  
**Status:** ⚠️ Pending - No per-key rate limiting implemented

**Detailed Implementation Plan:**

**Step 1: Create Rate Limit Service**

- Create `backend/src/auth/api-key-rate-limit.service.ts`
- Implement per-key rate limit checking
- Use cache for rate limit counters
- Default: 60 requests per minute per key

**Step 2: Create Rate Limit Guard**

- Create `backend/src/auth/api-key-rate-limit.guard.ts`
- Extend ThrottlerGuard
- Check API key and apply appropriate limit
- Support different limits based on user role or API key metadata

**Step 3: Usage Tracking**

- Track API key usage in database
- Log abuse attempts to SecurityEvent table
- Alert on unusual usage patterns

**Step 4: Integration**

- Register guard in main.ts
- Apply to API endpoints
- Add rate limit headers to responses

**Files to Create/Modify:**

- `backend/src/auth/api-key-rate-limit.service.ts` - Create service
- `backend/src/auth/api-key-rate-limit.guard.ts` - Create guard
- `backend/src/main.ts` - Register guard
- `backend/src/auth/api-key.service.ts` - Add usage tracking

**Estimated Effort:** 1 day

---

## ⚡ Performance

### ⚠️ 25. Frontend Bundle Optimization - PENDING

**Files:** Admin dashboard  
**Status:** ⚠️ Pending - Optimize admin dashboard bundle size

**Detailed Implementation Plan:**

**Step 1: Tree-Shake Chart.js**

```typescript
// Instead of importing entire library
import Chart from "chart.js/auto";

// Import only needed components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  // ... only what's needed
} from "chart.js";
```

**Step 2: Lazy Load Charts**

```typescript
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-chartjs-2").then((mod) => mod.Bar), {
  ssr: false,
  loading: () => <ChartSkeleton />,
});
```

**Step 3: Code Splitting**

- Split admin dashboard into separate chunks
- Lazy load admin routes
- Use Next.js dynamic imports

**Step 4: Consider Alternative Libraries**

- Evaluate recharts (smaller bundle)
- Consider victory (modular)
- Or use native SVG charts for simple visualizations

**Files to Modify:**

- `frontend/app/admin/dashboard/page.tsx` - Optimize chart imports
- `frontend/next.config.js` - Ensure tree-shaking enabled
- Consider creating `frontend/components/charts/` with optimized chart components

**Estimated Effort:** 0.5-1 day

---

## 🐛 Critical Bugs & Missing Features

### ⚠️ 26. Audio Duration Calculation - PENDING

**Files:** `frontend/app/speak/page.tsx`, `frontend/app/question/page.tsx`  
**Status:** ⚠️ Pending - Duration hardcoded to 0 or not calculated

**Current Problem:**

- Duration is either hardcoded to 0 or not calculated from actual audio file
- Backend accepts duration but frontend doesn't provide accurate value

**Implementation:**

- Use Web Audio API to calculate actual duration from audio blob
- Add client-side validation (min 0.5s, max 60s)
- Optionally validate on backend using ffmpeg for additional verification

**Code Example:**

```typescript
// frontend/app/speak/page.tsx
async function calculateAudioDuration(audioBlob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext ||
      (window as any).webkitAudioContext)();
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        const duration = audioBuffer.duration;
        audioContext.close();
        resolve(duration);
      } catch (error) {
        reject(new Error("Failed to decode audio file"));
      }
    };

    reader.onerror = reject;
    reader.readAsArrayBuffer(audioBlob);
  });
}

// In handleSubmit, before sending:
const duration = await calculateAudioDuration(recordedAudio);
formData.append("duration", duration.toString());
```

**Files to Modify:**

- `frontend/app/speak/page.tsx` - Add duration calculation
- `frontend/app/question/page.tsx` - Add duration calculation
- `frontend/app/transcribe/page.tsx` - Add if needed

**Estimated Effort:** 0.5 day

---

### ⚠️ 28. Admin Dashboard Error Handling - PENDING

**Files:** `frontend/app/admin/dashboard/page.tsx`  
**Status:** ⚠️ Pending - No error handling for API failures

**Current Problem:**

- Dashboard API calls don't handle errors gracefully
- Failed API calls can crash the dashboard
- No user feedback on errors

**Implementation:**

- Add try-catch blocks around all API calls
- Show error messages to user using toast notifications
- Add retry logic with exponential backoff
- Create ErrorBoundary component for React error boundaries
- Add loading states and error states

**Code Example:**

```typescript
// frontend/app/admin/dashboard/page.tsx
const [stats, setStats] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/dashboard/stats", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized. Please login again.");
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to load dashboard statistics";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }
  fetchStats();
}, []);
```

**Files to Modify:**

- `frontend/app/admin/dashboard/page.tsx` - Add error handling
- `frontend/app/admin/sentences/page.tsx` - Add error handling
- `frontend/app/admin/questions/page.tsx` - Add error handling
- `frontend/components/ErrorBoundary.tsx` - Create error boundary component

**Estimated Effort:** 0.5 day

---

### ⚠️ 29. Standardize Error Response Format - PENDING

**Files:** All backend controllers  
**Status:** ⚠️ Partially addressed - Needs global exception filter

**Current Problem:**

- Error responses vary in format across endpoints
- Some return `{ error: string }`
- Some return `{ message: string }`
- Some return NestJS default format `{ statusCode: number, message: string[], error: string }`
- Frontend error handling is inconsistent

**Implementation:**

- Create global exception filter to standardize all error responses
- Register filter in main.ts
- Create custom exception classes for business logic errors
- Update frontend error handler to use standardized format

**Code Example:**

```typescript
// backend/src/common/filters/http-exception.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const request = host.switchToHttp().getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: "Internal server error" };

    const message =
      typeof exceptionResponse === "string"
        ? exceptionResponse
        : (exceptionResponse as any).message || "An error occurred";

    const errorResponse = {
      success: false,
      error: {
        statusCode: status,
        message: Array.isArray(message) ? message : [message],
        error: HttpStatus[status],
        timestamp: new Date().toISOString(),
        path: request.url,
        method: request.method,
      },
    };

    response.status(status).json(errorResponse);
  }
}
```

**Files to Create/Modify:**

- `backend/src/common/filters/http-exception.filter.ts` - Create filter
- `backend/src/common/exceptions/business.exception.ts` - Create custom exceptions
- `backend/src/main.ts` - Register filter
- `frontend/lib/api-error-handler.ts` - Create standardized error handler
- All frontend API calls - Use standardized error handler

**Estimated Effort:** 1 day

---

### ⚠️ 30. OAuth Error Handling - PENDING

**Files:** `backend/src/auth/auth.service.ts`  
**Status:** ⚠️ Pending - Missing edge case handling

**Current Problem:**

- OAuth login methods don't handle edge cases:
  - Email conflicts between OAuth providers
  - Missing email from OAuth provider (GitHub allows this)
  - Race conditions during user creation
  - Invalid/expired OAuth tokens

**Implementation:**

- Handle email conflicts by linking OAuth accounts to existing users
- Handle missing email with clear error message
- Use database transactions to prevent race conditions
- Add proper error handling and logging
- Improve error messages for better UX

**Code Example:**

```typescript
// backend/src/auth/auth.service.ts
async googleLogin(googleToken: string) {
  try {
    // 1. Verify token with Google
    const googleUser = await this.verifyGoogleToken(googleToken);

    // 2. Handle missing email
    if (!googleUser.email) {
      throw new BadRequestException('Email is required. Please ensure your Google account has a verified email.');
    }

    // 3. Check for existing user with email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { oauthAccounts: true }
    });

    // 4. Handle email conflict with different provider
    if (existingUser && !existingUser.oauthAccounts.some(acc => acc.provider === 'GOOGLE')) {
      // Link Google account to existing user
      await this.linkOAuthAccount(existingUser.id, 'GOOGLE', googleUser.id);
    }

    // 5. Use transaction to prevent race conditions
    return await this.prisma.$transaction(async (tx) => {
      // User creation/lookup logic
    });
  } catch (error) {
    // Proper error handling
    this.logger.error('OAuth login failed', error);
    throw error;
  }
}
```

**Files to Modify:**

- `backend/src/auth/auth.service.ts` - Add error handling
- `backend/src/auth/auth.controller.ts` - Add error response mapping
- `frontend/app/api/auth/google/route.ts` - Handle OAuth errors gracefully
- `frontend/app/api/auth/github/route.ts` - Handle OAuth errors gracefully

**Estimated Effort:** 1 day

---

### ⚠️ 31. Review Validation Count Logic - NEEDS IMPLEMENTATION

**Files:** `backend/src/transcription/transcription.service.ts`  
**Status:** ⚠️ Needs Implementation - Currently incomplete

**Current Problem:**
According to requirements:

- After a user reviews a transcript, it should be available for other users to 'Listen' (1.2) and validate
- The review itself counts as a 'Listen' (1.2) validation

**Current Implementation:**

- `submitReview` method only updates the transcription review
- Does NOT create a Validation record
- Does NOT check if recording reaches 25 validations threshold
- Does NOT mark recording as validated when threshold reached

**Required Implementation:**

```typescript
// backend/src/transcription/transcription.service.ts
async submitReview(
  transcriptionReviewId: string,
  isApproved: boolean,
  userId?: string,
) {
  const review = await this.prisma.transcriptionReview.findUnique({
    where: { id: transcriptionReviewId },
    include: { speechRecording: true },
  });

  if (!review) {
    throw new NotFoundException('Transcription review not found');
  }

  // Update review
  await this.prisma.transcriptionReview.update({
    where: { id: transcriptionReviewId },
    data: {
      isApproved,
      reviewedBy: userId,
      reviewedAt: new Date(),
    },
  });

  // If approved, count as Listen validation
  if (isApproved && userId) {
    // Check if user already validated this recording
    const existingValidation = await this.prisma.validation.findUnique({
      where: {
        speechRecordingId_userId: {
          speechRecordingId: review.speechRecordingId,
          userId,
        },
      },
    });

    if (!existingValidation) {
      // Create validation record (count as Listen validation)
      await this.prisma.validation.create({
        data: {
          speechRecordingId: review.speechRecordingId,
          userId,
          isValid: true, // Approved transcription = valid audio
        },
      });

      // Check if recording now has 25 validations
      const validationCount = await this.prisma.validation.count({
        where: { speechRecordingId: review.speechRecordingId },
      });

      if (validationCount >= 25) {
        // Mark recording as validated
        await this.prisma.speechRecording.update({
          where: { id: review.speechRecordingId },
          data: { isValidated: true },
        });
      }
    }
  }

  // Mark as completed
  if (userId) {
    await this.progress.markCompleted(
      userId,
      'transcription',
      transcriptionReviewId,
      'review',
    );
  }

  return { success: true, isApproved };
}
```

**Files to Modify:**

- `backend/src/transcription/transcription.service.ts` - Update submitReview method
- Add integration test to verify validation count logic

**Estimated Effort:** 1 day

---

### ⚠️ 32. Search/Filter Functionality - PENDING

**Files:** Admin pages  
**Status:** ⚠️ Pending - No search/filter for admin features

**Current Problem:**

- Cannot search sentences by text
- Cannot filter by date range
- Cannot filter by language and status together
- No bulk operations
- Inefficient moderation workflow

**Implementation:**

- Create SearchBar component for text search
- Create FilterPanel component for advanced filtering
- Add backend filter support in admin service
- Add query parameters to admin controller
- Integrate into admin pages

**Files to Create/Modify:**

- `frontend/components/admin/SearchBar.tsx` - Create search component
- `frontend/components/admin/FilterPanel.tsx` - Create filter component
- `frontend/app/admin/sentences/page.tsx` - Integrate search/filter
- `frontend/app/admin/questions/page.tsx` - Integrate search/filter
- `backend/src/admin/admin.service.ts` - Add filter support
- `backend/src/admin/admin.controller.ts` - Add query parameters

**Estimated Effort:** 2 days

---

## 📊 Summary

**Completed Items:** 16

- ✅ Unit Tests (6 services)
- ✅ Integration Tests (6 endpoint groups)
- ✅ JSDoc Comments (100% coverage)
- ✅ Database Indexes (optimized)
- ✅ Input Validation (DTOs)
- ✅ Input Sanitization (DOMPurify)
- ✅ File Validation (magic bytes)
- ✅ Frontend File Size Validation
- ✅ Automated Admin Validation
- ✅ Error Logging (LoggerService)
- ✅ Toast Notifications
- ✅ Database Transactions
- ✅ N+1 Query Fix
- ✅ API Key Performance (hash prefix)
- ✅ Pagination
- ✅ Audio Upload Optimization (FormData)

**Remaining Items:** 8 total

**Critical Priority (3.5 days):**

1. Audio Duration Calculation (0.5 day)
2. Admin Dashboard Error Handling (0.5 day)
3. Standardize Error Response Format (1 day)
4. API Key Rate Limiting (1 day)
5. Review Validation Count Logic (1 day)

**High Priority (3-4 days):** 6. RBAC Implementation (1-2 days) 7. OAuth Error Handling (1 day)

**Medium Priority (4.5-6 days):** 8. Complete API Documentation (2-3 days) 9. Search/Filter Functionality (2 days) 10. Frontend Bundle Optimization (0.5-1 day)

**Total Estimated Effort:** 14-18.5 days

---

**Next Steps:**

1. Start with critical priority items (can be done in parallel)
2. Then move to high priority items
3. Complete medium priority items

