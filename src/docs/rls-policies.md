# Row Level Security (RLS) Policies

This document outlines the Row Level Security (RLS) strategy for CQIS to enforce multi-tenant data isolation. Each business record belongs to an `organization_id`, and users access data through their membership in `organization_members`.

## Global Principles
1. **Never trust the client:** All data access must be validated at the database level.
2. **Organization Isolation:** Users can only access data belonging to organizations they are members of.
3. **Role-Based Access Control (RBAC):** `owner`, `admin`, `manager`, and `staff` roles have different permissions. (Basic implementation assumes any member can read/write for now, with advanced RBAC left for future phases).

## Security Definer Function
To simplify RLS policies, a PostgreSQL function should be created to get the user's organization(s):

```sql
create or replace function auth.user_organizations()
returns setof uuid as $$
  select organization_id from public.organization_members where user_id = auth.uid();
$$ language sql security definer;
```

---

## Policies by Table

### 1. `organizations`
- **SELECT:** `id in (select auth.user_organizations())`
- **INSERT:** Allowed for authenticated users during onboarding (no RLS check on insert, but trigger inserts to `organization_members` automatically).
- **UPDATE:** `id in (select auth.user_organizations()) and exists (select 1 from organization_members where user_id = auth.uid() and role in ('owner', 'admin'))`
- **DELETE:** Only 'owner' role.

### 2. `organization_members`
- **SELECT:** `organization_id in (select auth.user_organizations())`
- **INSERT:** `organization_id in (select auth.user_organizations()) and exists (select 1 from organization_members where user_id = auth.uid() and role in ('owner', 'admin'))`
- **UPDATE:** Only 'owner' or 'admin' can update others.
- **DELETE:** Only 'owner' or 'admin'.

### 3. `profiles`
- **SELECT:** Users can see their own profile, or profiles of users in the same organization.
- **UPDATE:** Users can only update their own profile `id = auth.uid()`.

### 4. `customers`
- **SELECT:** `organization_id in (select auth.user_organizations())`
- **INSERT:** `organization_id in (select auth.user_organizations())`
- **UPDATE:** `organization_id in (select auth.user_organizations())`
- **DELETE:** `organization_id in (select auth.user_organizations())`

### 5. `categories` & `items` (Catalog)
- **SELECT:** `organization_id in (select auth.user_organizations())`
- **INSERT:** `organization_id in (select auth.user_organizations())`
- **UPDATE:** `organization_id in (select auth.user_organizations())`
- **DELETE:** `organization_id in (select auth.user_organizations())`

### 6. `quotations` & `quotation_items`
- **SELECT:** `organization_id in (select auth.user_organizations())`
- **INSERT:** `organization_id in (select auth.user_organizations())`
- **UPDATE:** `organization_id in (select auth.user_organizations())`
- **DELETE:** `organization_id in (select auth.user_organizations())`

### 7. `invoices` & `invoice_items`
- **SELECT:** `organization_id in (select auth.user_organizations())`
- **INSERT:** `organization_id in (select auth.user_organizations())`
- **UPDATE:** `organization_id in (select auth.user_organizations())`
- **DELETE:** `organization_id in (select auth.user_organizations())`

---

## Future Enhancements
- Fine-grained RBAC: Differentiate permissions based on the `role` field in `organization_members` (e.g., staff cannot delete invoices, only admins can).
