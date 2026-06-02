paths:
- "app/api/**/*.ts"
- "app/api/**/*.tsx"
- "pages/api/**/*.ts"
- "pages/api/**/*.js"
---

# API Development Rules

Ensure all API routes follow these rules to guarantee safety, correctness, and performance:

1. **Request Validation**:
   - Every API request input (body, query, params) must be validated using `zod`.
   - Never perform operations directly on raw request bodies.
   - Return `400 Bad Request` with structured error messages if validation fails.

2. **Authentication & Authorization**:
   - All protected endpoints must verify the user's session or token using Supabase Auth.
   - Check if a valid session exists before retrieving database records.
   - Return `401 Unauthorized` if authentication is missing or invalid.
   - Return `403 Forbidden` if the authenticated user lacks permissions to perform the requested operation.

3. **Rate Limiting & Safety**:
   - Keep track of request volumes. Implement rate-limiting logic on public/sensitive endpoints (e.g. auth, checkout).
   - Simulate and verify rate hitting limits as specified in the environment rules. Let the user know if limits are reached.

4. **Error Handling**:
   - Wrap handler bodies in `try-catch` blocks.
   - Log the error details internally, but never return raw backend error messages to the client (to prevent leakage). Return standard user-friendly messages.
   - Return proper HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`, `429 Too Many Requests`, `500 Internal Server Error`).

5. **JSON Responses**:
   - All response bodies must be structured JSON.
   - Ensure headers set the correct content type: `application/json`.
