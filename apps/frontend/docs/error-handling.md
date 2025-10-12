# Error Handling

Utilities for consistent error handling and user-friendly error display using vue-sonner toast notifications.

## Utilities

### `parseError(error: unknown): string`

Converts any error type to a user-friendly string message.

**Supported error types:**
- `string` → returns the string directly
- `Error` → returns `error.message`, i.e. the message attached to the error json from the backend
- `unknown` (i.e. some json passed in directly with no type) → returns "An error occurred"

**Example:**
```typescript
import { parseError } from '@/utils';

const errorMessage = parseError("Something went wrong");
// Returns: "Something went wrong"

const errorMessage2 = parseError(new Error("Network error"));
// Returns: "Network error"

const errorMessage3 = parseError({ custom: "object" });
// Returns: "An error occurred"
```

### `handleError(title: string, error: unknown): void`

Displays an error toast notification with the given title and parsed error description.

**Parameters:**
- `title`: The main error message shown in the toast
- `error`: Any error type that will be parsed using `parseError`

**Example:**
```typescript
import { handleError } from '@/utils';

try {
  // Some operation that might fail
  await riskyOperation();
} catch (error) {
  // Some error message that should be specific to the request. See the usage section for an example
  handleError('Operation Failed', error);
}
```

## Usage with API Client

Combine error handling with your API client for clean error management:

```typescript
import { apiClient } from '@/api/apiClient';
import { handleError } from '@/utils';

try {
  const users = await apiClient.get('/tables');
} catch (error) {
  handleError('Failed to fetch tables', error);
}
```
