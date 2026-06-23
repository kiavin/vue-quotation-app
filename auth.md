# Authentication & Session Handling Audit Report

## 1. Architecture Overview
CQIS utilizes **Supabase** for its backend authentication provider, alongside **Pinia** for client-side state management, and **Vue Router** for navigation guards. The architecture follows a non-blocking initial mount pattern, allowing the Vue application to render instantly while session verification happens in the background.

## 2. Core Components

### A. Auth Service (`src/services/authService.ts`)
Acts as the central wrapper around the Supabase Auth API:
- **`signIn(credentials)`**: Standard Email/Password sign in. Returns standardized `ApiResponse` objects and uses a toast notification system.
- **`signOut()`**: Clears the Supabase session and returns a success response.
- **`getSession()`**: A robust method implementing a dual-check system:
  1. Retrieves the local session (`supabase.auth.getSession()`).
  2. Actively verifies the session with the Supabase server (`supabase.auth.getUser()`).
  3. Includes a 10-second `Promise.race` timeout to prevent infinite hanging if the server is unresponsive.
  4. Force-signs out the user if the server verification fails.
- **`onAuthStateChange`**: Provides a direct listener to Supabase session changes.

### B. State Management (`src/stores/auth.ts`)
The Pinia store (`useAuthStore`) serves as the single source of truth for the user's identity:
- **State**: Tracks `user`, `session`, `profile`, `organization`, and `loading`.
- **`setSession`**: Automatically triggers `fetchProfileAndOrganization()` when a valid session is set.
- **Profile Fallback**: Contains logic to gracefully handle missing profiles (e.g., first-time OAuth logins before database triggers finish) by automatically creating a default profile using available metadata.
- **Organization Handling**: Fetches the associated organization if the user's profile contains an `organization_id`.

### C. Initialization Flow (`src/main.ts`)
- The Vue app (`app.mount('#app')`) mounts **immediately**.
- `authService.getSession()` is called asynchronously without blocking the UI.
- Once completed (or failed), `authStore.setLoading(false)` is called.
- A global `watch` monitors `authStore.loading` and automatically redirects authenticated users away from `guestOnly` routes (like `/` or `/auth/login`) to the `/dashboard`.

### D. Navigation Guards (`src/router/index.ts`)
Route transitions are strictly protected using Vue Router's `beforeEach` hook:
- **Async Wait**: If `authStore.loading` is `true` and the route requires authentication, the router blocks the transition using a Vue `watch` promise until `loading` becomes `false`.
- **Guest vs Auth Routes**:
  - `meta.guestOnly`: Redirects authenticated users to `dashboard`.
  - `meta.requiresAuth`: Redirects unauthenticated users to `login`.
- **Onboarding Flow**:
  - Authenticated users **without** an organization are forcibly redirected to the `/onboarding` route.
  - Authenticated users **with** an organization are restricted from accessing the `/onboarding` route.

### E. User Interface
- **Login (`src/pages/auth/Login.vue`)**: Supports standard Email/Password authentication and Google OAuth (`signInWithOAuth`).
- **AuthLayout**: A clean, centralized layout wrapping the authentication pages.
- **AppLayout**: Handles the main application frame, pulling the user's initial (`authStore.user?.email?.charAt(0)`) for the avatar and providing the logout capability (`handleLogout`).

## 3. Strengths & Security Practices
1. **Server Verification**: `getSession` does not blindly trust the local storage token; it explicitly verifies the token against the Supabase server via `getUser()`.
2. **Timeout Protection**: The 10-second timeout on session fetching ensures the UI never gets permanently stuck on a loading screen.
3. **Non-blocking UI**: The application avoids the "white screen of death" by mounting the Vue app immediately and resolving routes asynchronously.
4. **Seamless OAuth Fallbacks**: The auth store has built-in resilience for missing profiles, dynamically creating them if the database trigger is delayed or fails during Google OAuth.

## 4. Recommendations & Edge Cases
- **Session Expiry Handling**: Currently, if a user's token expires *while* they are actively using the application, the `supabase.auth.onAuthStateChange` listener should theoretically catch the `SIGNED_OUT` or `TOKEN_REFRESHED` event. However, explicit API interceptors (e.g., catching 401s on data requests and triggering a logout) could provide an additional safety net.
- **Role-Based Access Control (RBAC)**: The current system determines organization attachment (`hasOrganization`) but does not yet implement strict role boundaries (e.g., Admin vs Member) within the frontend routing. As the application grows, `meta.roles` could be added to the router config.
- **Logout State**: The `handleLogout` function in `AppLayout.vue` clears the session via the service and pushes to `landing`. The `onAuthStateChange` listener in `main.ts` will subsequently update the Pinia store to null. This is correct, but ensuring all sensitive stores (e.g., cached customers/invoices) are also reset on logout would prevent data leakage between accounts on shared devices.
