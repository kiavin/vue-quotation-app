# Database Schema Design

## Overview
The CQIS database is designed for multi-tenancy from day one. Every business record belongs to an `organization`.

## Tables

### organizations
Stores business entity information.
- `id`: uuid (PK)
- `name`: text
- `slug`: text (unique)
- `email`: text
- `phone`: text
- `logo_url`: text
- `primary_color`: text
- `secondary_color`: text
- `accent_color`: text
- `address`: text
- `default_tax_rate`: numeric
- `currency`: text
- `created_at`: timestamp
- `updated_at`: timestamp

### organization_members
Links Supabase Auth users to organizations.
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `user_id`: uuid (FK, references auth.users)
- `role`: text (owner, admin, manager, staff)
- `invited_by`: uuid (FK, references auth.users, nullable)
- `created_at`: timestamp

### profiles
User profile information, linked to Supabase Auth.
- `id`: uuid (PK, references auth.users)
- `organization_id`: uuid (FK, references organizations, nullable if onboarding)
- `full_name`: text
- `email`: text
- `avatar_url`: text
- `role`: text (owner, admin, manager, staff)
- `created_at`: timestamp

### customers
Client information for quotations and invoices.
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `name`: text
- `email`: text
- `phone`: text
- `address`: text
- `tax_number`: text
- `is_active`: boolean (default true)
- `created_at`: timestamp
- `deleted_at`: timestamp (soft delete)

### categories
Item classification (e.g., Buffet, Beverages, Equipment).
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `name`: text
- `description`: text

### items
Catalog of food, drinks, and services.
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `category_id`: uuid (FK, references categories)
- `name`: text
- `description`: text
- `unit`: text (e.g., per person, per plate, per day)
- `price`: numeric
- `is_active`: boolean (default true)
- `created_at`: timestamp

### quotations
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `customer_id`: uuid (FK, references customers)
- `number`: text (unique within org, e.g., QUO-001)
- `status`: text (draft, sent, approved, rejected, expired)
- `date`: date
- `expiry_date`: date
- `subtotal`: numeric
- `transport_charge`: numeric
- `tax_rate`: numeric
- `tax_amount`: numeric
- `total`: numeric
- `notes`: text
- `branding_snapshot`: jsonb (to preserve logo/colors at time of creation)
- `created_at`: timestamp
- `updated_at`: timestamp

### quotation_items
Line items for a quotation.
- `id`: uuid (PK)
- `quotation_id`: uuid (FK, references quotations, ON DELETE CASCADE)
- `item_id`: uuid (FK, references items)
- `name`: text (copied from item for historical accuracy)
- `quantity`: numeric
- `price`: numeric
- `total`: numeric

### invoices
- `id`: uuid (PK)
- `organization_id`: uuid (FK, references organizations)
- `customer_id`: uuid (FK, references customers)
- `quotation_id`: uuid (FK, references quotations, nullable)
- `number`: text (unique within org, e.g., INV-001)
- `status`: text (draft, sent, paid, overdue, void)
- `issue_date`: date
- `due_date`: date
- `subtotal`: numeric
- `transport_charge`: numeric
- `tax_rate`: numeric
- `tax_amount`: numeric
- `total`: numeric
- `amount_paid`: numeric
- `notes`: text
- `branding_snapshot`: jsonb
- `created_at`: timestamp
- `updated_at`: timestamp

### invoice_items
- `id`: uuid (PK)
- `invoice_id`: uuid (FK, references invoices, ON DELETE CASCADE)
- `name`: text
- `quantity`: numeric
- `price`: numeric
- `total`: numeric

---

## SQL Migration Scripts (Initial)

```sql
-- Enable UUID extension
create extension if not exists "pgcrypto";

-- Organizations
create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  primary_color text default '#0F766E',
  secondary_color text default '#0EA5E9',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  organization_id uuid references organizations on delete set null,
  full_name text,
  avatar_url text,
  role text default 'member',
  created_at timestamp with time zone default now()
);

-- Customers
create table customers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  tax_number text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- Categories
create table categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  name text not null,
  description text
);

-- Items
create table items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations on delete cascade,
  category_id uuid references categories on delete set null,
  name text not null,
  description text,
  unit text,
  price numeric not null default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Row Level Security (RLS) example
alter table customers enable row level security;

create policy "Users can only see their own organization customers"
  on customers for all
  using ( organization_id in (
    select organization_id from profiles where id = auth.uid()
  ));
```
