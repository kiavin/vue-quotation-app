-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  email text,
  phone text,
  logo_url text,
  primary_color text DEFAULT '#0F766E',
  secondary_color text DEFAULT '#0EA5E9',
  accent_color text DEFAULT '#F59E0B',
  address text,
  default_tax_rate numeric DEFAULT 0,
  currency text DEFAULT 'USD',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Organization Members
CREATE TABLE IF NOT EXISTS public.organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  full_name text,
  email text,
  avatar_url text,
  role text DEFAULT 'staff' CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Organization Invitations
CREATE TABLE IF NOT EXISTS public.organization_invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'manager', 'staff')),
  token text UNIQUE NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  accepted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  tax_number text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text
);

-- Items (Catalog)
CREATE TABLE IF NOT EXISTS public.items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  unit text,
  price numeric NOT NULL DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone
);

-- Quotations
CREATE TABLE IF NOT EXISTS public.quotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  number text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'approved', 'rejected', 'expired')),
  date date NOT NULL,
  expiry_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  transport_charge numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  notes text,
  branding_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  UNIQUE(organization_id, number)
);

-- Quotation Items
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id uuid NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.items(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0
);

-- Invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  quotation_id uuid REFERENCES public.quotations(id) ON DELETE SET NULL,
  number text NOT NULL,
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'void')),
  issue_date date NOT NULL,
  due_date date,
  subtotal numeric NOT NULL DEFAULT 0,
  transport_charge numeric NOT NULL DEFAULT 0,
  tax_rate numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  amount_paid numeric NOT NULL DEFAULT 0,
  notes text,
  branding_snapshot jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  UNIQUE(organization_id, number)
);

-- Invoice Items
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  name text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  price numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0
);

-- ==============================================================================
-- 3. INDEXES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_organization_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON public.customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_items_organization_id ON public.items(organization_id);
CREATE INDEX IF NOT EXISTS idx_categories_organization_id ON public.categories(organization_id);
CREATE INDEX IF NOT EXISTS idx_quotations_organization_id ON public.quotations(organization_id);
CREATE INDEX IF NOT EXISTS idx_invoices_organization_id ON public.invoices(organization_id);

-- ==============================================================================
-- 4. FUNCTIONS
-- ==============================================================================

-- Get organization IDs for current user
CREATE OR REPLACE FUNCTION public.user_organizations()
RETURNS setof uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.organization_members WHERE user_id = auth.uid();
$$;

-- Check if current user is an admin or owner
CREATE OR REPLACE FUNCTION public.is_org_admin(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id AND user_id = auth.uid() AND role IN ('owner', 'admin')
  );
END;
$$;

-- Check if current user is owner
CREATE OR REPLACE FUNCTION public.is_org_owner(org_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE organization_id = org_id AND user_id = auth.uid() AND role = 'owner'
  );
END;
$$;

-- ==============================================================================
-- 5. RLS ENABLE
-- ==============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 6. POLICIES
-- ==============================================================================

DO $$ 
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Organizations are visible to members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Any authenticated user can create an organization" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Organization admins can update their organization" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Organization owners can delete their organization" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members are visible to fellow organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can create their own initial membership" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Profiles are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can create their own profile" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update their own profile" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Invitations are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Admins can manage invitations" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Customers are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can create customers" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can update customers" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can delete customers" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Categories are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage categories" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Items are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage items" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Quotations are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage quotations" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Quotation items are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage quotation items" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Invoices are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage invoices" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Invoice items are visible to organization members" ON %I', t);
        EXECUTE format('DROP POLICY IF EXISTS "Members can manage invoice items" ON %I', t);
    END LOOP;
END $$;

-- organizations
CREATE POLICY "Organizations are visible to members" ON public.organizations FOR SELECT USING (id IN (SELECT public.user_organizations()));
CREATE POLICY "Any authenticated user can create an organization" ON public.organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Organization admins can update their organization" ON public.organizations FOR UPDATE USING (public.is_org_admin(id));
CREATE POLICY "Organization owners can delete their organization" ON public.organizations FOR DELETE USING (public.is_org_owner(id));

-- organization_members
CREATE POLICY "Members are visible to fellow organization members" ON public.organization_members FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));
CREATE POLICY "Users can create their own initial membership" ON public.organization_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can manage organization members" ON public.organization_members FOR ALL USING (public.is_org_admin(organization_id));

-- profiles
CREATE POLICY "Profiles are visible to organization members" ON public.profiles FOR SELECT USING (organization_id IN (SELECT public.user_organizations()) OR id = auth.uid());
CREATE POLICY "Users can create their own profile" ON public.profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (id = auth.uid());

-- organization_invitations
CREATE POLICY "Invitations are visible to organization members" ON public.organization_invitations FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));
CREATE POLICY "Admins can manage invitations" ON public.organization_invitations FOR ALL USING (public.is_org_admin(organization_id));

-- customers
CREATE POLICY "Customers are visible to organization members" ON public.customers FOR SELECT USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);
CREATE POLICY "Members can manage customers" ON public.customers FOR ALL USING (organization_id IN (SELECT public.user_organizations()));

-- categories
CREATE POLICY "Categories are visible to organization members" ON public.categories FOR SELECT USING (organization_id IN (SELECT public.user_organizations()));
CREATE POLICY "Members can manage categories" ON public.categories FOR ALL USING (organization_id IN (SELECT public.user_organizations()));

-- items
CREATE POLICY "Items are visible to organization members" ON public.items FOR SELECT USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);
CREATE POLICY "Members can manage items" ON public.items FOR ALL USING (organization_id IN (SELECT public.user_organizations()));

-- quotations
CREATE POLICY "Quotations are visible to organization members" ON public.quotations FOR SELECT USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);
CREATE POLICY "Members can manage quotations" ON public.quotations FOR ALL USING (organization_id IN (SELECT public.user_organizations()));

-- quotation_items
CREATE POLICY "Quotation items are visible to organization members" ON public.quotation_items FOR SELECT USING (quotation_id IN (SELECT id FROM public.quotations WHERE organization_id IN (SELECT public.user_organizations())));
CREATE POLICY "Members can manage quotation items" ON public.quotation_items FOR ALL USING (quotation_id IN (SELECT id FROM public.quotations WHERE organization_id IN (SELECT public.user_organizations())));

-- invoices
CREATE POLICY "Invoices are visible to organization members" ON public.invoices FOR SELECT USING (organization_id IN (SELECT public.user_organizations()) AND deleted_at IS NULL);
CREATE POLICY "Members can manage invoices" ON public.invoices FOR ALL USING (organization_id IN (SELECT public.user_organizations()));

-- invoice_items
CREATE POLICY "Invoice items are visible to organization members" ON public.invoice_items FOR SELECT USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id IN (SELECT public.user_organizations())));
CREATE POLICY "Members can manage invoice items" ON public.invoice_items FOR ALL USING (invoice_id IN (SELECT id FROM public.invoices WHERE organization_id IN (SELECT public.user_organizations())));

-- ==============================================================================
-- 7. STORAGE
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('logos', 'logos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Drop existing storage policies safely
DO $$ BEGIN
    DROP POLICY IF EXISTS "Public read access for logos" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can upload logos" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can update their logos" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can delete their logos" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can view documents" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can upload documents" ON storage.objects;
    DROP POLICY IF EXISTS "Organization members can delete documents" ON storage.objects;
END $$;

-- Logos
CREATE POLICY "Public read access for logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'logos');

CREATE POLICY "Organization members can upload logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members
  )
);

CREATE POLICY "Organization members can update their logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members
  )
);

CREATE POLICY "Organization members can delete their logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'logos'
  AND (storage.foldername(name))[1] IN (
    SELECT organization_id::text FROM public.organization_members
  )
);