# CQIS - Progress Tracking

## Project Overview
* **Project Name:** CQIS (Catering Quotations & Invoicing System)
* **Purpose:** A modern SaaS platform for catering businesses to manage quotations, invoices, and client relationships.
* **Technology Stack:** Vue 3, Vite, TypeScript, Tailwind CSS, Pinia, Vue Router, Supabase, shadcn-vue.
* **Current Version:** 0.6.0 (Multi-Tenant SaaS Foundation)

---

## Current Status
- [x] Project Initialization
- [x] Tailwind CSS & Design System Configuration
- [x] Pinia & Vue Router Setup
- [x] Base Folder Structure
- [x] Reusable Layouts (App & Auth)
- [x] Design System & Base UI Components
- [x] Dashboard Stub (Mock Data)
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

## Folder Structure

### src/templates/documents
**Purpose:** Stateless Vue components for document layouts (Quotations, Invoices).

### src/services/dashboardService.ts
**Purpose:** Backend-ready data aggregation endpoints for dashboard statistics.

### src/components/forms
**Purpose:** Domain-specific complex components like `CustomerForm`, `CatalogTable`, `QuotationStatusBadge`, `TeamManagement`.

### src/components/ui
**Purpose:** Generic, low-level UI primitives (Button, Input, Table, etc.).

---

## Completed Features

### Team Management & Onboarding
**Completed:** 2026-06-02
**Files:**
- `src/services/teamService.ts`
- `src/components/forms/TeamManagement.vue`
- `src/pages/auth/Onboarding.vue`
**Summary:** Built a setup wizard for new users to configure their organization. Created Team Management UI for owners to invite users and assign roles (admin, manager, staff).

### Invoice Engine
**Completed:** 2026-06-02
**Files:**
- `src/services/invoiceService.ts`
- `src/stores/invoices.ts`
- `src/pages/invoices/*`
- `src/components/shared/InvoiceStatusBadge.vue`
- `src/templates/documents/InvoiceTemplateBasic.vue`
**Summary:** Full invoice management system. Supports conversion from quotations, status tracking (draft, sent, paid, etc.), and professional PDF generation.

### Branding & Customization
**Completed:** 2026-06-02
**Files:**
- `src/services/organizationService.ts`
- `src/stores/settings.ts`
- `src/pages/Branding.vue`, `src/pages/Settings.vue`
**Summary:** Full branding management including logo upload, color selection, and business profile. Includes a live preview of how documents will look.

### PDF & Document System
**Completed:** 2026-06-02
**Files:**
- `src/templates/documents/QuotationTemplateBasic.vue`
- `src/services/pdfService.ts`
- `src/pages/quotations/QuotationPrint.vue`
**Summary:** Professional A4 document templates with print and PDF export functionality. Quotations now capture branding snapshots for historical accuracy.

### Customer Management
**Completed:** 2026-06-02
**Summary:** Full CRUD for customers with search and detail views.

### Item Catalog
**Completed:** 2026-06-02
**Summary:** Full CRUD for catalog items with category filtering.

### Quotation Management
**Completed:** 2026-06-02
**Summary:** Professional quotation builder with catalog integration, real-time totals, status management, and persistence.

---

## Components Inventory

### Table
**Location:** `src/components/ui/table/`
**Components:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`, `TableHead`.

### Badge
**Location:** `src/components/ui/badge/Badge.vue`
**Variants:** `default`, `secondary`, `destructive`, `outline`, `success`, `warning`.

---

## Stores Inventory

### settingsStore
**Purpose:** Manages organization profile and branding settings.
**State:** `organization`, `loading`, `error`.
**Actions:** `fetchOrganization`, `updateOrganization`, `uploadLogo`.

### quotationsStore
**Purpose:** Manages the quotation lifecycle and builder state.
**State:** `quotations`, `currentQuotation`, `currentItems`, `transportCharge`, `taxRate`.
**Getters:** `subtotal`, `taxAmount`, `grandTotal`.
**Actions:** `fetchQuotations`, `loadQuotation`, `addItem`, `removeItem`, `saveQuotation` (with branding snapshot), `resetBuilder`.

### invoicesStore
**Purpose:** Manages the invoice lifecycle and conversion.
**State:** `invoices`, `currentInvoice`, `loading`, `error`.
**Actions:** `fetchInvoices`, `loadInvoice`, `createFromQuotation`, `updateStatus`, `deleteInvoice`.

---

## Technical Debt

### Issue: UI Components (Select, Dialog)
**Currently:** Using native HTML selects and `confirm()` for deletions.
**Future Work:** Implement accessible `Select` and `Dialog` components using Radix Vue.

---

## Upcoming Tasks
1. Complete Dashboard UI with charts.
2. Multi-template support for documents.
3. Payment integration (Stripe).

---

## Change Log

### 2026-06-02
- **Catalog Seeding**: Generated a comprehensive 100-item catering catalog seeder in `supabase/seed.sql`, categorized by appetizers, mains, beverages, and equipment.
- **Phase 6.2 Completion**: 
 Refactored the onboarding flow to use a secure PostgreSQL RPC function (`create_organization_onboarding`). Successfully pushed consolidated, idempotent production schema to Supabase.
- **Supabase Schema & RLS Hardening**: 
  - Corrected schema architecture by moving custom helper functions to the `public` schema.
  - Hardened RLS policies for strict multi-tenant isolation across all CRUD operations.
  - Implemented secure storage policies using mandatory `organization_id` path prefixes.
  - Added performance indexes for high-traffic foreign keys.
  - Enforced automatic soft-delete filtering in database-level SELECT policies.
  - Cleaned up function security with `SECURITY DEFINER` and safe `search_path`.
  - Created `src/docs/supabase-fix-report.md` with detailed refactor details.
- **Phase 6.1 Completion**: Implemented production Supabase backend architecture. 
  - **Supabase Infrastructure**: Created complete SQL migrations (`20260602000000_production_init.sql` & `20260602000001_storage_setup.sql`).
  - **Organization Ownership Enforcement**: Enforced `organization_id` on all business tables with foreign keys and cascade deletes.
  - **RLS Status**: Row Level Security fully enabled on all tables using a `auth.user_organizations()` helper function for multi-tenant isolation.
  - **Storage Status**: Created `logos` (public) and `documents` (private) buckets with RLS policies restricting access to organization members.
  - Generated rigorous TypeScript database definitions in `src/types/database.ts`.
- **Phase 6 Completion**: Refactored architecture for multi-tenancy. Added `organization_members`, updated all services/stores to use `organizationId`, created Onboarding flow, Team Management UI, and RLS documentation.
- **Phase 5 Completion**: Implemented full Invoice Engine, Quotation-to-Invoice conversion, and Invoice PDF system.
- **UI Stability Fix**: Removed phantom `CardDescription` component and stabilized the Card component system.
- **Phase 4 Completion**: Implemented Branding system, Document snapshotting, and PDF/Print engine.
- **Phase 1-3 Completion**: Fully implemented Customer Management, Item Catalog, and Quotation workflow.
- Fixed build errors related to inconsistent imports and missing `index.ts` files.
- Resolved TypeScript errors in `Badge.vue`, `Input.vue`, and `authService.ts`.
- Cleaned up unused imports and variables across the project to comply with `noUnusedLocals`.
- Verified successful production build with `npm run build`.
- Updated `GEMINI.md` with new import conventions and checklist.

### 2026-06-13
- **Quotation Builder Fix**: Resolved Vue 3 reactivity issues in the quotations store (`.push()`) so items properly display in the UI when added.
- **Quotation Persistence Fix**: Ensured the active user's `organization_id` is explicitly passed in the payload to fix "save as draft" and status update errors caused by Supabase RLS policies.
- **Invoice Conversion**: Created secure PostgreSQL RPC `convert_quotation_to_invoice` for atomic quotation-to-invoice cloning and data snapshotting without race conditions.
- **Mandatory Organization Routing**: Added a Vue Router `beforeEach` guard to block unassigned authenticated users and force redirection to the `/onboarding` setup flow.
- **RLS Hardening**: Validated RLS policies to enforce strict data isolation between different organizations and grant team visibility to organization leaders.
- **Google Sign-In**: Integrated `signInWithOAuth` for Google authentication on the frontend.
