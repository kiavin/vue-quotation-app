# CQIS - Progress Tracking

## Project Overview
* **Project Name:** CQIS (Catering Quotations & Invoicing System)
* **Purpose:** A modern SaaS platform for catering businesses to manage quotations, invoices, and client relationships.
* **Technology Stack:** Vue 3, Vite, TypeScript, Tailwind CSS, Pinia, Vue Router, Supabase, shadcn-vue.
* **Current Version:** 0.6.0 (Multi-Tenant SaaS Foundation & Admin Panel scaffolding)

---

## Current Status
- [x] Project Initialization
- [x] Tailwind CSS & Design System Configuration
- [x] Pinia & Vue Router Setup
- [x] Base Folder Structure
- [x] Reusable Layouts (App & Auth)
- [x] Design System & Base UI Components
- [x] Dashboard Stub
- [x] Quotation Builder Prototype
- [x] Supabase Integration (Typed Client, Env Validation)
- [x] Production-ready Authentication (Supabase Auth)
- [x] Database Schema Design & Migration SQL
- [x] Customer Module (Service, Store, and UI)
- [x] Item Catalog Module (Service, Store, and UI)
- [x] Category Management UI
- [x] Organization & Team Management UI
- [x] Quotation Management Module (Service, Store, and UI)
- [x] Quotation Persistence (Supabase)
- [x] Standardized UI Component Imports
- [x] Branding & PDF Templates
- [x] Invoice Generation & Management
- [x] Organization Multi-Tenancy & RLS Prep
- [x] Admin Route Tree & Protected Middleware
- [x] Admin Panel Layout & Sidebar
- [~] Admin Entity Oversight & Dashboards (UI built, pending integration)

---

## Architecture Decisions

### Decision: Organization Ownership Model
**Reason:** To support a SaaS business model, the application shifted from `User -> Data` to `Organization -> Users -> Data`. All business records (customers, items, quotations, invoices, settings) belong strictly to an `organization_id`. The user's membership in the organization grants access.

### Decision: Membership and Onboarding Flow
**Reason:** New users without an organization are forced through an onboarding flow (`/onboarding`) to create their initial business account. A new record in `organizations`, an `owner` role in `organization_members`, and an updated `profiles` record are created in a single transaction.

### Decision: Row Level Security (RLS) Strategy
**Reason:** Relying strictly on front-end filtering is insecure. We designed RLS policies (documented in `src/docs/rls-policies.md`) that use a PostgreSQL Security Definer function to evaluate `auth.uid()` against `organization_members`, ensuring database-level data isolation.

### Decision: Document Snapshotting
**Reason:** When a quotation or invoice is created, a snapshot of the organization's branding (logo, colors, address) is stored within the document record. This ensures that historical documents maintain their original appearance even if the company's branding changes later.

### Decision: Component-Based PDF Generation
**Reason:** Using Vue components for document templates ensures consistency with the web UI and allows for easy previews. PDF generation is handled via browser print functionality and optimized CSS, avoiding heavy external PDF libraries for now.

### Decision: Standardized UI Component Import Strategy
**Reason:** To eliminate build errors and improve code readability, we have adopted a mandatory Barrel Export strategy for all components in `src/components/ui`. This ensures all imports follow the same `{ Component }` pattern and resolve correctly in Vite.

### Decision: Invoice Conversion Flow
**Reason:** Invoices are derived from quotations to reduce data entry errors and maintain a clear audit trail. Converting a quotation to an invoice automatically copies all items and snapshots the branding, ensuring the invoice is legally and visually consistent with the quotation.

---

## Pending & Half-Baked Implementations (Technical Debt)

While the core functionality of the SaaS is solid, several new features, specifically around the internal Platform Administration System, are currently in a "half-baked" state and require backend wiring or component completion:

### 1. Platform Administration System (Mocked UI)
Most of the `/admin` route tree is heavily mocked and requires integration with real Supabase RPC calls or a dedicated `adminService`:
- **Dashboard (`Dashboard.vue`)**: KPI cards and chart areas (`<!-- Placeholder for Charts -->`) are currently static placeholders. Requires integration with `vue-chartjs` and a database rollup job.
- **Entity Management (`Organizations.vue`, `Users.vue`)**: Lists are currently populated using hardcoded arrays (`// Mock Data`). Needs to be wired to the Supabase Edge Functions or admin endpoints.
- **Organization Details (`OrganizationDetail.vue`)**: The tabs (Users, Billing, Logs, Settings) contain static UI placeholders (e.g., `Users Table Placeholder`, `Full Audit Table Placeholder`). Action buttons like "Suspend Organization" rely on `setTimeout` mock calls.
- **System Health (`Health.vue`)**: Hardware/latency metrics and pg_stat values are mocked. Needs an endpoint pulling actual `pg_stat_statements` or Supabase project metrics.
- **Feature Flags (`FeatureFlags.vue`) & Support Tools (`Support.vue`)**: Both pages rely entirely on frontend state arrays and mock API calls (e.g., `simulateSearch()`).

### 2. Missing Auth & Security Enforcements
- ~~**RBAC Verification**: `src/stores/auth.ts` has a pending `// TODO: implement real RBAC check against user_roles table`. Currently, the `isPlatformAdmin` check is not securely mapped to the database schema.~~ (Implemented via `is_super_admin()` RPC)
- ~~**Admin Impersonation**: The UI banner for impersonation in `AdminLayout.vue` is commented out (`<!-- Active Impersonation Warning (Mocked for now) -->`). The underlying auth store logic to swap tenant contexts safely without corrupting the session is missing.~~ (Implemented `isImpersonating` state, banner, and store swap logic)


### 3. Missing Planned Admin Views
- Dedicated full-page views for **Subscriptions**, **Platform Analytics**, **Traffic**, and **Audit Logs** were mentioned in the implementation plan but have not yet been built. Currently, only subsets exist inside `Health.vue` and `Dashboard.vue`.

### 4. General Application UI Debt
- **Form Primitives**: The app relies heavily on native HTML `<select>` elements and browser-native `confirm()` dialogues for destructive actions. These need to be refactored into accessible `Select` and `AlertDialog` components using Radix Vue / shadcn-vue.
- **Database Types Automation**: `src/lib/supabase.ts` mentions `// TODO: In the future, we can generate database types using the Supabase CLI`.

---

## Completed Features

### Platform Administration UI Scaffolding
**Completed:** 2026-06-23
**Summary:** Built the entire frontend structure for the SaaS internal control panel, including isolated routing, premium dark-themed layouts, and robust CRUD data tables for organizations, users, system health, and settings (currently awaiting backend wiring).

### Team Management & Onboarding
**Completed:** 2026-06-02
**Summary:** Built a setup wizard for new users to configure their organization. Created Team Management UI for owners to invite users and assign roles (admin, manager, staff).

### Invoice Engine
**Completed:** 2026-06-02
**Summary:** Full invoice management system. Supports conversion from quotations, status tracking (draft, sent, paid, etc.), and professional PDF generation.

### Branding & Customization
**Completed:** 2026-06-02
**Summary:** Full branding management including logo upload, color selection, and business profile. Includes a live preview of how documents will look.

### PDF & Document System
**Completed:** 2026-06-02
**Summary:** Professional A4 document templates with print and PDF export functionality. Quotations now capture branding snapshots for historical accuracy.

### Core Modules (Customers, Catalog, Quotations)
**Completed:** 2026-06-02
**Summary:** Full CRUD for customers and catalog items. Professional quotation builder with catalog integration, real-time totals, status management, and persistence.

---

## Folder Structure
- **`src/templates/documents`**: Stateless Vue components for document layouts (Quotations, Invoices).
- **`src/services/`**: API abstractions communicating with Supabase.
- **`src/components/forms`**: Domain-specific complex components like `CustomerForm`, `CatalogTable`, `TeamManagement`.
- **`src/components/ui`**: Generic, low-level UI primitives built with Radix Vue.
- **`src/pages/admin/`**: Isolated views for the internal SaaS control panel.

---

## Upcoming Tasks
1. Complete the Admin Panel backend wiring (replace all mocked data in `src/pages/admin/` with real Supabase queries).
2. Implement robust RBAC checking in the `authStore`.
3. Add accessible `Select` and `Dialog` components across the customer-facing application.
4. Multi-template support for document generation.
5. Payment gateway integration (Stripe).

---

## Change Log

### 2026-06-23 (Platform Administration System Implementation)
- **Phase 4 Completion**: Implemented Platform Health & Support Tools UI
  - Built `Health.vue` for monitoring of platform services and database metrics.
  - Built `FeatureFlags.vue` for toggling global or targeted features.
  - Built `Settings.vue` for managing platform defaults and toggling Maintenance Mode.
  - Built `Support.vue` for finding user sessions and executing high-privilege cache/index actions.
  - Wired these routes into the `AdminLayout` sidebar and Vue Router.
- **Phase 1 & 2 Completion**: Implemented Admin Routing, Layout, and Entity Management UI
  - Built isolated `/admin` route tree with platform admin middleware protection.
  - Built `AdminLayout.vue` with a premium, dark-themed SaaS aesthetic.
  - Built `Dashboard.vue` with KPI cards and chart placeholders.
  - Built `Organizations.vue` and `OrganizationDetail.vue` for complete tenant oversight.
  - Built `Users.vue` for platform-wide user management.
- **Code Quality**: Cleaned up unused imports and resolved TypeScript strict-mode errors across all newly created admin views.

### 2026-06-13
- **Quotation Builder Fix**: Resolved Vue 3 reactivity issues in the quotations store (`.push()`) so items properly display in the UI when added.
- **Quotation Persistence Fix**: Ensured the active user's `organization_id` is explicitly passed in the payload to fix "save as draft" and status update errors caused by Supabase RLS policies.
- **Invoice Conversion**: Created secure PostgreSQL RPC `convert_quotation_to_invoice` for atomic quotation-to-invoice cloning and data snapshotting without race conditions.
- **Mandatory Organization Routing**: Added a Vue Router `beforeEach` guard to block unassigned authenticated users and force redirection to the `/onboarding` setup flow.
- **RLS Hardening**: Validated RLS policies to enforce strict data isolation between different organizations and grant team visibility to organization leaders.
- **Google Sign-In**: Integrated `signInWithOAuth` for Google authentication on the frontend.

### 2026-06-02
- **Catalog Seeding**: Generated a comprehensive 100-item catering catalog seeder.
- **Phase 6.2 Completion**: Refactored the onboarding flow to use a secure PostgreSQL RPC function.
- **Supabase Schema & RLS Hardening**: Corrected schema architecture, hardened RLS policies, implemented secure storage policies, added performance indexes.
- **Phase 6.1 Completion**: Implemented production Supabase backend architecture (SQL migrations, organization ownership enforcement).
- **Phase 6 Completion**: Refactored architecture for multi-tenancy.
- **Phase 5 Completion**: Implemented full Invoice Engine, Quotation-to-Invoice conversion.
- **UI Stability Fix**: Removed phantom `CardDescription` component and stabilized the Card component system.
- **Phase 4 Completion**: Implemented Branding system, Document snapshotting, and PDF/Print engine.
- **Phase 1-3 Completion**: Fully implemented Customer Management, Item Catalog, and Quotation workflow.
