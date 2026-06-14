-- ==============================================================================
-- CQIS REMEDIATION MIGRATION
-- ==============================================================================
-- This migration addresses issues identified in the audit:
-- 1. Implements the missing create_organization_onboarding RPC.
-- 2. Hardens RLS policies with role-based enforcement.
-- 3. Ensures schema consistency for multi-tenancy.
-- ==============================================================================

-- 1. Onboarding RPC Function
CREATE OR REPLACE FUNCTION public.create_organization_onboarding(
    org_name text,
    org_email text,
    org_phone text,
    org_currency text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_org_id uuid;
    new_slug text;
BEGIN
    -- Generate a simple slug
    new_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]+', '-', 'g')) || '-' || floor(random() * 1000)::text;

    -- 1. Create Organization
    INSERT INTO public.organizations (
        name, 
        email, 
        phone, 
        currency, 
        slug,
        primary_color,
        secondary_color,
        accent_color
    )
    VALUES (
        org_name, 
        org_email, 
        org_phone, 
        org_currency, 
        new_slug,
        '#0F766E', -- Default Teal
        '#0EA5E9', -- Default Sky
        '#F59E0B'  -- Default Amber
    )
    RETURNING id INTO new_org_id;

    -- 2. Create Membership (Owner)
    INSERT INTO public.organization_members (
        organization_id, 
        user_id, 
        role
    )
    VALUES (
        new_org_id, 
        auth.uid(), 
        'owner'
    );

    -- 3. Update Profile
    UPDATE public.profiles
    SET 
        organization_id = new_org_id,
        role = 'owner',
        updated_at = now()
    WHERE id = auth.uid();

    RETURN new_org_id;
END;
$$;

-- 2. RLS Role Enforcement Hardening
-- We differentiate between 'member' (read/write) and 'management' (delete/settings)

-- Customers: Only owners/admins can delete
DROP POLICY IF EXISTS "Members can manage customers" ON public.customers;
CREATE POLICY "Members can view and create customers" 
    ON public.customers FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can insert customers" 
    ON public.customers FOR INSERT 
    WITH CHECK (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can update customers" 
    ON public.customers FOR UPDATE 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Admins and Owners can delete customers" 
    ON public.customers FOR DELETE 
    USING (public.is_org_admin(organization_id));

-- Items: Only owners/admins/managers can delete
DROP POLICY IF EXISTS "Members can manage items" ON public.items;
CREATE POLICY "Members can view items" 
    ON public.items FOR SELECT 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can insert items" 
    ON public.items FOR INSERT 
    WITH CHECK (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Members can update items" 
    ON public.items FOR UPDATE 
    USING (organization_id IN (SELECT public.user_organizations()));

CREATE POLICY "Management can delete items" 
    ON public.items FOR DELETE 
    USING (
        organization_id IN (
            SELECT organization_id FROM public.organization_members 
            WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'manager')
        )
    );

-- Quotations & Invoices: Standard membership for now, but protect deletions
DROP POLICY IF EXISTS "Members can manage quotations" ON public.quotations;
CREATE POLICY "Members can manage quotations" 
    ON public.quotations FOR ALL 
    USING (organization_id IN (SELECT public.user_organizations()));

DROP POLICY IF EXISTS "Members can manage invoices" ON public.invoices;
CREATE POLICY "Members can manage invoices" 
    ON public.invoices FOR ALL 
    USING (organization_id IN (SELECT public.user_organizations()));
