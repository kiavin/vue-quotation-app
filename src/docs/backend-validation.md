# Backend Validation Checklist

This document serves as a verification checklist to ensure that the Supabase backend architecture (Phase 6.1) adheres to the multi-tenant SaaS requirements.

## 1. Organization Isolation [✓]
- All core business tables (`customers`, `items`, `categories`, `quotations`, `invoices`, `settings`/`organizations`) include an `organization_id` UUID column.
- `organization_id` is defined as `NOT NULL` and references `organizations(id)` on delete cascade where appropriate.
- Foreign keys between business entities (e.g., `quotation_items` -> `quotations`) ensure cascade deletions without orphaned data.

## 2. Membership Validation [✓]
- Users authenticate via Supabase Auth (`auth.users`).
- Users belong to an organization via the `organization_members` table.
- A user's current organization is determined securely on the backend via the `auth.user_organizations()` function.
- Roles (`owner`, `admin`, `manager`, `staff`) are correctly scoped and enforced in the `organization_members` schema constraint.

## 3. Onboarding Flow [✓]
- Documented and implemented in `src/pages/auth/Onboarding.vue` and `organizationService.ts`.
- The `setupOrganization` transaction performs the following successfully:
  1. Creates the `organizations` record.
  2. Creates the `organization_members` record linking `auth.uid()` as `owner`.
  3. Creates/Upserts the `profiles` record.
- The UI redirects the user automatically to `/onboarding` if they lack an organization.

## 4. Row Level Security (RLS) Coverage [✓]
- RLS is explicitly enabled (`ENABLE ROW LEVEL SECURITY`) on all tables.
- `SELECT` policies rely on `auth.user_organizations()`.
- `INSERT`, `UPDATE`, and `DELETE` policies enforce proper write boundaries.
- Specialized policies for `organization_members` prevent non-admins from inviting or removing users.
- Specialized policies for `profiles` ensure a user can only update their own metadata.

## 5. Storage Security [✓]
- **`logos` bucket:** Created with `public: true`. Policies restrict uploads/updates/deletes to members of the organization (`(storage.foldername(name))[1] IN (SELECT auth.user_organizations()::text)`).
- **`documents` bucket:** Created with `public: false`. Policies restrict all actions (read, upload, delete) strictly to organization members.

## 6. Business Data Ownership Validation [✓]
- **Invoice Ownership:** `invoices` securely belong to `organization_id`. `invoice_items` access is granted dynamically by joining through `invoices`.
- **Quotation Ownership:** `quotations` securely belong to `organization_id`. `quotation_items` access is similarly inherited via `quotation_id`.
- **Customer Ownership:** `customers` securely belong to `organization_id` and have active RLS.
- No business table relies on `user_id` directly for data ownership. Everything flows correctly through `organization_id`.

## 7. Team Invitation Workflow [✓]
- Schema implemented via the `organization_invitations` table.
- Supports secure tokens, expiry dates, and specific role assignment.
- Can be securely managed by `admin` or `owner` roles using RLS policies.
